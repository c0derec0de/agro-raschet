import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BadgeCheck, ShieldAlert } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney, formatPayback } from '../domain/formatters'
import { buildScenarios, calculateSensitivity, getDecisionSummary } from '../domain/riskAnalysis'
import type { MachineInputs } from '../domain/types'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #dbe4dc',
  boxShadow: '0 10px 30px rgba(24, 51, 42, .10)',
  fontSize: 12,
}

export function RiskAnalysis({ input }: { input: MachineInputs }) {
  const scenarios = useMemo(() => buildScenarios(input), [input])
  const sensitivity = useMemo(() => calculateSensitivity(input), [input])
  const decision = useMemo(() => getDecisionSummary(input), [input])
  const strongestRisk = sensitivity[0]
  const chartData = sensitivity.slice(0, 6).map((point) => ({
    ...point,
    impact: Math.max(0, point.paybackImpactPercent ?? 0),
    label: `${point.name} ${point.assumption}`,
  }))

  return (
    <section id="risk-analysis" className="scroll-mt-24 py-18 print:break-before-page">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Устойчивость решения</p>
          <h2 className="page-title mt-2">Что будет, если план не сработает идеально</h2>
          <p className="page-copy">Стресс-тест показывает диапазон результата, а чувствительность — какой параметр сильнее всего влияет на окупаемость.</p>
        </div>
        <div className={`decision-badge decision-${decision.tone}`}>
          {decision.tone === 'positive' ? <BadgeCheck size={19} /> : <ShieldAlert size={19} />}
          <span>{decision.title}</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[#e1e8e2] p-5 sm:p-6">
            <p className="chart-kicker">Три сценария</p>
            <h3 className="chart-title">Диапазон инвестиционного результата</h3>
          </div>
          <div className="divide-y divide-[#e6ece7]">
            {scenarios.map((scenario) => {
              const isBase = scenario.id === 'base'
              const positive = scenario.result.annualCashFlow > 0
              return (
                <div key={scenario.id} className={`p-5 sm:p-6 ${isBase ? 'bg-[#f2f7ef]' : 'bg-white'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {scenario.id === 'optimistic' ? <ArrowUpRight size={17} className="text-[#5f8617]" /> : scenario.id === 'stress' ? <ArrowDownRight size={17} className="text-[#b1483f]" /> : <Activity size={17} className="text-[#0b6b45]" />}
                        <h4 className="font-semibold">{scenario.label}</h4>
                        {isBase && <span className="rounded-full bg-[#dfecc6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#55721a]">Текущий</span>}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#74827b]">{scenario.description}</p>
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${positive ? 'bg-[#eaf4dd] text-[#55761c]' : 'bg-[#f8e8e5] text-[#a14239]'}`}>
                      {positive ? 'Поток +' : 'Поток −'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#e1e8e2] bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-[#7b8982]">Окупаемость</p>
                      <p className="mt-1 text-sm font-semibold">{formatPayback(scenario.result.paybackYears)}</p>
                    </div>
                    <div className="rounded-xl border border-[#e1e8e2] bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-[#7b8982]">Поток в год</p>
                      <p className={`mt-1 text-sm font-semibold ${positive ? '' : 'text-[#a14239]'}`}>{formatMoney(scenario.result.annualCashFlow)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="chart-kicker">Анализ чувствительности</p>
              <h3 className="chart-title">Рост срока окупаемости при ухудшении фактора</h3>
              <p className="mt-1 text-xs leading-5 text-[#74827b]">Каждый фактор изменяется отдельно, остальные параметры остаются базовыми.</p>
            </div>
            <AlertTriangle size={22} className="shrink-0 text-[#c28c20]" />
          </div>
          <div className="mt-5 h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 28 }}>
                <CartesianGrid stroke="#e7ece8" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6d7d75' }} tickFormatter={(value) => `+${Math.round(value)}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" width={132} tick={{ fontSize: 10, fill: '#53675e' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`+${Number(value).toFixed(1)}%`, 'к сроку окупаемости']} contentStyle={tooltipStyle} />
                <Bar dataKey="impact" radius={[0, 7, 7, 0]} barSize={25}>
                  {chartData.map((point, index) => <Cell key={point.key} fill={index === 0 ? '#b1483f' : '#d3a42a'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {strongestRisk && (
            <div className="rounded-2xl border border-[#efd9d4] bg-[#fcf4f1] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a24b42]">Главный фактор риска</p>
              <p className="mt-1 text-sm font-semibold">{strongestRisk.name}: {strongestRisk.assumption}</p>
              <p className="mt-1 text-xs leading-5 text-[#765e59]">
                {strongestRisk.becomesUnprofitable
                  ? 'При таком отклонении сценарий перестаёт формировать положительную окупаемость.'
                  : `Ожидаемое увеличение срока окупаемости — на ${Math.max(0, strongestRisk.paybackImpactPercent ?? 0).toFixed(1)}%.`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-5 decision-panel decision-${decision.tone}`}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.13em] opacity-70">Инвестиционный вывод</p>
          <h3 className="mt-1 text-lg font-semibold">{decision.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 opacity-80">{decision.description}</p>
        </div>
      </div>
    </section>
  )
}
