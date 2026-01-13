import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ComparisonResult } from '../types';

interface Props {
  comparison: ComparisonResult;
}

const ComparisonChart: React.FC<Props> = ({ comparison }) => {
  const data = [
    {
      name: 'Procedimiento 1',
      retencion: comparison.procedure1.retentionCOP,
      neto: comparison.procedure1.netIncome,
      isWinner: comparison.recommendation === 'PROCEDURE_1' || comparison.recommendation === 'EQUAL'
    },
    {
      name: 'Procedimiento 2',
      retencion: comparison.procedure2.retentionCOP,
      neto: comparison.procedure2.netIncome,
      isWinner: comparison.recommendation === 'PROCEDURE_2' || comparison.recommendation === 'EQUAL'
    },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-96 w-full mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Comparativa Visual: ¿Qué llega a tu bolsillo?</h3>
      <p className="text-sm text-gray-500 mb-6">Analiza qué opción maximiza tu ingreso disponible.</p>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            cursor={{fill: '#f9fafb'}}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          
          {/* Ingreso Neto (Lo importante) */}
          <Bar dataKey="neto" name="Ingreso Neto (Disponible)" radius={[6, 6, 0, 0]} barSize={50}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isWinner ? '#34A853' : '#a8dab5'} 
                cursor="pointer"
              />
            ))}
          </Bar>

          {/* Retención (El costo) */}
          <Bar dataKey="retencion" name="Impuesto (Retención)" radius={[6, 6, 0, 0]} barSize={50} fill="#EA4335" fillOpacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;