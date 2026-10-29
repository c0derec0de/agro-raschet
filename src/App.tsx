import { zodResolver } from '@hookform/resolvers/zod'
import { BarChart3, Calculator, FileDown, RefreshCw } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { CalculatorForm } from './components/CalculatorForm'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Methodology } from './components/Methodology'
import { ResultsPanel } from './components/ResultsPanel'
import { calculateEconomics } from './domain/calculations'
import { machineSchema, type MachineFormValues } from './domain/schema'
import type { MachinePreset } from './domain/types'
import { customValues, defaultValues, presets } from './data/presets'

const STORAGE_KEY = 'agro-raschet-inputs-v2'

const PaybackChart = lazy(() => import('./components/Charts').then((module) => ({ default: module.PaybackChart })))
const RiskAnalysis = lazy(() => import('./components/RiskAnalysis').then((module) => ({ default: module.RiskAnalysis })))
const InvestmentDecision = lazy(() => import('./components/InvestmentDecision').then((module) => ({ default: module.InvestmentDecision })))
const Comparison = lazy(() => import('./components/Comparison').then((module) => ({ default: module.Comparison })))

function loadSavedValues(): MachineFormValues {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultValues
    const parsed = machineSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : defaultValues
  } catch {
    return defaultValues
  }
}

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState('belarus-82-1')
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    mode: 'onChange',
    defaultValues: loadSavedValues(),
  })
  const watched = useWatch({ control: form.control })
  const parsed = useMemo(() => machineSchema.safeParse(watched), [watched])
  const result = useMemo(() => parsed.success ? calculateEconomics(parsed.data) : null, [parsed])
  const heroResult = useMemo(() => calculateEconomics(defaultValues), [])

  useEffect(() => {
    if (parsed.success) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data))
  }, [parsed])

  useEffect(() => {
    if (!window.location.hash) return
    const timer = window.setTimeout(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    }, 900)
    return () => window.clearTimeout(timer)
  }, [])

  const applyPreset = (preset: MachinePreset | 'custom') => {
    if (preset === 'custom') {
      setSelectedPreset('custom')
      form.reset(customValues)
      return
    }
    setSelectedPreset(preset.id)
    form.reset(preset.values)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSelectedPreset('belarus-82-1')
    form.reset(defaultValues)
  }

  return (
    <div className="min-h-screen bg-[#f3f6f1] text-[#18332a]">
      <Header />
      <Hero result={heroResult} />

      <main>
        <section id="possibilities" className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 sm:py-18 print:hidden">
          <div className="grid gap-4 md:grid-cols-3">
            <Feature icon={Calculator} number="01" title="Точная структура затрат" text="Топливо, амортизация, сервис и прочие расходы показаны отдельно — на час и гектар." />
            <Feature icon={RefreshCw} number="02" title="Сценарии в реальном времени" text="Измените цену топлива, загрузку или выработку и сразу увидите влияние на экономику." />
            <Feature icon={BarChart3} number="03" title="Решение, а не только цифры" text="Покупка, аренда, подрядчик, кредит и лизинг сравниваются на одинаковой загрузке." />
          </div>
        </section>

        <section id="calculator" className="scroll-mt-24 border-y border-[#dfe7df] bg-[#eef2ec] print:border-0 print:bg-white">
          <div className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 sm:py-20 print:max-w-none print:p-0">
            <div className="print-only mb-8">
              <p className="text-sm font-semibold text-[#0b6b45]">АгроРасчёт</p>
              <h1 className="mt-2 text-3xl font-semibold">Отчёт по экономике сельхозтехники</h1>
              <p className="mt-2 text-sm text-[#617269]">Расчёт сформирован по введённым пользователем допущениям.</p>
            </div>

            <div className="mb-9 print:hidden">
              <p className="eyebrow">Калькулятор</p>
              <h2 className="page-title mt-2">Экономика техники — без скрытых допущений</h2>
              <p className="page-copy">Выберите готовый сценарий, проверьте исходные данные и получите расчёт. Все поля можно редактировать.</p>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
              <div className="print-hide">
                <CalculatorForm form={form} presets={presets} selectedPreset={selectedPreset} onPreset={applyPreset} onReset={reset} />
              </div>
              <ResultsPanel input={watched} result={result} onPrint={() => window.print()} />
            </div>

            {result && (
              <div className="mt-6">
                <Suspense fallback={<AnalyticsSkeleton height="h-[380px]" />}>
                  <PaybackChart result={result} />
                </Suspense>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
          {parsed.success && (
            <Suspense fallback={<AnalyticsSkeleton height="my-18 h-[620px]" />}>
              <RiskAnalysis input={parsed.data} />
            </Suspense>
          )}
          {result && parsed.success && (
            <Suspense fallback={<AnalyticsSkeleton height="my-18 h-[760px]" />}>
              <InvestmentDecision input={parsed.data} result={result} />
            </Suspense>
          )}
          {result && parsed.success && (
            <Suspense fallback={<AnalyticsSkeleton height="my-18 h-[480px]" />}>
              <Comparison currentInput={parsed.data} currentResult={result} presets={presets} />
            </Suspense>
          )}
          <Methodology />
        </div>
      </main>

      <footer className="border-t border-[#dce5dd] bg-white print:hidden">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">АгроРасчёт</p>
            <p className="mt-1 text-xs text-[#74827b]">Инструмент предварительной оценки экономики сельхозтехники</p>
          </div>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075f3c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#064c32]">
            <FileDown size={17} /> Скачать / распечатать расчёт
          </button>
        </div>
      </footer>
    </div>
  )
}

function AnalyticsSkeleton({ height }: { height: string }) {
  return <div className={`panel animate-pulse bg-white/70 ${height}`} aria-label="Загрузка аналитики" />
}

function Feature({ icon: Icon, number, title, text }: { icon: typeof Calculator; number: string; title: string; text: string }) {
  return (
    <article className="panel flex gap-4 p-5 sm:p-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f0e9] text-[#0b6b45]"><Icon size={21} /></span>
      <div>
        <div className="flex items-center gap-2"><span className="text-[10px] font-bold tracking-widest text-[#91a198]">{number}</span><h3 className="font-semibold">{title}</h3></div>
        <p className="mt-2 text-sm leading-6 text-[#6c7c74]">{text}</p>
      </div>
    </article>
  )
}
