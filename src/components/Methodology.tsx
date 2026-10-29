import { BookOpen, CircleDollarSign, ExternalLink, Info, Sigma } from 'lucide-react'

const formulas = [
  ['Себестоимость часа', 'Топливо + амортизация/ч + сервис/ч + прочие/ч'],
  ['Эффективная выработка', 'Производительность × коэффициент использования'],
  ['Себестоимость гектара', 'Себестоимость часа ÷ эффективная выработка'],
  ['Денежный поток', 'Площадь × (экономия + новый доход)/га − топливо − сервис − прочие'],
  ['Простая окупаемость', 'Стоимость покупки ÷ годовой денежный поток'],
  ['Минимальная площадь', 'Постоянные затраты ÷ (тариф подрядчика − топливо/га)'],
  ['Покрытие платежа', 'Денежный поток до финансирования ÷ годовой платёж'],
]

export function Methodology() {
  return (
    <section id="methodology" className="scroll-mt-24 pb-20 print:break-before-page">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[24px] bg-[#075f3c] p-6 text-white sm:p-8">
          <BookOpen className="text-[#b7d63d]" size={29} />
          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.14em] text-[#d8ee87]">Методика</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Что именно считает модель</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/68">
            Бухгалтерская себестоимость включает амортизацию, а денежная окупаемость — только реальные годовые поступления и выплаты. Так инвестиция не учитывается дважды.
          </p>
          <div className="mt-7 rounded-2xl border border-white/12 bg-white/8 p-4 text-xs leading-5 text-white/64">
            <Info size={16} className="mb-2 text-[#b7d63d]" />
            Результат является оценочным и зависит от цены покупки, производственных условий, загрузки, урожайности и других введённых допущений. Это не банковское или инвестиционное предложение.
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0e9] text-[#0b6b45]"><Sigma size={20} /></span>
            <div><p className="eyebrow">Формулы</p><h3 className="mt-1 text-lg font-semibold">Проверяемая логика расчёта</h3></div>
          </div>
          <div className="mt-6 divide-y divide-[#e4ebe5] border-y border-[#e4ebe5]">
            {formulas.map(([name, formula]) => (
              <div key={name} className="grid gap-1 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4">
                <span className="text-sm font-medium">{name}</span>
                <code className="text-xs leading-5 text-[#63746c]">{formula}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SourceCard
          icon={CircleDollarSign}
          title="Беларус 82.1"
          text="Техническая основа пресета: двигатель Д-243, мощность 60 кВт и опубликованный удельный расход. Денежные и эксплуатационные значения помечены как демонстрационные."
          href="https://mtz.ru/catalog/traktory/bazovaya-model-belarus-80-1/belarus-82-1-2020"
          label="Официальный сайт МТЗ"
        />
        <SourceCard
          icon={CircleDollarSign}
          title="ACROS 595 Plus"
          text="Техническая основа пресета: мощность до 330 л.с., производительность до 25 т/ч и сезонная наработка до 1 250 га. Экономика остаётся редактируемой."
          href="https://moscow.rostselmash.com/products/combine/acros/"
          label="Официальный сайт Ростсельмаш"
        />
      </div>
    </section>
  )
}

function SourceCard({ icon: Icon, title, text, href, label }: { icon: typeof CircleDollarSign; title: string; text: string; href: string; label: string }) {
  return (
    <article className="panel p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef5d5] text-[#688718]"><Icon size={20} /></span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6c7c74]">{text}</p>
          <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b6b45] hover:underline">{label} <ExternalLink size={12} /></a>
        </div>
      </div>
    </article>
  )
}
