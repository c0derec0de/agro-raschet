import { ArrowLeftRight, Check, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { calculateEconomics } from '../domain/calculations'
import { formatMoney, formatNumber, formatPayback } from '../domain/formatters'
import type { CalculationResult, MachineInputs, MachinePreset } from '../domain/types'
import { ComparisonChart } from './Charts'

interface Props {
  currentInput: MachineInputs
  currentResult: CalculationResult
  presets: MachinePreset[]
}

export function Comparison({ currentInput, currentResult, presets }: Props) {
  const [selectedId, setSelectedId] = useState(presets[1]?.id ?? presets[0].id)
  const selected = presets.find((preset) => preset.id === selectedId) ?? presets[0]
  const selectedResult = useMemo(() => calculateEconomics(selected.values), [selected])

  const rows = [
    ['Себестоимость часа', formatMoney(currentResult.costHour), formatMoney(selectedResult.costHour)],
    ['Себестоимость гектара', formatMoney(currentResult.costHectare), formatMoney(selectedResult.costHectare)],
    ['Простой срок окупаемости', formatPayback(currentResult.paybackYears), formatPayback(selectedResult.paybackYears)],
    ['Годовой денежный поток', formatMoney(currentResult.annualCashFlow), formatMoney(selectedResult.annualCashFlow)],
    ['Обработка за год', `${formatNumber(currentResult.annualArea)} га`, `${formatNumber(selectedResult.annualArea)} га`],
  ]

  return (
    <section id="comparison" className="scroll-mt-24 py-18 print:break-before-page">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Сценарный анализ</p>
          <h2 className="page-title mt-2">Сравните два варианта</h2>
          <p className="page-copy">Сопоставьте текущий расчёт с одним из базовых сценариев по затратам и окупаемости.</p>
        </div>
        <label className="min-w-[280px] print:hidden">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6d7d75]">Второй сценарий</span>
          <select className="input-base" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-[#e0e7e1] bg-[#f6f8f4] text-sm">
            <div className="p-4 sm:p-5"><ArrowLeftRight size={20} className="text-[#0b6b45]" /></div>
            <div className="border-l border-[#e0e7e1] p-4 sm:p-5">
              <span className="block text-[10px] uppercase tracking-wide text-[#77867f]">Текущий</span>
              <strong className="mt-1 block leading-tight">{currentInput.name}</strong>
            </div>
            <div className="border-l border-[#e0e7e1] p-4 sm:p-5">
              <span className="block text-[10px] uppercase tracking-wide text-[#77867f]">Сравнение</span>
              <strong className="mt-1 block leading-tight">{selected.label}</strong>
            </div>
          </div>
          <div className="divide-y divide-[#e7ece8]">
            {rows.map(([label, first, second]) => (
              <div key={label} className="grid grid-cols-[1.1fr_1fr_1fr] text-sm">
                <div className="p-4 text-[#697970] sm:px-5">{label}</div>
                <div className="border-l border-[#e7ece8] p-4 font-semibold sm:px-5">{first}</div>
                <div className="border-l border-[#e7ece8] p-4 font-semibold sm:px-5">{second}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e0e7e1] bg-[#fbfcfa] p-4 text-xs leading-5 text-[#6c7b74] sm:px-5">
            <div className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#6f9418]" /> Экономические параметры пресетов — демонстрационные и редактируемые. Сравнивайте сценарии с одинаковыми производственными допущениями.</div>
            <a className="mt-2 inline-flex items-center gap-1 font-semibold text-[#0b6b45] hover:underline" href={selected.sourceUrl} target="_blank" rel="noreferrer">Технический источник: {selected.sourceLabel} <ExternalLink size={12} /></a>
          </div>
        </div>

        <ComparisonChart
          first={{ name: currentInput.name, result: currentResult }}
          second={{ name: selected.label, result: selectedResult }}
        />
      </div>
    </section>
  )
}
