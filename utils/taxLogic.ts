import { UVT_VALUE, SMMLV_VALUE, LIMITS, TAX_BRACKETS } from '../constants';
import { TaxInputs, TaxResult } from '../types';

// Helper to run the core logic without recursion loops
const calculateBaseAndTax = (
  income: number, 
  inputs: TaxInputs, 
  isHistoricalSimulation: boolean = false
) => {
  const {
    voluntaryPension,
    afcContribution,
    housingInterest,
    prepaidMedicine,
    hasDependents,
    isSalarioIntegral
  } = inputs;

  const grossIncome = income;

  // --- 1. INGRESOS NO CONSTITUTIVOS DE RENTA (INCRNG) ---
  // Para Salario Integral, la base de cotización (IBC) es el 70% del salario, pero topado a 25 SMMLV.
  // Para salario ordinario, es el 100%, topado a 25 SMMLV.
  let ibcRaw = grossIncome;
  if (isSalarioIntegral) {
    ibcRaw = grossIncome * 0.70;
  }
  
  const ibcBase = Math.min(ibcRaw, 25 * SMMLV_VALUE); 
  
  const health = ibcBase * 0.04;
  const pension = ibcBase * 0.04;

  // Fondo de Solidaridad Pensional (FSP)
  // Se calcula sobre el IBC (si es integral, sobre el 70%, si es ordinario sobre el 100%)
  // Nota: La norma dice que FSP aplica si el Ingreso Base de Cotización > 4 SMMLV.
  let solidarityRate = 0;
  // Usamos ibcRaw para determinar el rango, pero el tope de 25 SMMLV aplica para el cálculo del valor
  if (ibcBase >= 4 * SMMLV_VALUE) {
    solidarityRate = 0.01; 
    if (ibcBase >= 16 * SMMLV_VALUE && ibcBase < 17 * SMMLV_VALUE) solidarityRate += 0.002;
    else if (ibcBase >= 17 * SMMLV_VALUE && ibcBase < 18 * SMMLV_VALUE) solidarityRate += 0.004;
    else if (ibcBase >= 18 * SMMLV_VALUE && ibcBase < 19 * SMMLV_VALUE) solidarityRate += 0.006;
    else if (ibcBase >= 19 * SMMLV_VALUE && ibcBase < 20 * SMMLV_VALUE) solidarityRate += 0.008;
    else if (ibcBase >= 20 * SMMLV_VALUE) solidarityRate += 0.01;
  }
  const solidarity = ibcBase * solidarityRate;
  
  const totalINCRNG = health + pension + solidarity;
  const netIncome = grossIncome - totalINCRNG;

  // --- 2. DEDUCCIONES ---
  const valHousing = Math.min(housingInterest, LIMITS.HOUSING_INTEREST_UVT * UVT_VALUE);
  const valMedicine = Math.min(prepaidMedicine, LIMITS.PREPAID_MEDICINE_UVT * UVT_VALUE);
  const valDependents = hasDependents 
    ? Math.min(grossIncome * LIMITS.DEPENDENTS_RATE, LIMITS.DEPENDENTS_UVT * UVT_VALUE) 
    : 0;

  const maxVoluntary = grossIncome * LIMITS.VOLUNTARY_PENSION_RATE_LIMIT;
  const valVoluntary = Math.min(voluntaryPension + afcContribution, maxVoluntary);
  
  const totalDeductionsAndVoluntary = valHousing + valMedicine + valDependents + valVoluntary;

  // --- 3. RENTA EXENTA 25% ---
  const baseForExempt25 = Math.max(0, netIncome - totalDeductionsAndVoluntary);
  let exempt25 = baseForExempt25 * LIMITS.EXEMPT_INCOME_RATE;
  const exempt25MonthlyCap = (LIMITS.EXEMPT_INCOME_CAP_UVT_ANNUAL * UVT_VALUE) / 12;
  exempt25 = Math.min(exempt25, exempt25MonthlyCap);

  // --- 4. LÍMITE 40% ---
  const totalClaimed = totalDeductionsAndVoluntary + exempt25;
  const limit40Percent = netIncome * LIMITS.GLOBAL_LIMIT_RATE;
  const limit40AbsoluteMonthly = (LIMITS.GLOBAL_LIMIT_UVT_ANNUAL * UVT_VALUE) / 12;
  const finalLimit = Math.min(limit40Percent, limit40AbsoluteMonthly);
  
  const finalDeductionAmount = Math.min(totalClaimed, finalLimit);

  // --- 5. BASE GRAVABLE ---
  const baseGravableCOP = Math.max(0, netIncome - finalDeductionAmount);
  const baseGravableUVT = baseGravableCOP / UVT_VALUE;

  // --- 6. IMPUESTO SEGÚN TABLA (Siempre se calcula para hallar la tasa implícita) ---
  let retentionUVT_Table = 0;
  const bracket = TAX_BRACKETS.find(b => baseGravableUVT >= b.min && baseGravableUVT < b.max);
  if (bracket) {
    retentionUVT_Table = ((baseGravableUVT - bracket.min) * bracket.rate) + bracket.subtract;
  }

  return {
    baseGravableUVT,
    baseGravableCOP,
    retentionUVT_Table,
    totalINCRNG,
    grossIncome,
    totalDeductions: totalDeductionsAndVoluntary,
    exemptIncome25: exempt25,
    finalLimit,
  };
};

