import { BadgeCheck, Banknote, Building2, Calculator, CircleDollarSign, Gauge, KeyRound, LandPlot, ShieldCheck, Tractor } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { defaultInvestmentInputs } from '../data/investmentDefaults'
import { formatMoney, formatNumber } from '../domain/formatters'
import { calculateInvestmentDecision } from '../domain/investmentDecision'
import type { CalculationResult, FinancingOptionResult, InvestmentInputs, MachineInputs } from '../domain/types'

const STORAGE_KEY = 'agro-raschet-investment-v1'

function loadInputs(): InvestmentInputs {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as Partial<InvestmentInputs>
    const merged = { ...defaultInvestmentInputs, ...parsed }
    return {
      ...merged,
      loanTermYears: Math.max(1, Number(merged.loanTermYears) || defaultInvestmentInputs.loanTermYears),
      leaseTermYears: Math.max(1, Number(merged.leaseTermYears) || defaultInvestmentInputs.leaseTermYears),
      loanDownPaymentPercent: Math.min(100, Math.max(0, Number(merged.loanDownPaymentPercent) || 0)),
      leaseAdvancePercent: Math.min(100, Math.max(0, Number(merged.leaseAdvancePercent) || 0)),
    }
  } catch {
    return defaultInvestmentInputs
  }
}

