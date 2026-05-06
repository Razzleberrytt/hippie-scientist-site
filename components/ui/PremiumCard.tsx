import Link from 'next/link'
import EvidenceBadge from '@/components/ui/EvidenceBadge'

type SafetyTone = 'ok' | 'caution' | 'avoid' | 'unknown'

export type PremiumCardProps = {
  href: string
  title: string
  summary?: string
  typeLabel?: string
  evidence?: string
  safety?: string
  bestFor?: string
  tags?: string[]
  ctaLabel?: string
}

function normalizeSafety(value?: string): SafetyTone {
  const text = String(value || '').toLowerCase()
  if (/avoid|contraindicat|high concern|do not|pregnan/.test(text)) return 'avoid'
  if (/caution|interaction|review|consult|medication|unknown|limited/.test(text)) return 'caution'
  if (/generally|well tolerated|low concern|ok|safe/.test(text)) return 'ok'
  return 'unknown'
}

function safetyClasses(tone: SafetyTone) {
  if (tone === 'avoid') return 'border-red-700/15 bg-red-50 text-red-800'
  if (tone === 'caution') return 'border-amber-700/20 bg-amber-50 text-amber-800'
  if (tone === 'ok') return 'border-emerald-700/15 bg-emerald-50 text-emerald-800'
  return 'border-slate-300 bg-slate-50 text-slate-700'
}

function safetyLabel(tone: SafetyTone) {
  if (tone === 'avoid') return 'Avoid flag'
  if (tone === 'caution') return 'Caution'
  if (tone === 'ok') return 'Low concern'
  return 'Review safety'
}

const clean = (value?: string) => String(value || '').replace(/\s+/g, ' ').trim()

export default function PremiumCard({
  href,
  title,
  summary,
  typeLabel = 'Profile',
  evidence,
  safety,
  bestFor,
  tags = [],
  ctaLabel = 'Open profile',
}: PremiumCardProps) {
  const safetyTone = normalizeSafety(safety)
  const cleanSummary = clean(summary)
  const cleanBestFor = clean(bestFor)
  const visibleTags = tags.map(clean).filter(Boolean).slice(0, 3)

  return (
    <article className="group flex h-full flex-col rounded-card border border-brand-900/10 bg-white/82 p-6 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand-700/25 hover:bg-white hover:shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div className="eyebrow text-brand-700">
          {typeLabel}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <EvidenceBadge tier={evidence} />

          <span
            title={clean(safety) || 'Safety context should be reviewed before use.'}
            aria-label={`Safety indicator: ${safetyLabel(safetyTone)}`}
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${safetyClasses(safetyTone)}`}
          >
            {safetyLabel(safetyTone)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex-1">
        <Link href={href} className="block rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/20">
          <h2 className="text-display text-[2rem] leading-[1.02] transition group-hover:text-brand-800 sm:text-4xl">
            {title}
          </h2>
        </Link>

        {cleanSummary ? (
          <p className="text-reading mt-5 line-clamp-4 text-base text-muted-soft">
            {cleanSummary}
          </p>
        ) : null}

        {cleanBestFor ? (
          <div className="mt-5 rounded-2xl border border-brand-900/10 bg-paper-100/70 px-4 py-3">
            <p className="text-sm leading-6 text-muted-soft">
              <span className="font-semibold text-ink">Best for:</span> {cleanBestFor}
            </p>
          </div>
        ) : null}

        {visibleTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand-900/10 bg-paper-100 px-3 py-1 text-xs font-medium tracking-wide text-muted-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        href={href}
        className="mt-7 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-1"
      >
        {ctaLabel} →
      </Link>
    </article>
  )
}
