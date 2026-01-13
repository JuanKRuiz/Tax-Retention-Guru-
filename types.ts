export interface TaxInputs {
  monthlySalary: number;
  otherIncome: number; // Bonos, commissions not salary
  voluntaryPension: number;
  afcContribution: number;
  housingInterest: number;
  prepaidMedicine: number;
  hasDependents: boolean;
  isSalarioIntegral: boolean; // New: Affects IBC calculation (70% base)
  procedure2Rate?: number; // Manual override
  historicalMonthlyIncome?: number; // New: Average income from previous year to calculate P2 automatically
  simulationMonthlies?: number[]; // New: Optional array for pre-loaded simulation data
}

export interface TaxResult {
  baseGravable: number; // In UVT
  baseGravableCOP: number; // In COP
  retentionUVT: number;
  retentionCOP: number;
  netIncome: number;
  effectiveRate?: number; // The calculated rate used
  details: {
    grossIncome: number;
    healthPensionSolidarity: number;
    totalDeductions: number;
    exemptIncome25: number;
    limit40: number; // The calculated 40% limit value
    finalBase: number;
  };
}

export interface ComparisonResult {
  procedure1: TaxResult;
  procedure2: TaxResult;
  recommendation: 'PROCEDURE_1' | 'PROCEDURE_2' | 'EQUAL';
  difference: number;
}

export enum Tab {
  CALCULATOR = 'calculator',
  ADVISOR = 'advisor',
  SIMULATION = 'simulation',
}