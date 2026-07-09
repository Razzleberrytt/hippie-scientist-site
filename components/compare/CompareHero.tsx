import Link from 'next/link'
import type { CompareItem, EvidenceLevel } from '@/lib/compare'

interface CompareHeroProps {
  item1: CompareItem
  item2: CompareItem
}

const EVIDENCE_DOTS = 5

function evidenceLevelToScore(level: EvidenceLevel): number {
  switch (level) {
    case 'strong':      return 5
    case 'moderate':    return 4
    case 'preliminary': return 3
    case 'anecdotal':   return 2
    case 'unknown':     return 1
  }
}

function evidenceLevelLabel(level: EvidenceLevel): string {
  switch (level) {
    case 'strong':      return 'Strong Evidence'
    case 'moderate':    return 'Moderate Evidence'
    case 'preliminary': return 'Preliminary Evidence'
    case 'anecdotal':   return 'Anecdotal / Traditional'
    case 'unknown':     return 'Evidence Unknown'
  }
}

function evidenceDotColorClass(level: EvidenceLevel): string {
  switch (level) {
    case 'strong':      return 'text-evidence-strong'
    case 'moderate':    return 'text-evidence-moderate'
    case 'preliminary': return 'text-evidence-limited'
    case 'anecdotal':   return 'text-evidence-theoretical'
    case 'unknown':     return 'text-evidence-theoretical'
  }
}

function EvidenceDots({ level }: { level: EvidenceLevel }) {
  const score = evidenceLevelToScore(level)
  const colorClass = evidenceDotColorClass(level)
  const label = evidenceLevelLabel(level)

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${colorClass}`}
      aria-label={label}
      title={label}
    >
      {Array.from({ length: EVIDENCE_DOTS }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < score ? 'opacity-100' : 'opacity-20'}
        >
          ●
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold">{label}</span>
    </span>
  )
}

function buildVerdict(item1: CompareItem, item2: CompareItem): string {
  const benefits1 = item1.primaryBenefits.slice(0, 2).join(' and ')
  const benefits2 = item2.primaryBenefits.slice(0, 2).join(' and ')

  if (benefits1 && benefits2) {
    return `Quick verdict: ${item1.name} is typically chosen for ${benefits1}, while ${item2.name} tends to be favored for ${benefits2} — individual responses vary based on biology and goals.`
  }
  if (benefits1) {
    return `Quick verdict: ${item1.name} is primarily associated with ${benefits1}; ${item2.name} offers a distinct mechanism profile — choose based on your specific goals.`
  }
  if (benefits2) {
    return `Quick verdict: ${item2.name} is primarily associated with ${benefits2}; ${item1.name} offers a distinct mechanism profile — choose based on your specific goals.`
  }
  return `Quick verdict: both ${item1.name} and ${item2.name} have distinct mechanisms and use cases — review the evidence and dosing sections below to find the right fit for your goals.`
}

function TypeBadge({ type }: { type: 'herb' | 'compound' }) {
  return (
    <span className="chip-readable">
      {type === 'herb' ? 'Botanical Herb' : 'Bioactive Compound'}
    </span>
  )
}

function ItemCard({ item }: { item: CompareItem }) {
  const firstSentence = item.description.split(/(?<=[.!?])\s+/)[0] ?? item.description

  return (
    <div className="card-premium p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={item.type} />
        {item.category && (
          <span className="chip-readable">{item.category}</span>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-display font-semibold tracking-tight text-ink leading-tight">
          {item.name}
        </h2>
        {item.scientificName && (
          <p className="mt-0.5 text-xs italic text-brand-600 font-medium">
            {item.scientificName}
          </p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted flex-1">
        {firstSentence}
      </p>

      <div className="flex items-center gap-2 text-sm">
        <EvidenceDots level={item.evidenceLevel} />
      </div>

      {item.primaryBenefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.primaryBenefits.slice(0, 4).map((benefit) => (
            <span
              key={benefit}
              className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-medium text-brand-700"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}

      <div className="pt-1">
        <Link
          href={item.pageUrl}
          className="button-secondary text-xs px-3 py-1.5"
        >
          Full {item.name} profile →
        </Link>
      </div>
    </div>
  )
}

export default function CompareHero({ item1, item2 }: CompareHeroProps) {
  const verdict = buildVerdict(item1, item2)

  return (
    <section className="space-y-8 max-w-5xl">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
          Educational Comparison
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink leading-tight sm:text-5xl">
          {item1.name} vs {item2.name}
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Compare evidence quality, mechanisms, dosing, and safety to identify the better fit for your goals.
        </p>
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <a
            href="#compare-decision"
            className="button-primary w-full px-5 py-2.5 text-center text-sm sm:w-auto"
          >
            Get a personal pick ↓
          </a>
          <p className="text-xs leading-5 text-muted sm:max-w-xs">
            Takes about 20 seconds and keeps the recommendation evidence-first.
          </p>
        </div>
      </div>

      <div className="relative grid gap-6 md:grid-cols-2">
        <ItemCard item={item1} />

        <div
          className="flex items-center justify-center md:absolute md:inset-y-0 md:left-1/2 md:-translate-x-1/2 md:z-10"
          aria-hidden="true"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white shadow-lg ring-[3px] ring-[var(--color-paper-50)] dark:ring-[var(--bg)]">
            VS
          </div>
        </div>

        <ItemCard item={item2} />
      </div>

      <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold text-brand-900 leading-relaxed">
          {verdict}
        </p>
        <p className="mt-1.5 text-xs text-muted">
          These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </section>
  )
}
