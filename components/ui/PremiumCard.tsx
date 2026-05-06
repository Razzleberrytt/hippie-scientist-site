import Link from 'next/link'

type EvidenceTone = 'strong' | 'moderate' | 'limited' | 'theoretical'
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

const EVIDENCE_COPY: Record<EvidenceTone, { label: string; className: string; help: string }> = {
  strong: {
    label: 'Strong',
    className: 'border-emerald-700/15 bg-emerald-700/10 text-emerald-800',
    help: 'Strong evidence: higher-confidence human evidence or consistent clinical support.',
  },
  moderate: {
    label: 'Moderate',
    className: 'border-blue-700/15 bg-blue-700/10 text-blue-800',
    help: 'Moderate evidence: useful human evidence with limitations or mixed certainty.',
  },
  limited: {
    label: 'Limited',
    className: 'border-amber-700/20 bg-amber-700/10 text-amber-800',
    help: 'Limited evidence: preliminary, early, small, mechanistic, or incomplete human evidence.',
  },
  theoretical: {
    label: 'Theoretical',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
    help: 'Theoretical evidence: traditional, mechanistic, or low-direct-human-evidence support.',
  },
}

function normalizeEvidence(value?: string): EvidenceTone {
  const text = String(value || '').toLowerCase()
  if (/strong|high|tier\s*a|grade\s*a|\ba\b/.test(text)) return 'strong'
  if (/moderate|medium|tier\s*b|grade\s*b|\bb\b/.test(text)) return 'moderate'
  if (/theoretical|traditional|mechanistic|very low|tier\s*d|grade\s*d|\bd\b/.test(text)) return 'theoretical'
  return 'limited'
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
  const evidenceTone = normalizeEvidence(evidence)
  const evidenceMeta = EVIDENCE_COPY[evidenceTone]
  const safetyTone = normalizeSafety(safety)
  const cleanSummary = clean(summary)
  const cleanBestFor = clean(bestFor)
  const visibleTags = tags.map(clean).filter(Boolean).slice(0, 3)

  return (
    <article className="group flex h-full flex-col rounded-card border border-brand-900/10 bg-white/80 p-5 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand-700/25 hover:bg-white hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="eyebrow text-brand-700">{typeLabel}</div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Link
            href="/evidence-standards"
            title={evidenceMeta.help}
            aria-label={`${evidenceMeta.label} evidence. ${evidenceMeta.help}`}
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${evidenceMeta.className}`}
          >
            {evidenceMeta.label}
          </Link>
          <span
            title={clean(safety) || 'Safety context should be reviewed before use.'}
            aria-label={`Safety indicator: ${safetyLabel(safetyTone)}`}
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${safetyClasses(safetyTone)}`}
          >
            {safetyLabel(safetyTone)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <Link href={href} className="block focus:outline-none focus:ring-4 focus:ring-brand-500/25 rounded-xl">
          <h2 className="text-display text-3xl transition group-hover:text-brand-800">
            {title}
          </h2>
        </Link>

        {cleanSummary ? (
          <p className="text-reading mt-4 line-clamp-4 text-muted-soft">
            {cleanSummary}
          </p>
        ) : null}

        {cleanBestFor ? (
          <p className="mt-4 text-sm leading-6 text-muted-soft">
            <span className="font-semibold text-ink">Best for:</span> {cleanBestFor}
          </p>
        ) : null}

        {visibleTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span key={tag} className="rounded-full border border-brand-900/10 bg-paper-100 px-3 py-1 text-xs font-medium text-muted-soft">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Link href={href} className="mt-6 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-1">
        {ctaLabel} →
      </Link>
    </article>
  )
}
