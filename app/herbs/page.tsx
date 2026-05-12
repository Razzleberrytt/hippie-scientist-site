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

  if (value.includes('strong') || value.includes('high')) return 'evidence-pill-strong'
  if (value.includes('moderate') || value.includes('human')) return 'evidence-pill-moderate'

  return 'chip-readable'
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

function herbVisualSeed(slug: string) {
  return slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function herbVisualStyle(slug: string) {
  const seed = herbVisualSeed(slug)
  const palettes = [
    ['#e8f4e7', '#f8fbf4', '#2f7d4b'],
    ['#f5eddc', '#fffaf0', '#a35f20'],
    ['#e9f1ee', '#fbfffb', '#3a7357'],
    ['#edf4dd', '#fffdf4', '#6f8339'],
    ['#f0efe8', '#fffdf8', '#667255'],
  ]
  const [from, to, accent] = palettes[seed % palettes.length]

  return {
    background: `radial-gradient(circle at 32% 28%, ${from}, transparent 38%), linear-gradient(135deg, ${from}, ${to})`,
    color: accent,
  }
}

function herbGlyph(name: string) {
  const first = name.trim().charAt(0).toUpperCase()
  return first || 'H'
}

function StatCard({ value, label, description }: { value: number; label: string; description: string }) {
  return (
    <div className="compact-card text-center">
      <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#46574d]">{label}</p>
      <p className="mx-auto mt-2 max-w-[18ch] text-xs leading-5 text-[#5b6b61]">{description}</p>
    </div>
  )
}

function HerbCard({ herb, compact = false }: { herb: any; compact?: boolean }) {
  const evidence = getEvidence(herb)
  const quality = getQuality(herb)
  const effects = getEffects(herb)
  const name = getName(herb)
  const summary = getSummary(herb)

  return (
    <article className={compact ? 'semantic-rail-card group' : 'compact-card group'}>
      <div className={compact ? 'flex gap-3' : 'flex gap-4'}>
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-brand-900/10 text-3xl font-display font-semibold shadow-sm"
          style={herbVisualStyle(herb.slug || name)}
          aria-hidden="true"
        >
          {herbGlyph(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className={evidenceClass(evidence)}>{evidence}</span>
            {!compact ? <span className="identity-kicker">{quality}</span> : null}
          </div>

          <h2 className="mt-3 max-w-none text-xl font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-700 sm:text-2xl">
            {name}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#46574d]">
            {summary || 'Evidence-aware botanical profile with mechanism, safety, and practical context.'}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-brand-900/10 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[#66756d]">Research signals</p>
          <span className="identity-meta">{effects.length} mapped</span>
        </div>

        {effects.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {effects.map(effect => (
              <span key={effect} className="rounded-full border border-brand-900/10 bg-paper-50 px-2.5 py-1 text-[11px] font-medium text-[#33443a]">
                {effect}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="identity-meta">Evidence-aware profile</span>
        <Link href={`/herbs/${herb.slug}`} className="text-sm font-semibold text-brand-800 hover:text-brand-700">
          View Profile →
        </Link>
      </div>
    </article>
  )
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

  const topMatches = herbs.slice(0, 8)
  const libraryHerbs = herbs.slice(8)

  return (
    <main className="min-h-screen bg-background text-ink">
      <section className="container-page py-10 sm:py-14 lg:py-18">
        <div className="section-spacing">

          <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
              <div className="max-w-3xl space-y-6">
                <div className="space-y-3">
                  <p className="eyebrow-label">Botanical Research Library</p>
                  <h1 className="max-w-[11ch]">Herbs</h1>
                </div>

                <p className="detail-reading text-[1.05rem] sm:text-lg">
                  Browse evidence-aware botanical profiles by outcome signal, mechanism context, evidence maturity, and practical research pathway.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredSignals.map(signal => (
                    <span key={signal} className="chip-readable">{signal}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard value={totalProfiles} label="Profiles" description="Evidence-aware botanical profiles" />
                <StatCard value={readyProfiles} label="High readiness" description="Near-complete profile signals" />
                <StatCard value={evidenceForward} label="Human evidence" description="Mapped human research signals" />
              </div>
            </div>
          </div>

          <div className="compact-section section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Top Matches</p>
                <h2 className="compact-heading mt-2">High-signal botanical profiles.</h2>
              </div>
              <span className="chip-readable">Ranked by evidence and profile readiness</span>
            </div>

            <div className="semantic-rail">
              {topMatches.map((herb: any) => (
                <HerbCard key={herb.slug} herb={herb} compact />
              ))}
            </div>
          </div>

          <div className="compact-section section-rhythm-compact">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="eyebrow-label">Discovery structure</p>
                <h2 className="compact-heading">Explore by evidence, mechanisms, and research direction.</h2>
                <p className="compact-copy">
                  Stronger evidence maturity and richer mechanism mapping surface first to improve scan quality and scientific navigation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Human Evidence', 'Traditional Use', 'Mechanism-Led', 'Adaptogens', 'Sleep', 'Cognition'].map(filter => (
                  <span key={filter} className="chip-readable">{filter}</span>
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

          <section className="section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Botanical Library</p>
                <h2 className="compact-heading mt-2">Browse all profiles.</h2>
              </div>
              <span className="chip-readable">{libraryHerbs.length} remaining profiles</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {libraryHerbs.map((herb: any) => (
                <HerbCard key={herb.slug} herb={herb} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
