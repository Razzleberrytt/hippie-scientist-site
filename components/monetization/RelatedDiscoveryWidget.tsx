import Link from 'next/link'

export type DiscoveryItem = {
  label: string
  title: string
  description: string
  href: string
  type: 'comparison' | 'protocol' | 'herb' | 'compound' | 'guide'
}

export type RelatedDiscoveryWidgetProps = {
  heading?: string
  subheading?: string
  items: DiscoveryItem[]
  className?: string
}

const typeColor: Record<string, string> = {
  comparison: 'text-emerald-700 bg-emerald-50/50 border-emerald-200',
  protocol: 'text-blue-700 bg-blue-50/50 border-blue-200',
  herb: 'text-amber-700 bg-amber-50/50 border-amber-200',
  compound: 'text-purple-700 bg-purple-50/50 border-purple-200',
  guide: 'text-slate-700 bg-slate-50/50 border-slate-200',
}

const typeLabel: Record<string, string> = {
  comparison: 'Comparison',
  protocol: 'Protocol',
  herb: 'Herb',
  compound: 'Compound',
  guide: 'Guide',
}

export function RelatedDiscoveryWidget({
  heading = 'Deepen your research',
  subheading,
  items,
  className = '',
}: RelatedDiscoveryWidgetProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-ink">{heading}</h2>
        {subheading && <p className="text-sm leading-6 text-muted">{subheading}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const colors = typeColor[item.type] || typeColor.guide
          return (
            <Link
              key={`discovery-${idx}`}
              href={item.href}
              className={`rounded-[1.25rem] border p-5 transition hover:-translate-y-0.5 ${colors}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-75">{typeLabel[item.type]}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