export function InvestmentDecision({ input, result }: { input: MachineInputs; result: CalculationResult }) {
  const [values, setValues] = useState<InvestmentInputs>(loadInputs)
  const decision = useMemo(() => calculateInvestmentDecision(input, values), [input, values])

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(values)), [values])

  const update = (key: keyof InvestmentInputs, value: number) => {
    const finite = Number.isFinite(value) ? value : 0
    const isTerm = key === 'loanTermYears' || key === 'leaseTermYears'
    const isPercent = key === 'loanDownPaymentPercent' || key === 'leaseAdvancePercent'
    const normalized = isTerm ? Math.max(1, finite) : isPercent ? Math.min(100, Math.max(0, finite)) : Math.max(0, finite)
    setValues((current) => ({ ...current, [key]: normalized }))
  }

  const cheapest = decision.alternatives.find((item) => item.isBest)!
  const reserve = decision.loadReservePercent

  return (
    <section id="decision-center" className="scroll-mt-24 py-18 print:break-before-page">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Центр инвестиционного решения</p>
          <h2 className="page-title mt-2">Покупать, арендовать или заказать услугу?</h2>
          <p className="page-copy">Сравните варианты на одном объёме работ и проверьте, выдерживает ли денежный поток кредит или лизинг.</p>
        </div>
        <div className="rounded-2xl border border-[#dce5dd] bg-white px-5 py-4 text-sm shadow-sm">
          <span className="text-xs text-[#74827b]">Плановый объём</span>
          <strong className="mt-1 block text-xl">{formatNumber(result.annualArea)} га/год</strong>
        </div>
      </div>

      <div className={`decision-panel decision-${decision.recommendation.tone} flex flex-col gap-4 sm:flex-row sm:items-start`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/65"><BadgeCheck size={23} /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.13em] opacity-70">Рекомендация по вашим данным</p>
          <h3 className="mt-1 text-xl font-semibold">{decision.recommendation.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 opacity-85">{decision.recommendation.description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <DecisionKpi icon={LandPlot} label="Минимальная загрузка для покупки" value={decision.breakEvenAreaVsContractor === null ? 'Нет точки' : `${formatNumber(decision.breakEvenAreaVsContractor)} га/год`} note="относительно цены подрядчика" />
        <DecisionKpi icon={Gauge} label="Запас загрузки" value={reserve === null ? 'Не рассчитан' : `${reserve >= 0 ? '+' : ''}${Math.round(reserve)}%`} note={reserve !== null && reserve >= 0 ? 'выше точки безубыточности' : 'ниже точки безубыточности'} negative={reserve !== null && reserve < 0} />
        <DecisionKpi icon={ShieldCheck} label="Самый экономичный вариант" value={cheapest.label} note={`${formatMoney(cheapest.costPerHectare)}/га`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
        <div className="panel overflow-hidden print:hidden">
          <div className="border-b border-[#e1e8e2] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0e9] text-[#0b6b45]"><Calculator size={20} /></span>
              <div><p className="eyebrow">Ваш рынок</p><h3 className="mt-1 font-semibold">Уточните альтернативы</h3></div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#718078]">Введите реальные предложения вашего региона. Демонстрационные значения не являются офертой.</p>
          </div>

          <div className="divide-y divide-[#e5ebe6]">
            <AssumptionGroup title="Аренда и подрядчик" icon={Tractor}>
              <DecisionField label="Услуги подрядчика" unit="₽/га" value={values.contractorRatePerHectare} onChange={(value) => update('contractorRatePerHectare', value)} />
              <DecisionField label="Аренда без топлива" unit="₽/мч" value={values.rentalRatePerHour} onChange={(value) => update('rentalRatePerHour', value)} />
            </AssumptionGroup>

            <AssumptionGroup title="Кредит" icon={Building2}>
              <DecisionField label="Первоначальный взнос" unit="%" value={values.loanDownPaymentPercent} max={100} onChange={(value) => update('loanDownPaymentPercent', value)} />
              <DecisionField label="Ставка" unit="%/год" value={values.loanAnnualRatePercent} onChange={(value) => update('loanAnnualRatePercent', value)} />
              <DecisionField label="Срок" unit="лет" value={values.loanTermYears} min={1} onChange={(value) => update('loanTermYears', value)} />
            </AssumptionGroup>

            <AssumptionGroup title="Лизинг — предварительная оценка" icon={KeyRound}>
              <DecisionField label="Аванс" unit="%" value={values.leaseAdvancePercent} max={100} onChange={(value) => update('leaseAdvancePercent', value)} />
              <DecisionField label="Расчётная ставка" unit="%/год" value={values.leaseAnnualRatePercent} onChange={(value) => update('leaseAnnualRatePercent', value)} />
              <DecisionField label="Срок" unit="лет" value={values.leaseTermYears} min={1} onChange={(value) => update('leaseTermYears', value)} />
            </AssumptionGroup>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="border-b border-[#e1e8e2] p-5 sm:p-6">
              <p className="eyebrow">Одинаковый объём работ</p>
              <h3 className="mt-1 text-lg font-semibold">Сравнение способов эксплуатации</h3>
            </div>
            <div className="divide-y divide-[#e5ebe6]">
              {decision.alternatives.map((alternative) => (
                <div key={alternative.id} className={`grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8 ${alternative.isBest ? 'bg-[#f1f7e9]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`grid size-9 place-items-center rounded-xl ${alternative.isBest ? 'bg-[#dcebbf] text-[#56751b]' : 'bg-[#edf2ee] text-[#61756b]'}`}>
                      {alternative.id === 'ownership' ? <Tractor size={18} /> : alternative.id === 'rental' ? <KeyRound size={18} /> : <Building2 size={18} />}
                    </span>
                    <div>
                      <p className="font-semibold">{alternative.label}</p>
                      {alternative.isBest && <span className="text-[10px] font-bold uppercase tracking-wide text-[#64821e]">Лучший результат</span>}
                    </div>
                  </div>
                  <div><span className="block text-[10px] uppercase tracking-wide text-[#819087]">На гектар</span><strong>{formatMoney(alternative.costPerHectare)}</strong></div>
                  <div className="sm:min-w-[130px]"><span className="block text-[10px] uppercase tracking-wide text-[#819087]">За год</span><strong>{formatMoney(alternative.annualCost)}</strong></div>
                </div>
              ))}
            </div>
            <p className="border-t border-[#e5ebe6] bg-[#fbfcfa] px-5 py-3 text-xs leading-5 text-[#718078]">Владение включает топливо, амортизацию, сервис и прочие расходы. Аренда рассчитана без топлива; подрядчик — по ставке за гектар.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FinancingCard title="Кредит" icon={Banknote} result={decision.loan} term={values.loanTermYears} />
            <FinancingCard title="Лизинг" icon={CircleDollarSign} result={decision.lease} term={values.leaseTermYears} />
          </div>
        </div>
      </div>
    </section>
  )
}

function DecisionKpi({ icon: Icon, label, value, note, negative }: { icon: typeof LandPlot; label: string; value: string; note: string; negative?: boolean }) {
  return (
    <article className="panel p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${negative ? 'bg-[#f8e8e5] text-[#a14239]' : 'bg-[#e8f0e9] text-[#0b6b45]'}`}><Icon size={20} /></span>
        <div><p className="text-xs text-[#718078]">{label}</p><p className={`mt-1 text-lg font-semibold ${negative ? 'text-[#a14239]' : ''}`}>{value}</p><p className="mt-1 text-[11px] text-[#89958f]">{note}</p></div>
      </div>
    </article>
  )
}

function AssumptionGroup({ title, icon: Icon, children }: { title: string; icon: typeof Tractor; children: React.ReactNode }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Icon size={17} className="text-[#0b6b45]" /> {title}</div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DecisionField({ label, unit, value, onChange, min = 0, max }: { label: string; unit: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#425d52]">{label}</span>
      <span className="flex h-10 items-center rounded-xl border border-[#ccd8d0] bg-white focus-within:border-[#0b6b45] focus-within:ring-3 focus-within:ring-[#0b6b45]/10">
        <input type="number" min={min} max={max} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none" />
        <span className="mr-2 rounded-lg bg-[#f0f4ef] px-2 py-1 text-[10px] font-medium text-[#61736b]">{unit}</span>
      </span>
    </label>
  )
}

function FinancingCard({ title, icon: Icon, result, term }: { title: string; icon: typeof Banknote; result: FinancingOptionResult; term: number }) {
  const coverage = result.coverageRatio
  return (
    <article className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e5ebe6] p-5">
        <div className="flex items-center gap-2"><Icon size={19} className="text-[#0b6b45]" /><h3 className="font-semibold">{title}</h3></div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${result.affordable ? 'bg-[#e6f1d3] text-[#58751d]' : 'bg-[#f8e8e5] text-[#a14239]'}`}>{result.affordable ? 'Платёж посилен' : 'Недостаточный запас'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 text-sm">
        <FinanceValue label="Первый взнос" value={formatMoney(result.upfrontPayment)} />
        <FinanceValue label="Платёж в год" value={formatMoney(result.annualPayment)} />
        <FinanceValue label="После платежа" value={formatMoney(result.balanceAfterPayment)} negative={result.balanceAfterPayment < 0} />
        <FinanceValue label="Покрытие платежа" value={coverage === null ? '—' : `${coverage.toFixed(2)}×`} negative={(coverage ?? 0) < 1.2} />
      </div>
      <p className="border-t border-[#e5ebe6] bg-[#fbfcfa] px-5 py-3 text-[11px] leading-5 text-[#78877f]">Всего за {term} лет: {formatMoney(result.totalPayments)}. Расчёт аннуитетный, без налоговых льгот и комиссий.</p>
    </article>
  )
}

function FinanceValue({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return <div><span className="block text-[10px] uppercase tracking-wide text-[#87938d]">{label}</span><strong className={`mt-1 block ${negative ? 'text-[#a14239]' : ''}`}>{value}</strong></div>
}
