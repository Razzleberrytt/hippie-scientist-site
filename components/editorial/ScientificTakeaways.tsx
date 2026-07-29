type Confidence = 'High' | 'Moderate' | 'Limited'

type Takeaway = {
  claim: string
  confidence?: Confidence
  context?: string
}

type ScientificTakeawaysProps = {
  title?: string
  summary?: string
  items: Takeaway[]
}

const confidenceClasses: Record<Confidence, string> = {
  High: 'border-emerald-700/20 bg-emerald-50 text-emerald-900',
  Moderate: 'border-amber-700/20 bg-amber-50 text-amber-900',
  Limited: 'border-rose-700/20 bg-rose-50 text-rose-900',
}

export default function ScientificTakeaways({
  title = 'Scientific Takeaways',
  summary,
  items,
}: ScientificTakeawaysProps) {
  if (!items.length) return null

  return (
    <aside aria-labelledby="scientific-takeaways-title" className="my-8 rounded-3xl border border-brand-900/15 bg-brand-50/60 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Citation-ready summary</p>
      <h2 id="scientific-takeaways-title" className="mt-2 text-2xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      {summary ? <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{summary}</p> : null}

      <ul className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li key={`${item.claim}-${index}`} className="rounded-2xl border border-brand-900/10 bg-white/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-ink">{item.claim}</p>
              {item.confidence ? (
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${confidenceClasses[item.confidence]}`}>
                  {item.confidence} confidence
                </span>
              ) : null}
            </div>
            {item.context ? <p className="mt-2 text-sm leading-6 text-muted">{item.context}</p> : null}
          </li>
        ))}
      </ul>
    </aside>
  )
}
