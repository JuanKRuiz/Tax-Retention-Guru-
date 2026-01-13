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
    },
    {
      name: 'Procedimiento 2',
      retencion: comparison.procedure2.retentionCOP,
      neto: comparison.procedure2.netIncome,
    },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-80 w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Proyección de Flujo de Caja Mensual</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            cursor={{fill: '#f9fafb'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          {/* Google Green for Net Income */}
          <Bar dataKey="neto" name="Ingreso Neto (Bolsillo)" stackId="a" fill="#34A853" radius={[0, 0, 4, 4]} barSize={60} />
          {/* Google Red for Retention/Tax */}
          <Bar dataKey="retencion" name="Retención (Impuesto)" stackId="a" fill="#EA4335" radius={[4, 4, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;