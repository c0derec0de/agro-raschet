import { calculateEconomics } from './calculations'
import type { DecisionSummary, MachineInputs, ScenarioResult, SensitivityPoint } from './types'

const safeUtilization = (value: number) => Math.min(1, Math.max(0.01, value))

export function buildScenarios(input: MachineInputs): ScenarioResult[] {
  const optimistic: MachineInputs = {
    ...input,
    fuelPrice: input.fuelPrice * 0.95,
    annualMaintenance: input.annualMaintenance * 0.95,
    productivity: input.productivity * 1.1,
    utilization: safeUtilization(input.utilization * 1.05),
    savingsPerHectare: input.savingsPerHectare * 1.1,
    additionalIncomePerHectare: input.additionalIncomePerHectare * 1.1,
  }
  const stress: MachineInputs = {
    ...input,
    fuelPrice: input.fuelPrice * 1.15,
    annualMaintenance: input.annualMaintenance * 1.15,
    productivity: input.productivity * 0.9,
    utilization: safeUtilization(input.utilization * 0.9),
    savingsPerHectare: input.savingsPerHectare * 0.9,
    additionalIncomePerHectare: input.additionalIncomePerHectare * 0.9,
  }

  return [
    {
      id: 'optimistic',
      label: 'Оптимистичный',
      description: 'Отдача и выработка выше, топливо и сервис дешевле',
      result: calculateEconomics(optimistic),
    },
    {
      id: 'base',
      label: 'Базовый',
      description: 'Ваши текущие производственные допущения',
      result: calculateEconomics(input),
    },
    {
      id: 'stress',
      label: 'Стресс-сценарий',
      description: 'Отдача и выработка ниже, расходы выше',
      result: calculateEconomics(stress),
    },
  ]
}

const adverseVariants: Array<{
  key: string
  name: string
  assumption: string
  apply: (input: MachineInputs) => MachineInputs
}> = [
  {
    key: 'return',
    name: 'Отдача с гектара',
    assumption: '−10%',
    apply: (input) => ({
      ...input,
      savingsPerHectare: input.savingsPerHectare * 0.9,
      additionalIncomePerHectare: input.additionalIncomePerHectare * 0.9,
    }),
  },
  {
    key: 'productivity',
    name: 'Производительность',
    assumption: '−10%',
    apply: (input) => ({ ...input, productivity: input.productivity * 0.9 }),
  },
  {
    key: 'utilization',
    name: 'Рабочее время',
    assumption: '−10%',
    apply: (input) => ({ ...input, utilization: safeUtilization(input.utilization * 0.9) }),
  },
  {
    key: 'hours',
    name: 'Годовая наработка',
    assumption: '−10%',
    apply: (input) => ({ ...input, annualHours: input.annualHours * 0.9 }),
  },
  {
    key: 'fuel',
    name: 'Цена топлива',
    assumption: '+10%',
    apply: (input) => ({ ...input, fuelPrice: input.fuelPrice * 1.1 }),
  },
  {
    key: 'service',
    name: 'Сервис и ремонт',
    assumption: '+10%',
    apply: (input) => ({ ...input, annualMaintenance: input.annualMaintenance * 1.1 }),
  },
  {
    key: 'price',
    name: 'Цена покупки',
    assumption: '+10%',
    apply: (input) => ({ ...input, purchasePrice: input.purchasePrice * 1.1 }),
  },
]

export function calculateSensitivity(input: MachineInputs): SensitivityPoint[] {
  const base = calculateEconomics(input)

  return adverseVariants
    .map(({ key, name, assumption, apply }) => {
      const adverse = calculateEconomics(apply(input))
      const becomesUnprofitable = adverse.paybackYears === null
      const paybackImpactPercent = base.paybackYears === null
        ? null
        : becomesUnprofitable
          ? 200
          : ((adverse.paybackYears! / base.paybackYears) - 1) * 100
      const cashFlowImpactPercent = base.annualCashFlow === 0
        ? 0
        : ((adverse.annualCashFlow / base.annualCashFlow) - 1) * 100

      return {
        key,
        name,
        assumption,
        paybackImpactPercent,
        cashFlowImpactPercent,
        becomesUnprofitable,
      }
    })
    .sort((first, second) => (second.paybackImpactPercent ?? -Infinity) - (first.paybackImpactPercent ?? -Infinity))
}

export function getDecisionSummary(input: MachineInputs): DecisionSummary {
  const result = calculateEconomics(input)
  if (result.annualCashFlow <= 0) {
    return {
      tone: 'negative',
      title: 'Сценарий не создаёт положительного денежного потока',
      description: 'Экономия и дополнительный доход не покрывают топливо, сервис и прочие ежегодные выплаты. Инвестиционные параметры нужно пересмотреть.',
    }
  }
  if (!result.breaksEvenWithinLife) {
    return {
      tone: 'negative',
      title: 'Инвестиция не окупается в выбранном горизонте',
      description: 'Даже с учётом остаточной стоимости накопленный поток не достигает нуля до конца срока использования.',
    }
  }
  if (result.paybackYears !== null && result.paybackYears <= input.usefulLife * 0.5) {
    return {
      tone: 'positive',
      title: 'Сценарий имеет хороший запас окупаемости',
      description: 'Простой срок окупаемости занимает не более половины срока полезного использования. Проверьте устойчивость результата в стресс-сценарии.',
    }
  }
  return {
    tone: 'neutral',
    title: 'Сценарий окупается, но чувствителен к допущениям',
    description: 'Безубыточность достигается в пределах срока использования, однако запас времени ограничен. Обратите внимание на ключевые факторы риска.',
  }
}
