// Valores tributarios para Colombia (Año fiscal 2026 según comunicado LATAM Payroll)
// UVT 2026 oficial según PDF: 52.374 COP
// SMMLV proyectado (aprox): 1.500.000 COP (Estimado, no crítico para retención alta)

export const UVT_VALUE = 52374; 
export const SMMLV_VALUE = 1500000;

export const LIMITS = {
  HOUSING_INTEREST_UVT: 100, // Mensual
  PREPAID_MEDICINE_UVT: 16, // Mensual
  DEPENDENTS_UVT: 32, // Mensual
  DEPENDENTS_RATE: 0.10, // 10% del ingreso bruto
  
  // Aportes Voluntarios (Art 126-1)
  VOLUNTARY_PENSION_RATE_LIMIT: 0.30, // Max 30% del ingreso
  
  // Renta Exenta Laboral (Art 206-10)
  EXEMPT_INCOME_RATE: 0.25, // 25%
  EXEMPT_INCOME_CAP_UVT_ANNUAL: 790, // Tope anual estricto
  
  // Límite Global (Art 388)
  GLOBAL_LIMIT_RATE: 0.40, // 40%
  GLOBAL_LIMIT_UVT_ANNUAL: 1340, // Tope anual estricto para el 40%
};

// Tabla de Retención Art 383 ET (Rangos en UVT)
export const TAX_BRACKETS = [
  { min: 0, max: 95, rate: 0.00, subtract: 0 },
  { min: 95, max: 150, rate: 0.19, subtract: 0 },
  { min: 150, max: 360, rate: 0.28, subtract: 10 },
  { min: 360, max: 640, rate: 0.33, subtract: 69 },
  { min: 640, max: 945, rate: 0.35, subtract: 162 },
  { min: 945, max: 2300, rate: 0.37, subtract: 268 },
  { min: 2300, max: Infinity, rate: 0.39, subtract: 770 },
];