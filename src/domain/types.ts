export type MachineKind = 'tractor' | 'combine'

export interface MachineInputs {
  name: string
  kind: MachineKind
  purchasePrice: number
  usefulLife: number
  annualHours: number
  residualValue: number
  fuelConsumption: number
  fuelPrice: number
  annualMaintenance: number
  annualExtraCosts: number
  productivity: number
  utilization: number
  savingsPerHectare: number
  additionalIncomePerHectare: number
}

export interface CashFlowPoint {
  year: number
  cashFlow: number
  includesResidual: boolean
}

export interface CostPart {
  name: string
  value: number
  color: string
}

export interface CalculationResult {
  annualDepreciation: number
  fuelCostHour: number
  depreciationHour: number
  maintenanceHour: number
  extraHour: number
  costHour: number
  effectiveProductivity: number
  costHectare: number
  annualArea: number
  economicEffectPerHectare: number
  annualRevenue: number
  annualOperatingCosts: number
  annualAccountingCosts: number
  annualCashFlow: number
  paybackYears: number | null
  breaksEvenWithinLife: boolean
  breakEvenYear: number | null
  cashFlowSeries: CashFlowPoint[]
  costStructure: CostPart[]
}

export interface MachinePreset {
  id: string
  label: string
  badge: string
  description: string
  facts: string[]
  sourceLabel: string
  sourceUrl: string
  values: MachineInputs
}

export interface ScenarioResult {
  id: 'optimistic' | 'base' | 'stress'
  label: string
  description: string
  result: CalculationResult
}

export interface SensitivityPoint {
  key: string
  name: string
  assumption: string
  paybackImpactPercent: number | null
  cashFlowImpactPercent: number
  becomesUnprofitable: boolean
}

export interface DecisionSummary {
  tone: 'positive' | 'neutral' | 'negative'
  title: string
  description: string
}

export interface InvestmentInputs {
  contractorRatePerHectare: number
  rentalRatePerHour: number
  loanDownPaymentPercent: number
  loanAnnualRatePercent: number
  loanTermYears: number
  leaseAdvancePercent: number
  leaseAnnualRatePercent: number
  leaseTermYears: number
}

export interface FinancingOptionResult {
  upfrontPayment: number
  financedAmount: number
  annualPayment: number
  balanceAfterPayment: number
  coverageRatio: number | null
  totalPayments: number
  affordable: boolean
}

export interface OperatingAlternative {
  id: 'ownership' | 'rental' | 'contractor'
  label: string
  annualCost: number
  costPerHectare: number
  differenceFromBest: number
  isBest: boolean
}

export interface InvestmentDecisionResult {
  breakEvenAreaVsContractor: number | null
  breakEvenHoursVsContractor: number | null
  loadReservePercent: number | null
  loan: FinancingOptionResult
  lease: FinancingOptionResult
  alternatives: OperatingAlternative[]
  recommendation: DecisionSummary
}
