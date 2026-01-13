import React, { useState, useEffect, useMemo } from 'react';
import { TaxInputs, TaxResult } from '../types';
import { calculateTax } from '../utils/taxLogic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calculator, TrendingDown, AlertCircle, Copy, DollarSign, Activity, CheckCircle2 } from 'lucide-react';

interface Props {
  baseInputs: TaxInputs;
  fixedRateP2: number;
}

interface MonthlyData {
  month: string;
  income: number;
  p1Retention: number;
  p2Retention: number;
  p1Net: number;
  p2Net: number;
  diff: number; // P1 Retention - P2 Retention
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MonthlySimulation: React.FC<Props> = ({ baseInputs, fixedRateP2 }) => {
  // Initialize with the base monthly salary from the main calculator OR pre-loaded simulation data
  const [incomes, setIncomes] = useState<number[]>(
    baseInputs.simulationMonthlies && baseInputs.simulationMonthlies.length === 12
      ? baseInputs.simulationMonthlies
      : Array(12).fill(baseInputs.monthlySalary)
  );

  const [simulationData, setSimulationData] = useState<MonthlyData[]>([]);
  const [totals, setTotals] = useState({ p1: 0, p2: 0, diff: 0 });

  // Update effect to handle external updates to simulation data (e.g. reloading the demo)
  useEffect(() => {
    if (baseInputs.simulationMonthlies && baseInputs.simulationMonthlies.length === 12) {
        setIncomes(baseInputs.simulationMonthlies);
    } else if (incomes.every(i => i === 0) && baseInputs.monthlySalary > 0) {
        // Only default to monthlySalary if incomes are empty/zero and no explicit simulation data is provided
        setIncomes(Array(12).fill(baseInputs.monthlySalary));
    }
  }, [baseInputs.monthlySalary, baseInputs.simulationMonthlies]);

  useEffect(() => {
    const newData: MonthlyData[] = incomes.map((income, index) => {
      // Create temporary inputs for P1 calculation (Recalculate deductions based on this month's income)
      const monthInputs = { ...baseInputs, monthlySalary: income, otherIncome: 0 };
      const resP1 = calculateTax(monthInputs, 1);
      
      // Calculate P2 using the fixed rate passed from parent
      // We manually set procedure2Rate to ensure it uses the fixed percentage
      const p2Inputs = { ...monthInputs, procedure2Rate: fixedRateP2 };
      const resP2 = calculateTax(p2Inputs, 2);

      return {
        month: MONTHS[index],
        income,
        p1Retention: resP1.retentionCOP,
        p2Retention: resP2.retentionCOP,
        p1Net: resP1.netIncome,
        p2Net: resP2.netIncome,
        diff: resP1.retentionCOP - resP2.retentionCOP
      };
    });

    setSimulationData(newData);

    const newTotals = newData.reduce((acc, curr) => ({
      p1: acc.p1 + curr.p1Retention,
      p2: acc.p2 + curr.p2Retention,
      diff: acc.diff + curr.diff
    }), { p1: 0, p2: 0, diff: 0 });

    setTotals(newTotals);

  }, [incomes, baseInputs, fixedRateP2]);

  // Stability Analysis Logic
  const stabilityAnalysis = useMemo(() => {
    if (simulationData.length === 0) return null;

    const calculateStdDev = (values: number[]) => {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    };

    const netIncomeP1 = simulationData.map(d => d.p1Net);
    const netIncomeP2 = simulationData.map(d => d.p2Net);

    const stdDevP1 = calculateStdDev(netIncomeP1);
    const stdDevP2 = calculateStdDev(netIncomeP2);

    // Lower Standard Deviation means less volatility -> More Stable
    const winner = stdDevP1 < stdDevP2 ? 'Procedimiento 1' : 'Procedimiento 2';
    const isTie = Math.abs(stdDevP1 - stdDevP2) < 1000; // Ignore negligible differences

    return {
        stdDevP1,
        stdDevP2,
        winner: isTie ? 'Empate' : winner,
        percentDifference: isTie ? 0 : (Math.abs(stdDevP1 - stdDevP2) / Math.max(stdDevP1, stdDevP2)) * 100
    };
  }, [simulationData]);


  const handleIncomeChange = (index: number, value: string) => {
    const val = value === '' ? 0 : parseFloat(value.replace(/\D/g, ''));
    const newIncomes = [...incomes];
    newIncomes[index] = val;
    setIncomes(newIncomes);
  };

  const copyToAll = () => {
    const firstVal = incomes[0];
    setIncomes(Array(12).fill(firstVal));
  };

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#4285F4]" />
                  Proyección Anual Mes a Mes
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Simula picos de ingresos (bonos/comisiones). El <strong className="text-[#4285F4]">Procedimiento 2</strong> mantiene tu tasa fija del <span className="bg-[#4285F4]/10 text-[#4285F4] px-1.5 py-0.5 rounded font-bold">{fixedRateP2.toFixed(2)}%</span>.
                </p>
            </div>
            <button 
                onClick={copyToAll}
                className="group flex items-center gap-2 text-sm text-[#4285F4] bg-white border border-[#4285F4]/30 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm active:scale-95"
            >
                <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Copiar Enero a todo el año
            </button>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {incomes.map((inc, idx) => (
                <div key={idx} className="flex flex-col group">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider group-focus-within:text-[#4285F4] transition-colors">
                      {MONTHS[idx]}
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4285F4] transition-colors">
                           <DollarSign className="w-4 h-4" />
                        </div>
                        <input 
                            type="text"
                            value={inc === 0 ? '' : formatCOP(inc).replace('$','').trim()}
                            onChange={(e) => handleIncomeChange(idx, e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-[#4285F4] focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-300 hover:border-gray-400"
                            placeholder="0"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Comparison Cards: Savings & Stability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NEW: Savings Analysis Card */}
        <div className={`rounded-xl p-5 relative overflow-hidden border border-l-4 shadow-sm ${Math.abs(totals.diff) > 0 ? (totals.diff > 0 ? 'bg-blue-50/50 border-blue-500 from-blue-50 to-white' : 'bg-green-50/50 border-green-500 from-green-50 to-white') : 'bg-gray-50 border-gray-300'}`}>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start gap-3 mb-4">
                   <div className={`p-3 rounded-full shadow-sm ${totals.diff > 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      <DollarSign className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className={`font-bold text-lg ${totals.diff > 0 ? 'text-blue-900' : 'text-green-900'}`}>Opción Más Económica</h3>
                      <p className="text-gray-600 text-sm mt-1">
                         La opción que te hace pagar menos impuestos al año.
                      </p>
                   </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-xl border border-gray-200/50 shadow-sm">
                   <div className="flex justify-between items-center">
                      <div>
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mejor Opción</p>
                         <p className={`text-xl font-bold flex items-center gap-2 ${totals.diff > 0 ? 'text-blue-600' : totals.diff < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {Math.abs(totals.diff) < 1000 ? 'Empate Técnico' : (totals.diff > 0 ? 'Procedimiento 2' : 'Procedimiento 1')}
                         </p>
                      </div>
                      {Math.abs(totals.diff) > 1000 && (
                          <div className="text-right">
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ahorro Anual</p>
                             <p className="text-xl font-bold text-gray-800">{formatCOP(Math.abs(totals.diff))}</p>
                          </div>
                      )}
                   </div>
                </div>
             </div>
        </div>

        {/* Existing: Stability Analysis Card */}
        {stabilityAnalysis && stabilityAnalysis.winner !== 'Empate' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500 rounded-xl p-5 relative overflow-hidden shadow-sm">
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start gap-3 mb-4">
                     <div className="p-3 bg-indigo-100 rounded-full shadow-sm text-indigo-600">
                        <Activity className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="font-bold text-indigo-900 text-lg">Opción Más Estable</h3>
                        <p className="text-indigo-700/80 text-sm mt-1">
                           Menor variación en tu sueldo neto mensual.
                        </p>
                     </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm px-5 py-4 rounded-xl border border-indigo-100 shadow-sm mt-auto">
                      <div>
                         <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Mejor Opción</p>
                         <p className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                             {stabilityAnalysis.winner}
                         </p>
                         <p className="text-xs text-indigo-400 mt-2">
                            {stabilityAnalysis.percentDifference.toFixed(1)}% más predecible mes a mes.
                         </p>
                      </div>
                  </div>
               </div>
            </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Año - Proc 1</h3>
            <p className="text-3xl font-bold text-gray-800 tracking-tight">{formatCOP(totals.p1)}</p>
            <div className="mt-2 text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-1 rounded-md">
               Suma de retenciones variables
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-[#4285F4] uppercase tracking-wider mb-2">Total Año - Proc 2</h3>
            <p className="text-3xl font-bold text-[#4285F4] tracking-tight">{formatCOP(totals.p2)}</p>
             <div className="mt-2 text-xs text-[#4285F4] font-medium bg-blue-50 inline-block px-2 py-1 rounded-md border border-blue-100">
               Tasa Fija {fixedRateP2.toFixed(2)}%
            </div>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border-l-4 ${totals.diff > 0 ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500'} bg-white`}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diferencia Neta Anual</h3>
            <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold tracking-tight ${totals.diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.diff > 0 ? formatCOP(totals.diff) : formatCOP(totals.diff)}
                </p>
                {totals.diff > 0 && <TrendingDown className="w-6 h-6 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
                {totals.diff > 0 ? 'Ahorro proyectado usando Procedimiento 2' : 'Pagarías menos con Procedimiento 1'}
            </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
           <TrendingDown className="w-4 h-4 text-gray-400" />
           Curva de Impuestos (Acumulado)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulationData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                   formatter={(val: number) => formatCOP(val)} 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                   cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Line type="monotone" dataKey="p1Retention" name="Retención Proc 1" stroke="#34A853" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="p2Retention" name="Retención Proc 2" stroke="#4285F4" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
            </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Mes</th>
                        <th className="px-6 py-4">Ingreso Total</th>
                        <th className="px-6 py-4">Retención Proc 1</th>
                        <th className="px-6 py-4 text-[#4285F4]">Retención Proc 2</th>
                        <th className="px-6 py-4 text-right">Diferencia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {simulationData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-800">{row.month}</td>
                            <td className="px-6 py-4 text-gray-600 font-medium">{formatCOP(row.income)}</td>
                            <td className="px-6 py-4 text-gray-600 font-medium">{formatCOP(row.p1Retention)}</td>
                            <td className="px-6 py-4 font-bold text-[#4285F4] bg-[#4285F4]/5">{formatCOP(row.p2Retention)}</td>
                            <td className={`px-6 py-4 text-right font-bold ${row.diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {row.diff > 0 ? '+' : ''}{formatCOP(row.diff)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySimulation;