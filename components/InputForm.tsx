import React from 'react';
import { TaxInputs } from '../types';
import { DollarSign, Users, Heart, Home, TrendingUp, ShieldCheck, Banknote, History, Check, Briefcase, Info } from 'lucide-react';

interface Props {
  inputs: TaxInputs;
  setInputs: React.Dispatch<React.SetStateAction<TaxInputs>>;
  onCalculate: () => void;
}

interface InputFieldProps {
  label: string;
  value: number;
  field: keyof TaxInputs;
  icon: any;
  placeholder?: string;
  onChange: (field: keyof TaxInputs, value: string) => void;
  subLabel?: string;
}

const InputField = ({ 
  label, 
  value, 
  field, 
  icon: Icon, 
  placeholder = "$ 0",
  onChange,
  subLabel
}: InputFieldProps) => {

  const formatCurrency = (val: number) => {
    if (!val && val !== 0) return '';
    if (val === 0) return ''; 
    return '$ ' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    onChange(field, rawValue);
  };

  return (
    <div className="group">
      <div className="flex flex-col mb-2 ml-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
          </label>
          {subLabel && <span className="text-[10px] text-gray-400 font-medium leading-tight">{subLabel}</span>}
      </div>
      
      <div className="relative transition-all duration-200 focus-within:transform focus-within:-translate-y-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-[#4285F4] transition-colors" />
        </div>
        <input
          type="text"
          inputMode="numeric"
          className="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#4285F4] focus:border-transparent outline-none transition-all shadow-sm text-left"
          placeholder={placeholder}
          value={formatCurrency(value)}
          onChange={handleLocalChange}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm font-medium">COP</span>
        </div>
      </div>
    </div>
  );
};

