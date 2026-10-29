import { Menu, Sprout, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  ['Калькулятор', '#calculator'],
  ['Риски', '#risk-analysis'],
  ['Решение', '#decision-center'],
  ['Сравнение', '#comparison'],
  ['Методика', '#methodology'],
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#075f3c]/95 text-white backdrop-blur-md print:hidden">
      <div className="site-header-inner mx-auto flex h-18 w-full max-w-[1480px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="АгроРасчёт — на главную">
          <span className="grid size-10 place-items-center rounded-xl bg-[#b7d63d] text-[#074b31]">
            <Sprout size={22} strokeWidth={2.4} />
          </span>
          <span>
            <strong className="block text-[17px] leading-tight tracking-tight">АгроРасчёт</strong>
            <span className="hidden text-[11px] text-white/65 sm:block">Экономика сельхозтехники</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <a href="#calculator" className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#075f3c] transition hover:bg-[#edf6d2] lg:block">
          Выполнить расчёт
        </a>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-5 py-3 lg:hidden" aria-label="Мобильная навигация">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-white/80 hover:bg-white/10">
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
