import type { MachinePreset } from '../domain/types'

export const presets: MachinePreset[] = [
  {
    id: 'belarus-82-1',
    label: 'Беларус 82.1',
    badge: 'Универсальный трактор',
    description: 'Базовый сценарий для полевых и хозяйственных работ.',
    facts: ['Мощность 60 кВт (≈82 л.с.)', 'Двигатель Д-243', 'Колёсная формула 4×4'],
    sourceLabel: 'Официальный сайт МТЗ',
    sourceUrl: 'https://mtz.ru/catalog/traktory/bazovaya-model-belarus-80-1/belarus-82-1-2020',
    values: {
      name: 'Беларус 82.1',
      kind: 'tractor',
      purchasePrice: 5_800_000,
      usefulLife: 10,
      annualHours: 1_200,
      residualValue: 1_500_000,
      fuelConsumption: 10,
      fuelPrice: 68.5,
      annualMaintenance: 450_000,
      annualExtraCosts: 180_000,
      productivity: 3,
      utilization: 0.75,
      savingsPerHectare: 1_200,
      additionalIncomePerHectare: 0,
    },
  },
  {
    id: 'acros-595-plus',
    label: 'ACROS 595 Plus',
    badge: 'Зерноуборочный комбайн',
    description: 'Сценарий сезонной уборки зерновых культур.',
    facts: ['Мощность до 330 л.с.', 'Производительность до 25 т/ч', 'До 1 250 га за сезон'],
    sourceLabel: 'Официальный сайт Ростсельмаш',
    sourceUrl: 'https://moscow.rostselmash.com/products/combine/acros/',
    values: {
      name: 'Ростсельмаш ACROS 595 Plus',
      kind: 'combine',
      purchasePrice: 45_000_000,
      usefulLife: 10,
      annualHours: 650,
      residualValue: 10_000_000,
      fuelConsumption: 42,
      fuelPrice: 68.5,
      annualMaintenance: 3_500_000,
      annualExtraCosts: 1_200_000,
      productivity: 5.6,
      utilization: 0.72,
      savingsPerHectare: 4_500,
      additionalIncomePerHectare: 700,
    },
  },
]

export const defaultValues = presets[0].values

export const customValues = {
  ...defaultValues,
  name: 'Моя техника',
}
