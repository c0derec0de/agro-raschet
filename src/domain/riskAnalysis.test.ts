import { describe, expect, it } from 'vitest'
import { defaultValues } from '../data/presets'
import { buildScenarios, calculateSensitivity, getDecisionSummary } from './riskAnalysis'

describe('risk analysis', () => {
  it('строит три упорядоченных сценария', () => {
    const scenarios = buildScenarios(defaultValues)
    expect(scenarios.map((scenario) => scenario.id)).toEqual(['optimistic', 'base', 'stress'])
    expect(scenarios[0].result.annualCashFlow).toBeGreaterThan(scenarios[1].result.annualCashFlow)
    expect(scenarios[1].result.annualCashFlow).toBeGreaterThan(scenarios[2].result.annualCashFlow)
  })

  it('не изменяет базовый результат в сценарном анализе', () => {
    const scenarios = buildScenarios(defaultValues)
    expect(scenarios[1].result.costHour).toBeCloseTo(1568.333333)
  })

  it('ранжирует чувствительность по влиянию на окупаемость', () => {
    const points = calculateSensitivity(defaultValues)
    expect(points).toHaveLength(7)
    expect(points.every((point, index) => index === 0 || (points[index - 1].paybackImpactPercent ?? 0) >= (point.paybackImpactPercent ?? 0))).toBe(true)
  })

  it('формирует понятный инвестиционный вывод', () => {
    expect(getDecisionSummary(defaultValues).tone).toBe('positive')
    expect(getDecisionSummary({ ...defaultValues, savingsPerHectare: 0, additionalIncomePerHectare: 0 }).tone).toBe('negative')
  })
})
