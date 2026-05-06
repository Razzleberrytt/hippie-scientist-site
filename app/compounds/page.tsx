import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import '@/styles/premium-cards.css'

const INTERNAL_PATTERNS = [
  /research[_\s-]*only/i,
  /lean\s+(monograph\s+)?row/i,
  /schema\s*artifact/i,
  /bulk\s+enrichment/i,
  /bulk\s+mode/i,
  /placeholder/i,
  /enriched\s+in\s+bulk/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^none$/i,
]

function text(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.label ?? record.name ?? record.title ?? record.text ?? record.value)
  }
  return String(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function isClean(value: unknown) {
  const normalized = text(value)
  return Boolean(normalized) && !INTERNAL_PATTERNS.some(pattern => pattern.test(normalized))
}

function list(value: unknown): string[] {
  if (value === null || value === undefined) return []
  const raw = Array.isArray(value) ? value : String(value).split(/\n|;|\|/)
  return raw
    .flatMap(item => text(item).split(/,(?=\s*[a-zA-Z])/))
    .map(item => item.replace(/^[-*•]\s*/, '').trim())
    .filter(isClean)
}

function unique(items: string[]) {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function labelize(value: unknown, fallback = 'Review') {
  const clean = text(value)
  if (!isClean(clean)) return fallback
  return clean
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getName(item: any) {
  return text(item.displayName) || text(item.name) || text(item.slug).replace(/-/g, ' ')
}

function getSummary(item: any) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  if (isClean(summary)) return text(summary)
  return 'A research-backed compound profile with evidence summaries, mechanisms, and scientific context.'
}

function getEvidence(item: any) {
  return labelize(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.summary_quality,
    'Evidence Review'
  )
}

function getSafety(item: any) {
  return labelize(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.profile_status,
    'Safety Review'
  )
}

function getQuality(item: any) {
  return labelize(item.profile_status || item.summary_quality || item.readiness || item.status, 'Profile Review')
}

function getEffects(item: any) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.primaryEffects),
    ...list(item.effects),
    text(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 3)
}

function evidenceClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('strong') || value.includes('high')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('moderate') || value.includes('human')) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

function safetyClass(level: string) {
  const value = level.toLowerCase()

  if (value.includes('safe') || value.includes('complete') || value.includes('high')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('caution') || value.includes('review') || value.includes('partial')) {
    return 'chip-readable'
  }

  return 'rounded-full border border-red-700/10 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800'
}

export default async function CompoundsPage() {
  const compounds = await getCompounds()
  const totalProfiles = compounds.length
  const readyProfiles = compounds.filter((compound: any) => /complete|strong|high|ready/i.test(text(compound.profile_status || compound.summary_quality || compound.safety?.confidence))).length

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-12 sm:py-16 lg:py-20">
        <div className="section-spacing">
          <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl space-y-6">
                <div className="space-y-3">
                  <p className="eyebrow-label">
                    Scientific Compound Library
                  </p>

                  <h1 className="max-w-[12ch]">
                    Compounds
                  </h1>
                </div>

                <p className="detail-reading text-[1.05rem] sm:text-lg">
                  Explore compounds, phytochemicals, amino acids, and bioactive molecules with evidence-aware summaries designed for rapid scientific browsing and comparison.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
                <div className="surface-subtle rounded-2xl px-4 py-3 text-center">
                  <p className="text-2xl font-semibold tracking-tight text-ink">{totalProfiles}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#46574d]">Profiles</p>
                </div>
                <div className="surface-subtle rounded-2xl px-4 py-3 text-center">
                  <p className="text-2xl font-semibold tracking-tight text-ink">{readyProfiles}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#46574d]">High readiness</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6">
            {compounds.map((compound: any) => {
              const evidence = getEvidence(compound)
              const safety = getSafety(compound)
              const quality = getQuality(compound)
              const effects = getEffects(compound)

              return (
                <article
                  key={compound.slug}
                  className="card-premium group flex h-full flex-col p-5 sm:p-6"
                >
                  <div className="metadata-row">
                    <span className={evidenceClass(evidence)}>
                      {evidence}
                    </span>

                    <span className={safetyClass(safety)}>
                      {safety}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-1 flex-col">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-700">
                          {quality}
                        </p>

                        <h2 className="max-w-[18ch] text-[1.45rem] font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
                          {getName(compound)}
                        </h2>
                      </div>

                      <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                        {getSummary(compound)}
                      </p>
                    </div>

                    {effects.length > 0 ? (
                      <div className="mt-5 border-t border-brand-900/10 pt-4">
                        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
                          Research focus
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {effects.map(effect => (
                            <span key={effect} className="rounded-full border border-brand-900/10 bg-paper-50 px-3 py-1 text-xs font-medium text-[#33443a]">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-auto pt-6">
                      <Link
                        href={`/compounds/${compound.slug}`}
                        className="button-secondary w-full rounded-full px-4 py-2.5 text-sm sm:w-auto"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
