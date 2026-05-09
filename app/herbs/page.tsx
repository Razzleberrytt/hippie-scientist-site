import Link from 'next/link'
import { getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { EcosystemPanelGrid } from '@/components/semantic-hubs/semantic-hub-sections'
import { getEcosystemPanels } from '@/lib/ecosystem-context'
import '@/styles/premium-cards.css'

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

  return cleanSummary(summary, 'herb')
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

function scoreHerb(item: any) {
  let score = 0

  const quality = text(item.profile_status || item.summary_quality || item.safety?.confidence).toLowerCase()
  const evidence = text(item.evidence_tier || item.evidence_grade || item.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(quality)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getEffects(item).length

  return score
}

export default async function HerbsPage() {
  const allHerbs = await getHerbSummaryIndex()

  const herbs = allHerbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .sort((a: any, b: any) => scoreHerb(b) - scoreHerb(a))

  const totalProfiles = herbs.length

  const readyProfiles = herbs.filter((herb: any) =>
    /complete|strong|high|ready/i.test(
      text(herb.profile_status || herb.summary_quality || herb.safety?.confidence)
    )
  ).length

  const evidenceForward = herbs.filter((herb: any) =>
    /human|clinical|strong|high/i.test(
      text(herb.evidence_tier || herb.evidence_grade || herb.evidenceLevel)
    )
  ).length

  const featuredSignals = [
    'Stress & Adaptogens',
    'Sleep & Recovery',
    'Cognitive Support',
    'Inflammatory Pathways',
    'Metabolic Research',
    'Traditional Botanical Use',
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
                    Botanical Research Library
                  </p>

                  <h1 className="max-w-[11ch]">
                    Herbs
                  </h1>
                </div>

                <p className="detail-reading text-[1.05rem] sm:text-lg">
                  Browse evidence-aware botanical profiles organized for scientific scanning: outcome signals, mechanism context, evidence maturity, and practical research pathways.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredSignals.map(signal => (
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
                  Discovery structure
                </p>

                <h2 className="max-w-[18ch]">
                  Explore by evidence, mechanisms, and research direction.
                </h2>

                <p className="detail-reading text-base">
                  Profiles with stronger evidence maturity and richer mechanism mapping are surfaced first to improve scan quality and scientific navigation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Human Evidence', 'Traditional Use', 'Mechanism-Led', 'Adaptogens', 'Sleep', 'Cognition'].map(filter => (
                  <span key={filter} className="chip-readable">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <EcosystemPanelGrid
            eyebrow="Associated pathways"
            title="Botanical ecosystem pathways"
            panels={getEcosystemPanels(['stress adaptogens sleep recovery cognition inflammation metabolism traditional botanical use'], 4)}
            limit={4}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6">
            {herbs.map((herb: any, index: number) => {
              const evidence = getEvidence(herb)
              const safety = getSafety(herb)
              const quality = getQuality(herb)
              const effects = getEffects(herb)

              return (
                <article
                  key={herb.slug}
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
                          {getName(herb)}
                        </h2>
                      </div>

                      <p className="line-clamp-4 text-sm leading-7 text-[#46574d]">
                        {getSummary(herb)}
                      </p>
                    </div>

                    {effects.length > 0 ? (
                      <div className="mt-5 border-t border-brand-900/10 pt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
                            Research signals
                          </p>

                          <span className="identity-meta">
                            {effects.length} mapped
                          </span>
                        </div>

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
                        Evidence-aware profile
                      </div>

                      <Link
                        href={`/herbs/${herb.slug}`}
                        className="button-secondary rounded-full px-4 py-2.5 text-sm"
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
