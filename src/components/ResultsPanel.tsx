import { BanknoteArrowUp, Clock3, Download, Fuel, LandPlot, Route, TriangleAlert } from 'lucide-react'
import { lazy, Suspense } from 'react'
import type { CalculationResult, MachineInputs } from '../domain/types'
import { formatMoney, formatNumber, formatPayback } from '../domain/formatters'

const CostBreakdownChart = lazy(() => import('./Charts').then((module) => ({ default: module.CostBreakdownChart })))

interface Props {
  input: Partial<MachineInputs>
  result: CalculationResult | null
  onPrint: () => void
}

export function ResultsPanel({ input, result, onPrint }: Props) {
  if (!result) {
    return (
      <aside className="panel flex min-h-[420px] items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f9eae6] text-[#a7483f]"><TriangleAlert size={25} /></span>
          <h3 className="mt-5 text-xl font-semibold">Проверьте параметры</h3>
          <p className="mt-2 text-sm leading-6 text-[#6f7e77]">Заполните обязательные поля и исправьте подсвеченные значения — результаты появятся автоматически.</p>
        </div>
      </aside>
    )
  }

  const primary = [
    { label: 'Себестоимость часа', value: `${formatMoney(result.costHour)}/ч`, icon: Clock3 },
    { label: 'Себестоимость гектара', value: `${formatMoney(result.costHectare)}/га`, icon: LandPlot },
    { label: 'Простой срок окупаемости', value: formatPayback(result.paybackYears), icon: Route },
  ]

  return (
    <aside className="space-y-5 xl:sticky xl:top-23 xl:self-start">
      <section className="overflow-hidden rounded-[22px] border border-[#0a583b] bg-[#075f3c] text-white shadow-[0_18px_50px_rgba(18,58,43,.14)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/12 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#d8ee87]">Результаты расчёта</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{input.name || 'Текущий сценарий'}</h3>
            <p className="mt-1 text-xs text-white/58">Обновлено по введённым параметрам</p>
          </div>
          <button type="button" onClick={onPrint} className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/16 print:hidden">
            <Download size={15} /> Отчёт
          </button>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          {primary.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#075f3c] p-5">
              <Icon size={19} className="text-[#b7d63d]" />
              <p className="mt-4 text-[11px] leading-4 text-white/58">{label}</p>
              <p className="mt-1 text-[21px] font-semibold leading-tight tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Годовой итог</p>
            <h4 className="mt-1 text-base font-semibold">Операционная экономика</h4>
          </div>
          <BanknoteArrowUp className="text-[#0b6b45]" size={22} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <MiniKpi label="Денежные расходы" value={formatMoney(result.annualOperatingCosts)} note="без амортизации" icon={Fuel} />
          <MiniKpi label="Объём обработки" value={`${formatNumber(result.annualArea)} га`} note="за год" icon={LandPlot} />
          <MiniKpi label="Денежный поток" value={formatMoney(result.annualCashFlow)} note="до финансирования" icon={BanknoteArrowUp} negative={result.annualCashFlow <= 0} />
        </div>
        <div className="mt-4 rounded-xl bg-[#f2f6ef] px-4 py-3 text-xs leading-5 text-[#617269]">
          <strong className="text-[#29463c]">Экономический эффект: {formatMoney(result.economicEffectPerHectare)}/га.</strong> Амортизация {formatMoney(result.annualDepreciation)} в год включена в себестоимость, но не вычитается повторно из денежного потока.
        </div>
      </section>

      <Suspense fallback={<div className="panel h-[360px] animate-pulse bg-white/70" aria-label="Загрузка структуры затрат" />}>
        <CostBreakdownChart result={result} />
      </Suspense>
    </aside>
  )
}

function MiniKpi({ label, value, note, icon: Icon, negative }: { label: string; value: string; note: string; icon: typeof Fuel; negative?: boolean }) {
  return (
    <div className="rounded-xl border border-[#e0e7e1] p-3.5">
      <div className="flex items-center gap-2 text-[#718078]"><Icon size={14} /><span className="text-[11px]">{label}</span></div>
      <p className={`mt-2 text-sm font-semibold ${negative ? 'text-[#a64038]' : 'text-[#203b31]'}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-[#87938d]">{note}</p>
    </div>
  )
}
