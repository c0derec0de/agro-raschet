import type { CalculationResult, CashFlowPoint, MachineInputs } from './types'

const COST_COLORS = ['#0b6b45', '#65a30d', '#d5a72f', '#8b9a92']

function assertValidInputs(input: MachineInputs) {
  const nonNegativeValues = [
    input.purchasePrice,
    input.residualValue,
    input.fuelConsumption,
    input.fuelPrice,
    input.annualMaintenance,
    input.annualExtraCosts,
    input.savingsPerHectare,
    input.additionalIncomePerHectare,
  ]

  if (nonNegativeValues.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Стоимостные и расходные параметры должны быть неотрицательными числами')
  }
  if (
    !Number.isFinite(input.usefulLife) ||
    !Number.isFinite(input.annualHours) ||
    !Number.isFinite(input.productivity) ||
    input.usefulLife <= 0 ||
    input.annualHours <= 0 ||
    input.productivity <= 0
  ) {
    throw new Error('Срок, наработка и производительность должны быть больше нуля')
  }
  if (!Number.isFinite(input.utilization) || input.utilization <= 0 || input.utilization > 1) {
    throw new Error('Коэффициент использования должен быть в диапазоне от 0 до 1')
  }
  if (input.residualValue > input.purchasePrice) {
    throw new Error('Остаточная стоимость не может превышать стоимость покупки')
  }
}

function buildCashFlowSeries(input: MachineInputs, annualCashFlow: number): CashFlowPoint[] {
  const horizon = Math.max(1, Math.ceil(input.usefulLife))
  return Array.from({ length: horizon + 1 }, (_, year) => {
    const includesResidual = year === horizon
    return {
      year,
      cashFlow: -input.purchasePrice + annualCashFlow * year + (includesResidual ? input.residualValue : 0),
      includesResidual,
    }
  })
}

function findBreakEvenYear(series: CashFlowPoint[]): number | null {
  for (let index = 1; index < series.length; index += 1) {
    const previous = series[index - 1]
    const current = series[index]
    if (previous.cashFlow < 0 && current.cashFlow >= 0) {
      const step = current.cashFlow - previous.cashFlow
      return step === 0 ? current.year : previous.year + -previous.cashFlow / step
    }
  }
  return series[0]?.cashFlow >= 0 ? 0 : null
}

export function calculateEconomics(input: MachineInputs): CalculationResult {
  assertValidInputs(input)

  const annualDepreciation = (input.purchasePrice - input.residualValue) / input.usefulLife
  const fuelCostHour = input.fuelConsumption * input.fuelPrice
  const depreciationHour = annualDepreciation / input.annualHours
  const maintenanceHour = input.annualMaintenance / input.annualHours
  const extraHour = input.annualExtraCosts / input.annualHours
  const costHour = fuelCostHour + depreciationHour + maintenanceHour + extraHour
  const effectiveProductivity = input.productivity * input.utilization
  const costHectare = costHour / effectiveProductivity
  const annualArea = input.annualHours * effectiveProductivity
  const economicEffectPerHectare = input.savingsPerHectare + input.additionalIncomePerHectare
  const annualRevenue = annualArea * economicEffectPerHectare

  // Денежные расходы не включают амортизацию: это учётный, а не повторный денежный платёж.
  const annualOperatingCosts = input.annualHours * fuelCostHour + input.annualMaintenance + input.annualExtraCosts
  const annualAccountingCosts = annualOperatingCosts + annualDepreciation
  const annualCashFlow = annualRevenue - annualOperatingCosts
  const paybackYears = annualCashFlow > 0 ? input.purchasePrice / annualCashFlow : null
  const cashFlowSeries = buildCashFlowSeries(input, annualCashFlow)
  const breakEvenYear = findBreakEvenYear(cashFlowSeries)

  return {
    annualDepreciation,
    fuelCostHour,
    depreciationHour,
    maintenanceHour,
    extraHour,
    costHour,
    effectiveProductivity,
    costHectare,
    annualArea,
    economicEffectPerHectare,
    annualRevenue,
    annualOperatingCosts,
    annualAccountingCosts,
    annualCashFlow,
    paybackYears,
    breaksEvenWithinLife: breakEvenYear !== null,
    breakEvenYear,
    cashFlowSeries,
    costStructure: [
      { name: 'Топливо', value: fuelCostHour, color: COST_COLORS[0] },
      { name: 'Амортизация', value: depreciationHour, color: COST_COLORS[1] },
      { name: 'Обслуживание', value: maintenanceHour, color: COST_COLORS[2] },
      { name: 'Прочие расходы', value: extraHour, color: COST_COLORS[3] },
    ],
  }
}