const InputForm: React.FC<Props> = ({ inputs, setInputs }) => {
  const handleChange = (field: keyof TaxInputs, value: string | boolean) => {
    let finalValue: any = value;
    if (typeof value === 'string') {
      finalValue = value === '' ? 0 : parseFloat(value);
    }
    setInputs(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleInputChange = (field: keyof TaxInputs, value: string) => {
    handleChange(field, value);
  };

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN DE INGRESOS ACTUALES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#34A853]/10 flex items-center gap-3">
          <div className="p-2 bg-white text-[#34A853] rounded-lg shadow-sm">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Este Mes (A Calcular)</h3>
            <p className="text-xs text-gray-500">Ingresos laborales gravados (Art. 385 y Art. 103 E.T.)</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          
          {/* Salario Integral Toggle */}
          <div 
            onClick={() => handleChange('isSalarioIntegral', !inputs.isSalarioIntegral)}
            className={`
              relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200
              ${inputs.isSalarioIntegral
                ? 'bg-blue-50 border-[#4285F4]/30 ring-1 ring-[#4285F4]' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${inputs.isSalarioIntegral ? 'bg-blue-100 text-[#4285F4]' : 'bg-gray-100 text-gray-400'}`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold ${inputs.isSalarioIntegral ? 'text-[#4285F4]' : 'text-gray-700'}`}>
                  ¿Es Salario Integral?
                </span>
                <span className="text-xs text-gray-500">Cotiza seguridad social sobre el 70%</span>
              </div>
            </div>
            <div className={`
              w-6 h-6 rounded-full border flex items-center justify-center transition-colors
              ${inputs.isSalarioIntegral ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-300 bg-white'}
            `}>
              {inputs.isSalarioIntegral && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <InputField 
              label="Salario Básico Mes Actual" 
              subLabel="Rentas de trabajo ordinarias (Art. 103 E.T.)"
              value={inputs.monthlySalary} 
              field="monthlySalary" 
              icon={DollarSign} 
              onChange={handleInputChange}
            />
            <InputField 
              label="Otros Ingresos Este Mes" 
              subLabel="Primas, bonificaciones, horas extras (Art. 127 E.T.)"
              value={inputs.otherIncome} 
              field="otherIncome" 
              icon={TrendingUp} 
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

       {/* SECCIÓN PROCEDIMIENTO 2 - HISTÓRICO */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
         {/* Highlight ribbon */}
         <div className="absolute top-0 left-0 w-1 h-full bg-[#FBBC04]"></div>
         
         <div className="px-6 py-4 border-b border-gray-100 bg-[#FBBC04]/5 flex items-center gap-3">
            <div className="p-2 bg-white text-[#FBBC04] rounded-lg shadow-sm border border-[#FBBC04]/20">
               <History className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <h3 className="font-bold text-gray-800">Cálculo Tasa Fija (Proc. 2)</h3>
               <p className="text-xs text-gray-500">
                  Promedio de los 12 meses anteriores.
               </p>
            </div>
         </div>
         
         {/* Alerta de Contexto LATAM Payroll */}
         <div className="px-6 pt-4">
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3 items-start">
                 <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                 <div>
                     <h4 className="text-xs font-bold text-yellow-800 uppercase">Normativa General</h4>
                     <p className="text-[11px] text-yellow-700 leading-relaxed">
                        Para el cálculo de <strong>Enero (Semestre 1)</strong>, se toman los ingresos con corte a <strong>Noviembre</strong> del año anterior. 
                        Para el <strong>Semestre 2</strong>, se toma el corte a <strong>Mayo</strong>.
                     </p>
                 </div>
             </div>
         </div>

         <div className="p-6">
            <InputField 
               label="Promedio Mensual (Últimos 12 Meses)" 
               subLabel="Calculado según fechas de corte (Nov/Mayo)"
               value={inputs.historicalMonthlyIncome || 0} 
               field="historicalMonthlyIncome" 
               icon={History} 
               placeholder="Promedio año anterior"
               onChange={handleInputChange}
            />
         </div>
      </div>

      {/* SECCIÓN DE DEDUCCIONES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#4285F4]/10 flex items-center gap-3">
          <div className="p-2 bg-white text-[#4285F4] rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Deducciones de Ley</h3>
            <p className="text-xs text-gray-500">Deducciones y Rentas Exentas permitidas (Art. 387, 126-1, 126-4 E.T.)</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Dependents Toggle */}
          <div 
            onClick={() => handleChange('hasDependents', !inputs.hasDependents)}
            className={`
              relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200
              ${inputs.hasDependents 
                ? 'bg-blue-50 border-[#4285F4]/30 ring-1 ring-[#4285F4]' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${inputs.hasDependents ? 'bg-blue-100 text-[#4285F4]' : 'bg-gray-100 text-gray-400'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold ${inputs.hasDependents ? 'text-[#4285F4]' : 'text-gray-700'}`}>
                  ¿Tienes personas a cargo?
                </span>
                <span className="text-xs text-gray-500">Deducción del 10% ingresos brutos (Art. 387 E.T.)</span>
              </div>
            </div>
            <div className={`
              w-6 h-6 rounded-full border flex items-center justify-center transition-colors
              ${inputs.hasDependents ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-300 bg-white'}
            `}>
              {inputs.hasDependents && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField 
              label="Intereses de Vivienda" 
              subLabel="Créditos hipotecarios o leasing (Art. 119 y 387 E.T.)"
              value={inputs.housingInterest} 
              field="housingInterest" 
              icon={Home} 
              onChange={handleInputChange}
            />
            <InputField 
              label="Medicina Prepagada" 
              subLabel="Pagos salud adicional (Art. 387 E.T. - Inciso 2)"
              value={inputs.prepaidMedicine} 
              field="prepaidMedicine" 
              icon={Heart} 
              onChange={handleInputChange}
            />
            <InputField 
              label="Aportes Voluntarios (AFC/Pensión)" 
              subLabel="Rentas exentas (Art. 126-1 y 126-4 E.T.)"
              value={inputs.voluntaryPension} 
              field="voluntaryPension" 
              icon={ShieldCheck} 
              onChange={handleInputChange}
            />
          </div>
          
           {/* Collapsible Manual Override for P2 Rate */}
           <div className="pt-4 border-t border-gray-100">
               <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-400 hover:text-gray-600 list-none">
                     <span>▶ Opciones Avanzadas (Definir % manual)</span>
                  </summary>
                  <div className="mt-4 pl-4 border-l-2 border-gray-100">
                     <div className="group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                          Porcentaje Fijo Manual
                        </label>
                        <div className="relative max-w-[180px]">
                           <input
                             type="number"
                             className="block w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FBBC04] focus:border-transparent outline-none text-sm text-gray-900 font-semibold text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                             placeholder="0"
                             value={inputs.procedure2Rate || ''}
                             onChange={(e) => handleChange('procedure2Rate', e.target.value)}
                           />
                           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                             <span className="text-gray-500 font-bold">%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </details>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;