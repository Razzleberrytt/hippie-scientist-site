import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import '@/styles/premium-cards.css'

function normalize(value: unknown) {
  return String(value || '')
}

function normalizeLower(value: unknown) {
  return normalize(value).toLowerCase()
}

function getName(item: any) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getSummary(item: any) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  return cleanSummary(summary, 'compound')
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
    ...list(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 3)
}

function getMechanisms(item: any) {
  return unique([
    ...list(item.mechanisms),
    ...list(item.pathways),
    item.mechanism_summary,
  ])
    .filter(isClean)
    .slice(0, 2)
}

function evidenceClass(level?: string) {
  const value = normalizeLower(level)

  if (value.includes('strong') || value.includes('high')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('moderate') || value.includes('human')) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

function safetyClass(level?: string) {
  const value = normalizeLower(level)

  if (value.includes('safe') || value.includes('complete') || value.includes('high')) {
    return 'evidence-pill-strong'
  }

  if (value.includes('caution') || value.includes('review') || value.includes('partial')) {
    return 'chip-readable'
  }

  return 'rounded-full border border-red-700/10 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800'
}

function scoreCompound(item: any) {
  let score = 0

  const quality = normalizeLower(
    text(item.profile_status || item.summary_quality || item.safety?.confidence)
  )

  const evidence = normalizeLower(
    text(item.evidence_tier || item.evidence_grade || item.evidenceLevel)
  )

  if (/complete|strong|high|ready/.test(quality)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length
  score += getMechanisms(item).length

  return score
}

export default async function CompoundsPage() {
  const allCompounds = await getCompounds()

  const compounds = allCompounds
    .filter((compound: any) => getRuntimeVisibility(compound).canRender)
    .sort((a: any, b: any) => scoreCompound(b) - scoreCompound(a))

  const totalProfiles = compounds.length

  const readyProfiles = compounds.filter((compound: any) =>
    /complete|strong|high|ready/i.test(
      normalize(text(compound.profile_status || compound.summary_quality || compound.safety?.confidence))
    )
  ).length

  const evidenceForward = compounds.filter((compound: any) =>
    /human|clinical|strong|high/i.test(
      normalize(text(compound.evidence_tier || compound.evidence_grade || compound.evidenceLevel))
    )
  ).length

  const featuredMechanisms = [
    'GABA Signaling',
    'Neurotransmitters',
    'Inflammatory Pathways',
    'Oxidative Stress',
    'Metabolic Signaling',
    'Mitochondrial Function',
  ]

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
                  Explore phytochemicals, amino acids, alkaloids, and bioactive molecules organized around mechanisms, evidence maturity, and research pathways.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredMechanisms.map(signal => (
                    <span key={signal} className="chip-readable">
                      {signal}
                    </span>
                  ))}
                </div>
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

                <div className="surface-subtle rounded-2xl px-4 py-3 text-center col-span-2 sm:col-span-1">
                  <p className="text-2xl font-semibold tracking-tight text-ink">{evidenceForward}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#46574d]">Human evidence</p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-depth card-spacing">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <p className="eyebrow-label">
                  Mechanism-first discovery
                </p>

                <h2 className="max-w-[18ch]">
                  Browse compounds by pathways, signals, and molecular context.
                </h2>

                <p className="detail-reading text-base">
                  Profiles with stronger evidence maturity, mechanism mapping, and relationship depth are surfaced first for faster scientific navigation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Clinical Evidence', 'Neurochemistry', 'Adaptogenic Signals', 'Metabolism', 'Recovery', 'Cognition'].map(filter => (
                  <span key={filter} className="chip-readable">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6">
            {compounds.map((compound: any, index: number) => {
              const evidence = getEvidence(compound)
              const safety = getSafety(compound)
              const quality = getQuality(compound)
              const effects = getEffects(compound)
              const mechanisms = getMechanisms(compound)

              return (
                <article
                  key={compound.slug}
                  className="card-premium group flex h-full flex-col p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="metadata-row">
                      <span className={evidenceClass(evidence)}>
                        {evidence}
                      </span>

                      <span className={safetyClass(safety)}>
                        {safety}
                      </span>
                    </div>

                    {index < 8 ? (
                      <span className="identity-kicker">
                        Featured
                      </span>
                    ) : null}
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

                    {mechanisms.length > 0 ? (
                      <div className="mt-5 border-t border-brand-900/10 pt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
                            Mechanisms
                          </p>

                          <span className="identity-meta">
                            {mechanisms.length} mapped
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {mechanisms.map(effect => (
                            <span key={effect} className="rounded-full border border-brand-900/10 bg-paper-50 px-3 py-1 text-xs font-medium text-[#33443a]">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {effects.length > 0 ? (
                      <div className="mt-4">
                        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
                          Research signals
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

                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <div className="identity-meta">
                        Molecular research profile
                      </div>

                      <Link
                        href={`/compounds/${compound.slug}`}
                        className="button-secondary rounded-full px-4 py-2.5 text-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </article>
              )}
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
