import { z } from 'zod'

const nonNegative = (message: string) => z.number({ message }).min(0, message)
const positive = (message: string) => z.number({ message }).gt(0, message)

export const machineSchema = z
  .object({
    name: z.string().trim().min(2, 'Укажите название техники'),
    kind: z.enum(['tractor', 'combine']),
    purchasePrice: positive('Стоимость должна быть больше нуля'),
    usefulLife: positive('Срок должен быть больше нуля').max(30, 'Не более 30 лет'),
    annualHours: positive('Наработка должна быть больше нуля'),
    residualValue: nonNegative('Не может быть отрицательной'),
    fuelConsumption: nonNegative('Не может быть отрицательным'),
    fuelPrice: nonNegative('Не может быть отрицательной'),
    annualMaintenance: nonNegative('Не может быть отрицательным'),
    annualExtraCosts: nonNegative('Не может быть отрицательным'),
    productivity: positive('Производительность должна быть больше нуля'),
    utilization: z.number().gt(0, 'Коэффициент должен быть больше 0').max(1, 'Максимум — 100%'),
    savingsPerHectare: nonNegative('Не может быть отрицательной'),
    additionalIncomePerHectare: nonNegative('Не может быть отрицательным'),
  })
  .refine((data) => data.residualValue <= data.purchasePrice, {
    message: 'Остаточная стоимость не может превышать цену покупки',
    path: ['residualValue'],
  })

export type MachineFormValues = z.infer<typeof machineSchema>
