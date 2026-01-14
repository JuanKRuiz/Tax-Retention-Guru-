import React, { useState, useEffect } from 'react';
import { TaxInputs, ComparisonResult, Tab } from './types';
import { calculateTax } from './utils/taxLogic';
import InputForm from './components/InputForm';
import ComparisonChart from './components/ComparisonChart';
import Advisor from './components/Advisor';
import MonthlySimulation from './components/MonthlySimulation';
import { Calculator, AlertTriangle, FileText, TrendingDown, Zap, Calendar, BarChart2, ArrowRight, Lock, User, PlayCircle, GraduationCap, Linkedin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CALCULATOR);
  const [inputs, setInputs] = useState<TaxInputs>({
    monthlySalary: 0,
    otherIncome: 0,
    voluntaryPension: 0,
    afcContribution: 0,
    housingInterest: 0,
    prepaidMedicine: 0,
    hasDependents: false,
    isSalarioIntegral: false, // Default false
    procedure2Rate: 0,
    historicalMonthlyIncome: 0
  });

  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Auto calculate when inputs change
  useEffect(() => {
    // Calculamos siempre que haya salario actual O histórico
    if (inputs.monthlySalary > 0 || (inputs.historicalMonthlyIncome && inputs.historicalMonthlyIncome > 0)) {
      const p1 = calculateTax(inputs, 1);
      const p2 = calculateTax(inputs, 2);
      
      let recommendation: 'PROCEDURE_1' | 'PROCEDURE_2' | 'EQUAL' = 'EQUAL';
      const diff = p1.retentionCOP - p2.retentionCOP;
      
      if (diff < -100) recommendation = 'PROCEDURE_1'; // P1 es menor
      else if (diff > 100) recommendation = 'PROCEDURE_2'; // P2 es menor

      setResult({
        procedure1: p1,
        procedure2: p2,
        recommendation,
        difference: Math.abs(diff)
      });
    } else {
      setResult(null);
    }
  }, [inputs]);

  const loadScenario = () => {
    // Escenario DEMO
    setInputs({
      monthlySalary: 15000000, // Salario Base Ejemplo
      otherIncome: 0, 
      voluntaryPension: 1000000,
      afcContribution: 500000, 
      housingInterest: 1200000, 
      prepaidMedicine: 450000,
      hasDependents: true,
      isSalarioIntegral: true,
      procedure2Rate: 0, 
      historicalMonthlyIncome: 18000000,
      simulationMonthlies: [
        15000000, 25000000, 16000000, 15000000, 
        15000000, 22000000, 15000000, 15000000, 
        15000000, 15000000, 30000000, 15000000
      ]
    });
  };

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val: number) => val.toFixed(2) + '%';

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-inter">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-[#4285F4] p-2 rounded-lg shadow-sm rotate-3 transition-transform hover:rotate-0">
                 <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">Retención Guru 2026</span>
              <span className="font-bold text-xl text-gray-900 tracking-tight sm:hidden">ReteGuru</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab(Tab.CALCULATOR)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === Tab.CALCULATOR ? 'bg-blue-50 text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Calculadora
              </button>
              <button 
                onClick={() => setActiveTab(Tab.SIMULATION)}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === Tab.SIMULATION ? 'bg-blue-50 text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <BarChart2 className="w-4 h-4"/>
                Simulación
                {result && !inputs.procedure2Rate && activeTab !== Tab.SIMULATION && (
                   <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4285F4]"></span>
                   </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab(Tab.ADVISOR)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === Tab.ADVISOR ? 'bg-blue-50 text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Asesor IA
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 w-full">
        
        {activeTab === Tab.CALCULATOR && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Input */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-[#4285F4] to-[#2b6cb0] rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                     <h1 className="text-2xl font-bold">Simulador 2026</h1>
                     <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border-2 border-orange-500 animate-pulse transition-all">UVT $52.374</span>
                  </div>
                  <p className="opacity-90 mb-4 text-sm text-blue-50">Configura tus ingresos para ver la comparativa.</p>
                  
                  <button 
                    onClick={loadScenario}
                    className="flex items-center gap-2 bg-white text-[#4285F4] px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto justify-center active:scale-95"
                  >
                    <PlayCircle className="w-4 h-4 fill-current" />
                    Cargar Demo (Ejemplo)
                  </button>
                </div>
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
              </div>

              <InputForm inputs={inputs} setInputs={setInputs} onCalculate={() => {}} />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border-2 border-gray-100 border-dashed p-12 min-h-[400px]">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                     <Calculator className="w-12 h-12 opacity-30 text-gray-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-500">Resultados del Cálculo</p>
                  <p className="text-sm text-center max-w-xs mt-2 text-gray-400">Ingresa tus datos o usa el botón de "Demo" para ver la magia.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Recommendation Card */}
                  <div className={`rounded-xl p-6 shadow-md border-l-8 transition-colors duration-300 ${result.recommendation === 'PROCEDURE_1' ? 'bg-[#34A853]/10 border-[#34A853]' : result.recommendation === 'PROCEDURE_2' ? 'bg-[#4285F4]/10 border-[#4285F4]' : 'bg-gray-50 border-gray-400'}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                       {result.recommendation === 'EQUAL' ? (
                         <span className="text-gray-700">Impuesto idéntico en ambos métodos</span>
                       ) : (
                         <>
                           <span className={result.recommendation === 'PROCEDURE_1' ? 'text-[#34A853]' : 'text-[#4285F4]'}>
                             Ahorras dinero con el {result.recommendation === 'PROCEDURE_1' ? 'Procedimiento 1' : 'Procedimiento 2'}
                           </span>
                           <TrendingDown className="w-5 h-5" />
                         </>
                       )}
                    </h2>
                    {result.recommendation !== 'EQUAL' && (
                       <p className="text-gray-700">
                         Diferencia a favor: <span className="font-bold text-lg">{formatCOP(result.difference)}</span>
                       </p>
                    )}
                    {result.recommendation === 'EQUAL' && !inputs.historicalMonthlyIncome && (
                         <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1 bg-white/50 p-2 rounded-lg">
                             <AlertTriangle className="w-3 h-3" />
                             Ingresa tu "Salario Promedio Últimos 12 Meses" para ver si tu tasa fija (Proc 2) es menor a la actual.
                         </p>
                    )}
                  </div>
                  
                  {/* CTA for Simulation */}
                  <div className="bg-gradient-to-r from-[#4285F4]/5 to-[#4285F4]/10 border border-[#4285F4]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-full shadow-sm text-[#4285F4] border border-blue-100">
                        <BarChart2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">¿Tienes ingresos variables?</h4>
                        <p className="text-xs text-gray-600">Simula tu retención anual con bonos o comisiones.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab(Tab.SIMULATION)}
                      className="w-full sm:w-auto whitespace-nowrap px-4 py-2.5 bg-[#4285F4] text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 group"
                    >
                      Ver Proyección Anual <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Proc 1 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#34A853]/50 transition-colors">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-bold text-gray-800">1</span>
                      </div>
                      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Procedimiento 1 (Mes a Mes)</h3>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatCOP(result.procedure1.retentionCOP)}</div>
                      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/> Calculado solo con ingresos de este mes
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                         <span className="text-sm text-gray-600">Neto:</span>
                         <span className="text-sm font-bold text-[#34A853]">{formatCOP(result.procedure1.netIncome)}</span>
                      </div>
                    </div>

                    {/* Proc 2 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-[#4285F4]/50 transition-colors">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl font-bold text-[#4285F4]">2</span>
                      </div>
                      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Procedimiento 2 (Fijo)</h3>
                      <div className="text-3xl font-bold text-[#4285F4] mb-1">{formatCOP(result.procedure2.retentionCOP)}</div>
                      <div className="flex items-center gap-2 mb-4">
                          <span className="bg-[#4285F4]/10 text-[#4285F4] text-xs font-bold px-2 py-1 rounded">
                              Tasa Fija: {formatPercent(result.procedure2.effectiveRate || 0)}
                          </span>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                         <span className="text-sm text-gray-600">Neto:</span>
                         <span className="text-sm font-bold text-[#34A853]">{formatCOP(result.procedure2.netIncome)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Breakdown Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Depuración Base Gravable (Mes Actual)</h3>
                        <span className="text-xs text-gray-500 bg-white border px-2 py-1 rounded shadow-sm">Ingresos: {formatCOP(result.procedure1.details.grossIncome)}</span>
                     </div>
                     <div className="p-6 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead>
                              <tr className="text-gray-500 border-b">
                                 <th className="pb-3 font-medium">Concepto</th>
                                 <th className="pb-3 font-medium text-right">Valor</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y">
                              <tr>
                                 <td className="py-3 text-gray-700">Salud y Pensión Obligatoria</td>
                                 <td className="py-3 text-right text-[#EA4335]">-{formatCOP(result.procedure1.details.healthPensionSolidarity)}</td>
                              </tr>
                              <tr>
                                 <td className="py-3 text-gray-700">Deducciones (Vivienda, Medicina, etc)</td>
                                 <td className="py-3 text-right text-[#EA4335]">-{formatCOP(result.procedure1.details.totalDeductions)}</td>
                              </tr>
                              <tr>
                                 <td className="py-3 text-gray-700">Rentas Exentas (25%)</td>
                                 <td className="py-3 text-right text-[#EA4335]">-{formatCOP(result.procedure1.details.exemptIncome25)}</td>
                              </tr>
                              <tr className="bg-gray-50 font-bold">
                                 <td className="py-3 text-gray-900">Base Gravable Final</td>
                                 <td className="py-3 text-right text-gray-900">{formatCOP(result.procedure1.details.finalBase)}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Chart */}
                  <ComparisonChart comparison={result} />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* NEW TAB RENDER */}
        {activeTab === Tab.SIMULATION && result && (
             <div className="max-w-6xl mx-auto">
                 <MonthlySimulation 
                    baseInputs={inputs} 
                    fixedRateP2={result.procedure2.effectiveRate || 0} 
                 />
             </div>
        )}
        {activeTab === Tab.SIMULATION && !result && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">Faltan Datos</h3>
                <p className="text-gray-500">Por favor ve a la Calculadora e ingresa tu información base (Salario e Histórico) primero.</p>
                <button 
                  onClick={() => setActiveTab(Tab.CALCULATOR)}
                  className="mt-4 px-6 py-2 bg-[#4285F4] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                >
                    Ir a Calculadora
                </button>
            </div>
        )}

        {activeTab === Tab.ADVISOR && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900">Asesoría Legal Inteligente</h2>
                <p className="text-gray-500 mt-2">Pregunta sobre normas, beneficios y cómo optimizar tu retención según el Estatuto Tributario.</p>
             </div>
             <Advisor />
          </div>
        )}

      </main>

      {/* Footer Legal & Credits */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
         <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
               <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                     <Lock className="w-5 h-5 text-blue-500" />
                     <span>Privacidad y Seguridad</span>
                  </div>
                  <p className="text-xs text-blue-800/80 leading-relaxed">
                     Esta aplicación se ejecuta completamente en tu navegador. Tus datos financieros <strong>nunca</strong> son enviados a ningún servidor ni base de datos externa. No se guarda historial de navegación.
                  </p>
               </div>
               
               <div className="space-y-3 bg-orange-50/50 p-4 rounded-lg border-l-4 border-orange-400">
                  <div className="flex items-center gap-2 text-orange-900 font-bold">
                     <AlertTriangle className="w-5 h-5 text-orange-500" />
                     <span>Descargo de Responsabilidad</span>
                  </div>
                  <p className="text-xs text-orange-800/80 leading-relaxed">
                     <strong>No soy contador público.</strong> Esta herramienta es un simulador con fines educativos basado en la normativa colombiana (2026). No me hago responsable por decisiones financieras tomadas basadas en estos resultados. Consulta a un experto.
                  </p>
               </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
               <div className="flex flex-col md:flex-row items-center gap-3 bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-medium text-gray-600">Hecho por <a href="https://www.linkedin.com/in/juankruiz" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[#4285F4] transition-colors">JuanK Ruiz</a> con el poder de</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                     <Sparkles className="w-3 h-3 text-purple-600" />
                     <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Antigravity</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">Antigravity - Google Intelligent IDE</span>
               </div>
               <div className="text-[10px] text-gray-400">
                  © 2026 Retención Guru • juankruiz@google.com • juank.ruiz@gmail.com
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;