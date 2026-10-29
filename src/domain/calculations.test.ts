import { describe, expect, it } from 'vitest'
import { calculateEconomics } from './calculations'
import type { MachineInputs } from './types'

const validInput: MachineInputs = {
  name: 'Тестовая машина',
  kind: 'tractor',
  purchasePrice: 1_000_000,
  residualValue: 100_000,
  usefulLife: 9,
  annualHours: 1_000,
  fuelConsumption: 10,
  fuelPrice: 50,
  annualMaintenance: 100_000,
  annualExtraCosts: 50_000,
  productivity: 2,
  utilization: 0.8,
  savingsPerHectare: 800,
  additionalIncomePerHectare: 200,
}

describe('calculateEconomics', () => {
  it('рассчитывает себестоимость, денежный поток и окупаемость', () => {
    const result = calculateEconomics(validInput)

    expect(result.annualDepreciation).toBeCloseTo(100_000)
    expect(result.fuelCostHour).toBeCloseTo(500)
    expect(result.costHour).toBeCloseTo(750)
    expect(result.effectiveProductivity).toBeCloseTo(1.6)
    expect(result.costHectare).toBeCloseTo(468.75)
    expect(result.annualArea).toBeCloseTo(1_600)
    expect(result.annualOperatingCosts).toBeCloseTo(650_000)
    expect(result.annualCashFlow).toBeCloseTo(950_000)
    expect(result.paybackYears).toBeCloseTo(1_000_000 / 950_000)
  })

  it('не вычитает амортизацию второй раз из денежного потока', () => {
    const result = calculateEconomics(validInput)
    expect(result.annualAccountingCosts - result.annualOperatingCosts).toBeCloseTo(result.annualDepreciation)
  })

  it('возвращает отсутствие окупаемости при неположительном денежном потоке', () => {
    const result = calculateEconomics({ ...validInput, savingsPerHectare: 100, additionalIncomePerHectare: 0 })
    expect(result.annualCashFlow).toBeLessThanOrEqual(0)
    expect(result.paybackYears).toBeNull()
    expect(result.breaksEvenWithinLife).toBe(false)
  })

  it('учитывает остаточную стоимость в последней точке графика', () => {
    const result = calculateEconomics(validInput)
    const last = result.cashFlowSeries.at(-1)!
    expect(last.includesResidual).toBe(true)
    expect(last.cashFlow).toBeCloseTo(-validInput.purchasePrice + result.annualCashFlow * 9 + validInput.residualValue)
  })

  it('защищает расчёты от деления на ноль и некорректных значений', () => {
    expect(() => calculateEconomics({ ...validInput, annualHours: 0 })).toThrow()
    expect(() => calculateEconomics({ ...validInput, utilization: 0 })).toThrow()
    expect(() => calculateEconomics({ ...validInput, residualValue: 2_000_000 })).toThrow()
  })
})
