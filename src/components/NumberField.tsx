import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { formatMoney } from '../domain/formatters'

interface NumberFieldProps {
  label: string
  unit: string
  hint?: string
  help?: string
  error?: FieldError
  registration: UseFormRegisterReturn
  min?: number
  max?: number
  step?: number
  value?: number
  money?: boolean
}

export function NumberField({ label, unit, hint, help, error, registration, min = 0, max, step = 1, value, money }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#29463c]">{label}</span>
      <span className={`flex h-11 items-center rounded-xl border bg-white transition focus-within:ring-3 ${error ? 'border-[#c33f35] focus-within:ring-[#c33f35]/10' : 'border-[#ccd8d0] focus-within:border-[#0b6b45] focus-within:ring-[#0b6b45]/10'}`}>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] font-medium text-[#18332a] outline-none"
          aria-invalid={Boolean(error)}
          {...registration}
        />
        <span className="mr-2 shrink-0 rounded-lg bg-[#f0f4ef] px-2.5 py-1.5 text-xs font-medium text-[#61736b]">{unit}</span>
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-[#b33830]">{error.message}</span>
      ) : (
        <>
          {money && typeof value === 'number' && Number.isFinite(value) && <span className="mt-1 block text-xs text-[#77867f]">{formatMoney(value)}</span>}
          {hint && <span className="mt-1 block text-xs text-[#77867f]">{hint}</span>}
          {help && (
            <details className="field-help mt-1.5 text-xs text-[#60736a]">
              <summary>Как оценить показатель</summary>
              <p>{help}</p>
            </details>
          )}
        </>
      )}
    </label>
  )
}
