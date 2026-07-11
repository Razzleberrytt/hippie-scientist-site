import SafetyGaugeMeter from './SafetyGaugeMeter'

export interface SafetyCautionGroup {
  title: string
  items: string[]
}

interface Props {
  summary: string
  groups?: SafetyCautionGroup[]
  score?: number
  scoreLabel?: string
  heading?: string
}

export default function SafetyCautionPanel({
  summary,
  groups = [],
  score,
  scoreLabel,
  heading = 'Safety & Cautions',
}: Props) {
  const visibleGroups = groups.filter((group) => group.items.length > 0)

  return (
    <section
      id="safety"
      className="scroll-mt-24 rounded-2xl border border-amber-900/10 border-l-4 border-l-amber-500/60 bg-amber-50/70 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{heading}</h2>
          <p className="mt-1.5 text-sm leading-6 text-amber-950">{summary}</p>
        </div>
        {typeof score === 'number' && scoreLabel ? (
          <SafetyGaugeMeter score={score} label={scoreLabel} className="shrink-0 sm:w-44" />
        ) : null}
      </div>

      {visibleGroups.length > 0 ? (
        <details className="group mt-4 border-t border-amber-900/10 pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-sm font-bold text-amber-950 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 [&::-webkit-details-marker]:hidden">
            <span>
              Browse {visibleGroups.length} safety {visibleGroups.length === 1 ? 'category' : 'categories'}
            </span>
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
          </summary>

          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold text-amber-900/75">
              Swipe or scroll sideways to review each category.
            </p>
            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 pr-1 [scrollbar-gutter:stable]"
              aria-label="Detailed safety categories"
            >
              {visibleGroups.map((group) => (
                <article
                  key={group.title}
                  className="min-w-[86%] snap-start rounded-xl border border-amber-900/10 bg-white/80 p-3.5 shadow-sm sm:min-w-[20rem] sm:max-w-[22rem]"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    {group.title}
                  </h3>
                  <div className="mt-2 max-h-48 overflow-y-auto overscroll-contain pr-1">
                    <ul className="space-y-2 text-xs leading-5 text-amber-950/90">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/70" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </section>
  )
}