export const calculateTax = (inputs: TaxInputs, procedureType: 1 | 2): TaxResult => {
  const currentTotalIncome = inputs.monthlySalary + inputs.otherIncome;
  
  // 1. Calculate current month scenario
  const currentCalc = calculateBaseAndTax(currentTotalIncome, inputs);
  
  let finalRetentionUVT = 0;
  let effectiveRate = 0;

  if (procedureType === 1) {
    finalRetentionUVT = currentCalc.retentionUVT_Table;
  } else {
    // Procedimiento 2 Logic
    let rate = inputs.procedure2Rate;

    // Si no hay tasa manual, la calculamos basada en el histórico
    if ((rate === undefined || rate === 0) && inputs.historicalMonthlyIncome && inputs.historicalMonthlyIncome > 0) {
       // Simulamos el impuesto sobre el PROMEDIO histórico
       // IMPORTANTE: Para la simulación del % fijo, usamos las mismas deducciones configuradas actualmente,
       // asumiendo que el comportamiento de ahorro/deducciones es similar.
       const historicalCalc = calculateBaseAndTax(inputs.historicalMonthlyIncome, inputs, true);
       
       if (historicalCalc.baseGravableUVT > 0) {
         // Tasa Fija = (Impuesto Teórico / Base Gravable Teórica) * 100
         rate = (historicalCalc.retentionUVT_Table / historicalCalc.baseGravableUVT) * 100;
       } else {
         rate = 0;
       }
    }
    
    // Fallback: Si no hay histórico ni tasa manual, usamos el mes actual como proxy (lo que daba igual antes)
    if (rate === undefined || rate === 0) {
        if (currentCalc.baseGravableUVT > 0) {
            rate = (currentCalc.retentionUVT_Table / currentCalc.baseGravableUVT) * 100;
        } else {
            rate = 0;
        }
    }

    effectiveRate = rate;
    // Aplicar Tasa Fija a la Base Gravable ACTUAL
    finalRetentionUVT = currentCalc.baseGravableUVT * (rate / 100);
  }

  const retentionCOP = finalRetentionUVT * UVT_VALUE;

  return {
    baseGravable: currentCalc.baseGravableUVT,
    baseGravableCOP: currentCalc.baseGravableCOP,
    retentionUVT: finalRetentionUVT,
    retentionCOP,
    netIncome: currentTotalIncome - currentCalc.totalINCRNG - retentionCOP,
    effectiveRate,
    details: {
      grossIncome: currentTotalIncome,
      healthPensionSolidarity: currentCalc.totalINCRNG,
      totalDeductions: currentCalc.totalDeductions,
      exemptIncome25: currentCalc.exemptIncome25,
      limit40: currentCalc.finalLimit,
      finalBase: currentCalc.baseGravableCOP
    }
  };
};