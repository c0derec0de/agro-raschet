import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CalculationResult } from '../domain/types'
import { formatCompactMoney, formatMoney } from '../domain/formatters'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #dbe4dc',
  boxShadow: '0 10px 30px rgba(24, 51, 42, .10)',
  fontSize: 12,
}

export function CostBreakdownChart({ result }: { result: CalculationResult }) {
  const data = result.costStructure.filter((item) => item.value > 0)

  return (
    <div className="chart-card">
      <div className="mb-2">
        <p className="chart-kicker">График 1</p>
        <h4 className="chart-title">Структура себестоимости часа</h4>
      </div>
      <div className="relative h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={2} stroke="none">
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value) => [formatMoney(Number(value)), 'в час']} contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#53675e' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 top-[99px] text-center">
          <span className="block text-[11px] text-[#78877f]">Итого</span>
          <strong className="text-lg">{formatMoney(result.costHour)}</strong>
        </div>
      </div>
    </div>
  )
}

export function PaybackChart({ result }: { result: CalculationResult }) {
  return (
    <div className="chart-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="chart-kicker">График 2</p>
          <h4 className="chart-title">Накопленный денежный поток</h4>
          <p className="mt-1 text-xs text-[#74827b]">В последнем году учтена остаточная стоимость техники.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${result.breaksEvenWithinLife ? 'bg-[#e9f5dc] text-[#4f711a]' : 'bg-[#f8ece9] text-[#9b3d35]'}`}>
          {result.breaksEvenWithinLife && result.breakEvenYear !== null ? `Безубыточность: ${result.breakEvenYear.toFixed(1)} г.` : 'За горизонт не окупается'}
        </span>
      </div>
      <div className="mt-4 h-[310px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.cashFlowSeries} margin={{ top: 10, right: 12, left: 4, bottom: 2 }}>
            <CartesianGrid stroke="#e7ece8" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6d7d75' }} tickLine={false} axisLine={{ stroke: '#d9e1db' }} unit=" г." />
            <YAxis width={68} tick={{ fontSize: 11, fill: '#6d7d75' }} tickLine={false} axisLine={false} tickFormatter={formatCompactMoney} />
            <Tooltip formatter={(value) => [formatMoney(Number(value)), 'Накопленный поток']} labelFormatter={(label) => `Год ${label}`} contentStyle={tooltipStyle} />
            <ReferenceLine y={0} stroke="#a54b42" strokeWidth={1.5} label={{ value: 'точка безубыточности', position: 'insideTopLeft', fontSize: 10, fill: '#a54b42' }} />
            {result.breakEvenYear !== null && <ReferenceLine x={Math.round(result.breakEvenYear)} stroke="#86a820" strokeDasharray="4 4" />}
            <Line type="monotone" dataKey="cashFlow" stroke="#0b6b45" strokeWidth={3} dot={{ r: 3, fill: '#b7d63d', stroke: '#0b6b45', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface ComparisonChartProps {
  first: { name: string; result: CalculationResult }
  second: { name: string; result: CalculationResult }
}

export function ComparisonChart({ first, second }: ComparisonChartProps) {
  const [metric, setMetric] = useState<'hour' | 'hectare'>('hour')
  const data = useMemo(() => [
    { name: first.name, value: metric === 'hour' ? first.result.costHour : first.result.costHectare },
    { name: second.name, value: metric === 'hour' ? second.result.costHour : second.result.costHectare },
  ], [first, second, metric])

  return (
    <div className="chart-card h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="chart-kicker">График 3</p>
          <h4 className="chart-title">Сравнение затрат</h4>
        </div>
        <div className="inline-flex rounded-xl bg-[#eef2ed] p-1 text-xs font-semibold">
          <button type="button" onClick={() => setMetric('hour')} className={`rounded-lg px-3 py-2 ${metric === 'hour' ? 'bg-white text-[#075f3c] shadow-sm' : 'text-[#6b7a73]'}`}>₽/час</button>
          <button type="button" onClick={() => setMetric('hectare')} className={`rounded-lg px-3 py-2 ${metric === 'hectare' ? 'bg-white text-[#075f3c] shadow-sm' : 'text-[#6b7a73]'}`}>₽/га</button>
        </div>
      </div>
      <div className="mt-5 h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid stroke="#e7ece8" strokeDasharray="4 4" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6d7d75' }} tickFormatter={formatCompactMoney} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11, fill: '#53675e' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [formatMoney(Number(value)), metric === 'hour' ? 'за час' : 'за гектар']} contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={34}>
              <Cell fill="#0b6b45" />
              <Cell fill="#b7d63d" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
