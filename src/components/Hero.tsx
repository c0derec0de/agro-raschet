import { ArrowDown, Calculator, ChartNoAxesCombined, CircleCheck, Gauge, ShieldCheck } from 'lucide-react'
import type { CalculationResult } from '../domain/types'
import { formatMoney, formatPayback } from '../domain/formatters'

export function Hero({ result }: { result: CalculationResult }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#075f3c] text-white print:hidden">
      <div className="field-lines absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="hero-inner relative mx-auto grid max-w-[1480px] gap-12 px-5 pb-18 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-2xl border border-[#b7d63d]/45 bg-[#b7d63d]/10 px-3 py-1.5 text-xs font-semibold leading-5 text-[#dff59a] sm:rounded-full">
            <CircleCheck size={15} /> Финансовая модель без двойного учёта амортизации
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-[64px]">
            Выберите выгодный способ работать с техникой
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Рассчитайте себестоимость и окупаемость, сравните покупку с арендой и подрядчиком, проверьте доступность кредита и лизинга.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#calculator" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b7d63d] px-5 py-3.5 text-sm font-bold text-[#173b2d] transition hover:bg-[#c9e45c]">
              <Calculator size={18} /> Начать расчёт <ArrowDown size={16} />
            </a>
            <a href="#methodology" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Посмотреть методику
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/60">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#b7d63d]" /> Данные остаются в браузере</span>
            <span className="flex items-center gap-2"><Gauge size={16} className="text-[#b7d63d]" /> Мгновенный пересчёт</span>
            <span className="flex items-center gap-2"><CircleCheck size={16} className="text-[#b7d63d]" /> 5 вариантов решения</span>
          </div>
        </div>

        <div className="relative mx-auto min-w-0 w-full max-w-xl lg:justify-self-end">
          <div className="absolute -inset-6 rounded-[36px] bg-[#b7d63d]/10 blur-2xl" />
          <div className="relative rounded-[28px] border border-white/15 bg-white p-5 text-[#18332a] shadow-2xl shadow-black/20 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#dfe7df] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#668076]">Пример расчёта</p>
                <h2 className="mt-1 text-xl font-semibold">Беларус 82.1</h2>
              </div>
              <span className="rounded-full bg-[#eef5d5] px-3 py-1 text-xs font-semibold text-[#4f6a14]">Трактор</span>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f3f6f1] p-4">
                <p className="text-xs text-[#708179]">Себестоимость часа</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(result.costHour)}</p>
              </div>
              <div className="rounded-2xl bg-[#f3f6f1] p-4">
                <p className="text-xs text-[#708179]">Себестоимость гектара</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(result.costHectare)}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#075f3c] p-5 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-white/60">Простой срок окупаемости</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">{formatPayback(result.paybackYears)}</p>
                </div>
                <ChartNoAxesCombined className="text-[#b7d63d]" size={34} />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[68%] rounded-full bg-[#b7d63d]" />
              </div>
              <p className="mt-2 text-[11px] text-white/55">Расчёт по демонстрационным параметрам — все значения можно изменить</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
