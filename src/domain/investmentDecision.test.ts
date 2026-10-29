import { describe, expect, it } from 'vitest'
import { defaultValues } from '../data/presets'
import { calculateInvestmentDecision } from './investmentDecision'
import type { InvestmentInputs } from './types'

const investment: InvestmentInputs = {
  contractorRatePerHectare: 1_500,
  rentalRatePerHour: 1_600,
  loanDownPaymentPercent: 20,
  loanAnnualRatePercent: 18,
  loanTermYears: 5,
  leaseAdvancePercent: 20,
  leaseAnnualRatePercent: 15,
  leaseTermYears: 5,
}

describe('investment decision', () => {
  it('считает минимальную загрузку относительно подрядчика', () => {
    const decision = calculateInvestmentDecision(defaultValues, investment)
    expect(decision.breakEvenAreaVsContractor).toBeGreaterThan(0)
    expect(decision.breakEvenHoursVsContractor).toBeGreaterThan(0)
    expect(decision.alternatives).toHaveLength(3)
    expect(decision.alternatives.filter((item) => item.isBest)).toHaveLength(1)
  })

  it('считает аннуитет и запас покрытия платежа', () => {
    const decision = calculateInvestmentDecision(defaultValues, investment)
    expect(decision.loan.upfrontPayment).toBeCloseTo(defaultValues.purchasePrice * 0.2)
    expect(decision.loan.annualPayment).toBeGreaterThan(0)
    expect(decision.loan.totalPayments).toBeGreaterThan(defaultValues.purchasePrice)
    expect(decision.loan.coverageRatio).not.toBeNull()
  })

  it('обрабатывает беспроцентное финансирование', () => {
    const decision = calculateInvestmentDecision(defaultValues, { ...investment, loanAnnualRatePercent: 0 })
    expect(decision.loan.annualPayment).toBeCloseTo(defaultValues.purchasePrice * 0.8 / 5)
  })

  it('отклоняет некорректные параметры', () => {
    expect(() => calculateInvestmentDecision(defaultValues, { ...investment, loanTermYears: 0 })).toThrow()
    expect(() => calculateInvestmentDecision(defaultValues, { ...investment, leaseAdvancePercent: 120 })).toThrow()
  })
})

