import { Banknote, Fuel, Gauge, RotateCcw, Settings, Tractor, TrendingUp, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { MachineFormValues } from '../domain/schema'
import type { MachinePreset } from '../domain/types'
import { NumberField } from './NumberField'

interface Props {
  form: UseFormReturn<MachineFormValues>
  presets: MachinePreset[]
  selectedPreset: string
  onPreset: (preset: MachinePreset | 'custom') => void
  onReset: () => void
}

const groups = [
  { id: 'costs', title: 'Стоимость и эксплуатация', subtitle: 'Инвестиции и срок использования', icon: Banknote },
  { id: 'fuel', title: 'Топливо', subtitle: 'Часовой расход и цена дизеля', icon: Fuel },
  { id: 'service', title: 'Обслуживание', subtitle: 'Годовые денежные расходы', icon: Wrench },
  { id: 'performance', title: 'Производительность', subtitle: 'Фактическая выработка техники', icon: Gauge },
  { id: 'return', title: 'Экономическая отдача', subtitle: 'Раздельно экономия и новый доход', icon: TrendingUp },
]

export function CalculatorForm({ form, presets, selectedPreset, onPreset, onReset }: Props) {
  const { register, formState: { errors }, watch } = form
  const values = watch()
  const [workloadMode, setWorkloadMode] = useState<'area' | 'hours'>('area')
  const effectiveProductivity = (Number(values.productivity) || 0) * (Number(values.utilization) || 0)
  const plannedArea = (Number(values.annualHours) || 0) * effectiveProductivity

  const setPlannedArea = (area: number) => {
    if (effectiveProductivity <= 0) return
    form.setValue('annualHours', area / effectiveProductivity, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <section className="panel p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Шаг 1</p>
            <h3 className="section-title mt-2">Выберите технику</h3>
            <p className="section-copy">Начните с готового сценария или задайте собственные параметры.</p>
          </div>
          <Tractor className="text-[#0b6b45]" size={26} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPreset(preset)}
              className={`model-card text-left ${selectedPreset === preset.id ? 'model-card-active' : ''}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6c7e76]">{preset.badge}</span>
              <strong className="mt-2 block text-sm leading-tight">{preset.label}</strong>
              <span className="mt-2 block text-xs leading-5 text-[#73817b]">{preset.facts[0]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPreset('custom')}
            className={`model-card text-left ${selectedPreset === 'custom' ? 'model-card-active' : ''}`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6c7e76]">Без пресета</span>
            <strong className="mt-2 block text-sm leading-tight">Своя техника</strong>
            <span className="mt-2 block text-xs leading-5 text-[#73817b]">Заполните параметры вручную</span>
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
          <label>
            <span className="mb-1.5 block text-sm font-medium">Название техники</span>
            <input className="input-base" {...register('name')} aria-invalid={Boolean(errors.name)} />
            {errors.name && <span className="mt-1 block text-xs text-[#b33830]">{errors.name.message}</span>}
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium">Тип</span>
            <select className="input-base" {...register('kind')}>
              <option value="tractor">Трактор</option>
              <option value="combine">Комбайн</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-start justify-between border-b border-[#e1e8e2] p-5 sm:p-6">
          <div>
            <p className="eyebrow">Шаг 2</p>
            <h3 className="section-title mt-2">Уточните параметры</h3>
            <p className="section-copy">Значения применяются к расчёту сразу после изменения.</p>
          </div>
          <Settings className="text-[#0b6b45]" size={24} />
        </div>

        <div className="divide-y divide-[#e5ebe6]">
          <FormGroup {...groups[0]}>
            <NumberField label="Стоимость покупки" unit="₽" money value={values.purchasePrice} error={errors.purchasePrice} registration={register('purchasePrice', { valueAsNumber: true })} step={10000} help="Возьмите цену из коммерческого предложения с учётом выбранной комплектации, доставки и обязательного навесного оборудования." />
            <NumberField label="Срок полезного использования" unit="лет" error={errors.usefulLife} registration={register('usefulLife', { valueAsNumber: true })} min={1} max={30} />
            <NumberField label="Остаточная стоимость" unit="₽" money value={values.residualValue} error={errors.residualValue} registration={register('residualValue', { valueAsNumber: true })} step={10000} help="Оцените ожидаемую цену продажи в конце срока по объявлениям о технике аналогичного возраста и состояния." />
          </FormGroup>

          <FormGroup {...groups[1]}>
            <NumberField label="Расход топлива" unit="л/ч" hint="Средний рабочий расход" error={errors.fuelConsumption} registration={register('fuelConsumption', { valueAsNumber: true })} step={0.1} help="Лучший источник — журнал заправок или телематика. Если данных нет, используйте паспортное значение и добавьте 10–15% запаса." />
            <NumberField label="Цена дизельного топлива" unit="₽/л" error={errors.fuelPrice} registration={register('fuelPrice', { valueAsNumber: true })} step={0.1} help="Используйте фактическую закупочную цену хозяйства с доставкой, а не среднюю цену на АЗС." />
          </FormGroup>

          <FormGroup {...groups[2]}>
            <NumberField label="Сервис и ремонт" unit="₽/год" money value={values.annualMaintenance} error={errors.annualMaintenance} registration={register('annualMaintenance', { valueAsNumber: true })} step={1000} help="Сложите плановые ТО, расходники и средний резерв на внеплановый ремонт по истории похожей техники." />
            <NumberField label="Дополнительные расходы" unit="₽/год" money value={values.annualExtraCosts} error={errors.annualExtraCosts} registration={register('annualExtraCosts', { valueAsNumber: true })} step={1000} help="Страхование, хранение, налоги, регистрация и другие ежегодные расходы, не вошедшие в сервис." />
          </FormGroup>

          <FormGroup {...groups[3]}>
            <NumberField label="Номинальная производительность" unit="га/ч" error={errors.productivity} registration={register('productivity', { valueAsNumber: true })} step={0.1} min={0.1} help="Ширина захвата × рабочая скорость ÷ 10. Например: 3 м × 10 км/ч ÷ 10 = 3 га/ч." />
            <Controller
              name="utilization"
              control={form.control}
              render={({ field }) => (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[#29463c]">Использование рабочего времени</span>
                  <span className={`flex h-11 items-center rounded-xl border bg-white transition focus-within:ring-3 ${errors.utilization ? 'border-[#c33f35] focus-within:ring-[#c33f35]/10' : 'border-[#ccd8d0] focus-within:border-[#0b6b45] focus-within:ring-[#0b6b45]/10'}`}>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      value={Number.isFinite(field.value) ? Math.round(field.value * 1000) / 10 : ''}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(Number(event.target.value) / 100)}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] font-medium outline-none"
                    />
                    <span className="mr-2 rounded-lg bg-[#f0f4ef] px-2.5 py-1.5 text-xs font-medium text-[#61736b]">%</span>
                  </span>
                  {errors.utilization ? <span className="mt-1 block text-xs text-[#b33830]">{errors.utilization.message}</span> : <span className="mt-1 block text-xs text-[#77867f]">Простои, развороты и заправка</span>}
                </label>
              )}
            />
            <div className="sm:col-span-2 rounded-2xl border border-[#dce5dd] bg-[#f8faf7] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Плановая загрузка</p>
                  <p className="mt-1 text-xs text-[#718078]">Введите привычный показатель — площадь или моточасы.</p>
                </div>
                <div className="segmented-control" aria-label="Способ ввода загрузки">
                  <button type="button" className={workloadMode === 'area' ? 'active' : ''} onClick={() => setWorkloadMode('area')}>Гектары</button>
                  <button type="button" className={workloadMode === 'hours' ? 'active' : ''} onClick={() => setWorkloadMode('hours')}>Моточасы</button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {workloadMode === 'area' ? (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#29463c]">Площадь обработки</span>
                    <span className="flex h-11 items-center rounded-xl border border-[#ccd8d0] bg-white focus-within:border-[#0b6b45] focus-within:ring-3 focus-within:ring-[#0b6b45]/10">
                      <input type="number" min={1} step={10} value={Number.isFinite(plannedArea) ? Math.round(plannedArea) : ''} onChange={(event) => setPlannedArea(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] font-medium outline-none" />
                      <span className="mr-2 rounded-lg bg-[#f0f4ef] px-2.5 py-1.5 text-xs font-medium text-[#61736b]">га/год</span>
                    </span>
                  </label>
                ) : (
                  <NumberField label="Плановая наработка" unit="мч/год" error={errors.annualHours} registration={register('annualHours', { valueAsNumber: true })} min={1} help="Используйте данные счётчика моточасов за прошлый сезон или производственный план." />
                )}
                <div className="rounded-xl bg-white p-3.5 text-xs leading-5 text-[#66776e]">
                  <span className="block font-semibold text-[#29463c]">Пересчёт загрузки</span>
                  {Math.round(plannedArea).toLocaleString('ru-RU')} га = {Math.round(Number(values.annualHours) || 0).toLocaleString('ru-RU')} мч при фактической выработке {effectiveProductivity.toFixed(2)} га/ч.
                </div>
              </div>
            </div>
          </FormGroup>

          <FormGroup {...groups[4]}>
            <NumberField label="Экономия относительно текущего способа" unit="₽/га" money value={values.savingsPerHectare} hint="Например, отказ от части услуг подрядчика" error={errors.savingsPerHectare} registration={register('savingsPerHectare', { valueAsNumber: true })} step={100} help="Сравните текущие затраты на выполнение той же работы с расходами после покупки. Не включайте сюда затраты самой техники — они уже рассчитаны отдельно." />
            <NumberField label="Дополнительный доход" unit="₽/га" money value={values.additionalIncomePerHectare} hint="Например, снижение потерь за счёт работы в срок" error={errors.additionalIncomePerHectare} registration={register('additionalIncomePerHectare', { valueAsNumber: true })} step={100} help="Укажите только подтверждаемую дополнительную маржу: прирост урожая, снижение потерь или доход от услуг другим хозяйствам." />
          </FormGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e8e2] bg-[#f8faf7] px-5 py-4 sm:px-6">
          <p className="text-xs leading-5 text-[#6e7d76]">Параметры автоматически сохраняются на этом устройстве.</p>
          <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#486057] hover:bg-[#eaf0ea]">
            <RotateCcw size={15} /> Сбросить параметры
          </button>
        </div>
      </section>
    </div>
  )
}

function FormGroup({ title, subtitle, icon: Icon, children }: { id: string; title: string; subtitle: string; icon: typeof Banknote; children: React.ReactNode }) {
  return (
    <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[180px_1fr]">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8f0e9] text-[#0b6b45]"><Icon size={18} /></span>
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-xs leading-5 text-[#74827b]">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}
