import { calculateEconomics } from './calculations'
import type {
  DecisionSummary,
  FinancingOptionResult,
  InvestmentDecisionResult,
  InvestmentInputs,
  MachineInputs,
  OperatingAlternative,
} from './types'

function annuityPayment(principal: number, annualRatePercent: number, termYears: number) {
  if (principal <= 0) return 0
  if (termYears <= 0) throw new Error('Срок финансирования должен быть больше нуля')
  const rate = annualRatePercent / 100
  if (rate === 0) return principal / termYears
  return principal * (rate * (1 + rate) ** termYears) / ((1 + rate) ** termYears - 1)
}

function calculateFinancing(
  price: number,
  annualCashFlow: number,
  downPaymentPercent: number,
  annualRatePercent: number,
  termYears: number,
): FinancingOptionResult {
  const upfrontPayment = price * downPaymentPercent / 100
  const financedAmount = price - upfrontPayment
  const annualPayment = annuityPayment(financedAmount, annualRatePercent, termYears)
  const coverageRatio = annualPayment > 0 ? annualCashFlow / annualPayment : null
  return {
    upfrontPayment,
    financedAmount,
    annualPayment,
    balanceAfterPayment: annualCashFlow - annualPayment,
    coverageRatio,
    totalPayments: upfrontPayment + annualPayment * termYears,
    affordable: annualCashFlow > annualPayment && (coverageRatio ?? 0) >= 1.2,
  }
}

function buildRecommendation(
  input: MachineInputs,
  alternatives: OperatingAlternative[],
  breakEvenArea: number | null,
  loan: FinancingOptionResult,
  lease: FinancingOptionResult,
): DecisionSummary {
  const result = calculateEconomics(input)
  const best = alternatives.find((item) => item.isBest)!

  if (result.annualCashFlow <= 0) {
    return {
      tone: 'negative',
      title: 'Покупка не формирует положительный денежный поток',
      description: `При заданных условиях выгоднее рассмотреть вариант «${best.label.toLowerCase()}» и пересмотреть ожидаемый эффект с гектара.`,
    }
  }

  if (best.id !== 'ownership') {
    const ownership = alternatives.find((item) => item.id === 'ownership')!
    const threshold = breakEvenArea === null ? '' : ` Покупка станет конкурентнее примерно от ${Math.ceil(breakEvenArea).toLocaleString('ru-RU')} га в год.`
    return {
      tone: 'neutral',
      title: `На текущей загрузке дешевле: ${best.label.toLowerCase()}`,
      description: `Стоимость владения выше лучшей альтернативы на ${Math.round(ownership.differenceFromBest).toLocaleString('ru-RU')} ₽ в год.${threshold}`,
    }
  }

  const financingText = loan.affordable
    ? 'Кредитный платёж покрывается денежным потоком с запасом.'
    : lease.affordable
      ? 'Лизинговый платёж покрывается денежным потоком с запасом лучше кредита.'
      : 'Для кредита и лизинга нужен больший первоначальный взнос или более длинный срок.'

  return {
    tone: result.breaksEvenWithinLife ? 'positive' : 'neutral',
    title: 'Покупка оправдана при текущей загрузке',
    description: `Собственная техника — самый экономичный способ выполнить плановый объём. ${financingText}`,
  }
}

export function calculateInvestmentDecision(input: MachineInputs, investment: InvestmentInputs): InvestmentDecisionResult {
  const values = Object.values(investment)
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Параметры альтернатив и финансирования должны быть неотрицательными')
  }
  if (investment.loanTermYears <= 0 || investment.leaseTermYears <= 0) {
    throw new Error('Срок финансирования должен быть больше нуля')
  }
  if (investment.loanDownPaymentPercent > 100 || investment.leaseAdvancePercent > 100) {
    throw new Error('Первоначальный взнос не может превышать 100%')
  }

  const result = calculateEconomics(input)
  const variableFuelPerHectare = result.fuelCostHour / result.effectiveProductivity
  const fixedOwnershipCosts = result.annualDepreciation + input.annualMaintenance + input.annualExtraCosts
  const contractorMargin = investment.contractorRatePerHectare - variableFuelPerHectare
  const breakEvenAreaVsContractor = contractorMargin > 0 ? fixedOwnershipCosts / contractorMargin : null
  const breakEvenHoursVsContractor = breakEvenAreaVsContractor === null
    ? null
    : breakEvenAreaVsContractor / result.effectiveProductivity
  const loadReservePercent = breakEvenAreaVsContractor && breakEvenAreaVsContractor > 0
    ? (result.annualArea / breakEvenAreaVsContractor - 1) * 100
    : null

  const rawAlternatives: Omit<OperatingAlternative, 'differenceFromBest' | 'isBest'>[] = [
    {
      id: 'ownership',
      label: 'Собственная техника',
      annualCost: result.annualAccountingCosts,
      costPerHectare: result.costHectare,
    },
    {
      id: 'rental',
      label: 'Аренда без топлива',
      annualCost: investment.rentalRatePerHour * input.annualHours + result.fuelCostHour * input.annualHours,
      costPerHectare: (investment.rentalRatePerHour + result.fuelCostHour) / result.effectiveProductivity,
    },
    {
      id: 'contractor',
      label: 'Услуги подрядчика',
      annualCost: investment.contractorRatePerHectare * result.annualArea,
      costPerHectare: investment.contractorRatePerHectare,
    },
  ]
  const bestCost = Math.min(...rawAlternatives.map((item) => item.annualCost))
  const alternatives = rawAlternatives.map((item) => ({
    ...item,
    differenceFromBest: item.annualCost - bestCost,
    isBest: Math.abs(item.annualCost - bestCost) < 0.01,
  }))

  const loan = calculateFinancing(
    input.purchasePrice,
    result.annualCashFlow,
    investment.loanDownPaymentPercent,
    investment.loanAnnualRatePercent,
    investment.loanTermYears,
  )
  const lease = calculateFinancing(
    input.purchasePrice,
    result.annualCashFlow,
    investment.leaseAdvancePercent,
    investment.leaseAnnualRatePercent,
    investment.leaseTermYears,
  )

  return {
    breakEvenAreaVsContractor,
    breakEvenHoursVsContractor,
    loadReservePercent,
    loan,
    lease,
    alternatives,
    recommendation: buildRecommendation(input, alternatives, breakEvenAreaVsContractor, loan, lease),
  }
}
