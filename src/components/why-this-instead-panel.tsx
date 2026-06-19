import Link from 'next/link'
import { buildAlternativeReasoningSet, type AlternativeReasoning } from '../lib/why-this-instead'
import { formatDisplayLabel } from '@/lib/display-utils'

type WhyThisInsteadPanelProps = {
  record: any
  alternatives?: any[]
  title?: string
  limit?: number
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-brand-900/10 bg-white/75 px-3 py-1 text-[0.72rem] font-semibold text-[#46574d]">
      {label}: {formatDisplayLabel(value)}
    </span>
  )
}

function NameBlock({ node, eyebrow }: { node: AlternativeReasoning['source']; eyebrow: string }) {
  const content = (
    <div className="rounded-2xl border border-brand-900/10 bg-white/75 p-4 transition hover:border-brand-700/20 hover:bg-white">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-900/55">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">{node.label}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <MetricPill label="Stimulation" value={node.visuals.stimulation} />
        <MetricPill label="Timeline" value={node.visuals.timeline} />
      </div>
    </div>
  )

  return node.href ? <Link href={node.href}>{content}</Link> : content
}

function ComparisonCard({ item }: { item: AlternativeReasoning }) {
  return (
    <article className="rounded-3xl border border-brand-900/10 bg-paper-50/80 p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <NameBlock node={item.source} eyebrow="Why this" />
        <NameBlock node={item.alternative} eyebrow="Instead of" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.contrastChips.map((chip) => (
          <span key={chip} className="rounded-full border border-brand-900/10 bg-white/70 px-3 py-1 text-xs font-semibold text-[#46574d]">
            {formatDisplayLabel(chip)}
          </span>
        ))}
      </div>

      <ul className="mt-4 space-y-2 text-sm leading-7 text-[#46574d]">
        {item.rationale.map((reason) => (
          <li key={reason} className="flex gap-3">
            <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-2xl border border-brand-900/10 bg-white/70 p-4 text-sm leading-7 text-[#33443a]">
        {item.fitFrame}
      </p>
    </article>
  )
}

export default function WhyThisInsteadPanel({ record, alternatives = [], title = 'Why this instead?', limit = 3 }: WhyThisInsteadPanelProps) {
  const comparisons = buildAlternativeReasoningSet(record, alternatives, limit)
  if (comparisons.length === 0) return null

  return (
    <section className="card-premium space-y-5 p-5 sm:p-7 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="eyebrow-label">Comparative Reasoning</p>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#46574d]">
          Fit-first comparisons that explain direction, tolerance context, and expectations without ranking one option as universally better.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {comparisons.map((item) => (
          <ComparisonCard key={`${item.source.slug}-${item.alternative.slug}`} item={item} />
        ))}
      </div>
    </section>
  )
}
