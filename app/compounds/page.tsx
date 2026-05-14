import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { EcosystemPanelGrid } from '@/components/semantic-hubs/semantic-hub-sections'
import { getEcosystemPanels } from '@/lib/ecosystem-context'
import '@/styles/premium-cards.css'

function safeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getName(item: any) {
  return (
    formatDisplayLabel(item?.displayName) ||
    formatDisplayLabel(item?.name) ||
    formatDisplayLabel(item?.slug) ||
    'Unknown Compound'
  )
}

function getSummary(item: any) {
  return cleanSummary(
    item?.short_earthy_summary ||
      item?.shortEarthySummary ||
      item?.summary ||
      item?.coreInsight ||
      item?.hero ||
      item?.description ||
      '',
    'compound'
  )
}

function getEvidenceLabel(item: any) {
  return labelize(
    item?.evidence_tier ||
      item?.evidenceTier ||
      item?.evidence_grade ||
      item?.evidenceLevel ||
      item?.summary_quality,
    'Evidence Review'
  )
}

function getProfileLabel(item: any) {
  return labelize(
    item?.profile_status ||
      item?.summary_quality ||
      item?.readiness ||
      item?.status,
    'Profile Review'
  )
}

function getMechanismSignals(item: any) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.primaryEffects),
    ...list(item?.effects),
    ...list(item?.mechanisms),
    ...list(item?.pathways),
    ...list(item?.compoundClass),
    safeString(item?.class),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 3)
}

function getBadgeClass(value: string) {
  const normalized = safeString(value).toLowerCase()

  if (normalized.includes('strong') || normalized.includes('high') || normalized.includes('clinical')) {
    return 'evidence-pill-strong'
  }

  if (normalized.includes('moderate') || normalized.includes('human')) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

function scoreCompound(item: any) {
  let score = 0
  const profile = text(item?.profile_status || item?.summary_quality || item?.status).toLowerCase()
  const evidence = text(item?.evidence_tier || item?.evidence_grade || item?.evidenceLevel).toLowerCase()

  if (/complete|strong|high|ready/.test(profile)) score += 5
  if (/strong|human|clinical|high/.test(evidence)) score += 4

  score += getMechanismSignals(item).length

  return score
}

function compoundVisualSeed(slug: string) {
  return slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function compoundVisualStyle(slug: string) {
  const seed = compoundVisualSeed(slug)
  const palettes = [
    ['#e8f1ff', '#f8fbff', '#2463a6'],
    ['#edf7f4', '#fbfffd', '#277268'],
    ['#f0efff', '#fbfaff', '#6254a8'],
    ['#eaf4f7', '#fbfeff', '#35758b'],
    ['#eef3f8', '#ffffff', '#536a86'],
  ]
  const [from, to, accent] = palettes[seed % palettes.length]

  return {
    background: `radial-gradient(circle at 30% 28%, ${from}, transparent 38%), linear-gradient(135deg, ${from}, ${to})`,
    color: accent,
  }
}

function compoundGlyph(name: string) {
  const normalized = name.replace(/[^a-z0-9]/gi, '').toUpperCase()
  return normalized.slice(0, 2) || 'C'
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

function CompoundCard({ compound, compact = false }: { compound: any; compact?: boolean }) {
  const evidence = getEvidenceLabel(compound)
  const profile = getProfileLabel(compound)
  const signals = getMechanismSignals(compound)
  const name = getName(compound)
  const summary = getSummary(compound)

  return (
    <article className={compact ? 'semantic-rail-card group' : 'compact-card group'}>
      <div className={compact ? 'flex gap-3' : 'flex gap-4'}>
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-900/10 text-2xl font-display font-semibold shadow-sm"
          style={compoundVisualStyle(compound?.slug || name)}
          aria-hidden="true"
        >
          {compoundGlyph(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className={getBadgeClass(evidence)}>{evidence}</span>
            {!compact ? <span className="identity-kicker">{profile}</span> : null}
          </div>

          <h2 className="mt-3 max-w-none text-xl font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-700 sm:text-2xl">
            {name}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#46574d]">
            {summary || 'Evidence-aware compound profile with mechanism, safety, and practical context.'}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-brand-900/10 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[#66756d]">Mechanism signals</p>
          <span className="identity-meta">{signals.length} mapped</span>
        </div>

        {signals.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {signals.map(signal => (
              <span key={signal} className="rounded-full border border-blue-900/10 bg-blue-50/55 px-2.5 py-1 text-[11px] font-medium text-[#28475f]">
                {signal}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="identity-meta">Molecular profile</span>
        <Link href={`/compounds/${compound?.slug || ''}`} className="text-sm font-semibold text-brand-800 hover:text-brand-700">
          View Profile →
        </Link>
      </div>
    </article>
  )
}

export default async function CompoundsPage() {
  const runtimeCompounds = await getCompounds()

  const compounds = runtimeCompounds
    .filter((compound: any) => {
      try {
        return getRuntimeVisibility(compound).canRender
      } catch {
        return true
      }
    })
    .sort((a: any, b: any) => scoreCompound(b) - scoreCompound(a))

  const totalProfiles = compounds.length
  const readyProfiles = compounds.filter((compound: any) => /complete|strong|high|ready/i.test(text(compound?.profile_status || compound?.summary_quality || compound?.status))).length
  const evidenceForward = compounds.filter((compound: any) => /human|clinical|strong|high/i.test(text(compound?.evidence_tier || compound?.evidence_grade || compound?.evidenceLevel))).length
  const topMatches = compounds.slice(0, 8)
  const libraryCompounds = compounds.slice(8)

  const featuredSignals = [
    'Cognition',
    'Sleep Chemistry',
    'Mitochondrial Function',
    'Metabolic Research',
    'Oxidative Stress',
    'Inflammation',
  ]

  return (
    <div className="min-h-screen bg-background text-ink">
      <section className="container-page py-10 sm:py-14 lg:py-18">
        <div className="section-spacing">
          <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
              <div className="max-w-3xl space-y-6">
                <div className="space-y-3">
                  <p className="eyebrow-label">Scientific Compound Library</p>
                  <h1 className="max-w-[12ch]">Compounds</h1>
                </div>

                <p className="detail-reading text-[1.05rem] sm:text-lg">
                  Explore phytochemicals, amino acids, alkaloids, and bioactive molecules organized by mechanisms, evidence maturity, and research pathways.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredSignals.map(signal => (
                    <span key={signal} className="chip-readable">{signal}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard value={totalProfiles} label="Profiles" description="Evidence-aware compound profiles" />
                <StatCard value={readyProfiles} label="High readiness" description="Near-complete profile signals" />
                <StatCard value={evidenceForward} label="Human evidence" description="Mapped human research signals" />
              </div>
            </div>
          </div>

          <div className="compact-section section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Top Matches</p>
                <h2 className="compact-heading mt-2">High-signal compound profiles.</h2>
              </div>
              <span className="chip-readable">Ranked by evidence and mechanism density</span>
            </div>

            <div className="semantic-rail">
              {topMatches.map((compound: any) => (
                <CompoundCard key={compound?.slug || getName(compound)} compound={compound} compact />
              ))}
            </div>
          </div>

          <div className="compact-section section-rhythm-compact">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <p className="eyebrow-label">Discovery structure</p>
                <h2 className="compact-heading">Explore by pathway, mechanism class, and evidence maturity.</h2>
                <p className="compact-copy">
                  Stronger evidence maturity and richer mechanism mapping surface first to improve compound scanning and scientific navigation.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Human Evidence', 'Mechanism-Led', 'Neurobiology', 'Mitochondria', 'Metabolism', 'Inflammation'].map(filter => (
                  <span key={filter} className="chip-readable">{filter}</span>
                ))}
              </div>
            </div>
          </div>

          <EcosystemPanelGrid
            eyebrow="Associated pathways"
            title="Compound ecosystem pathways"
            panels={getEcosystemPanels(['cognition sleep neurobiology mitochondrial function metabolism oxidative stress cardiovascular function inflammation'], 4)}
            limit={4}
          />

          <section className="section-rhythm-compact">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow-label">Compound Library</p>
                <h2 className="compact-heading mt-2">Browse all profiles.</h2>
              </div>
              <span className="chip-readable">{libraryCompounds.length} remaining profiles</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {libraryCompounds.map((compound: any) => (
                <CompoundCard key={compound?.slug || getName(compound)} compound={compound} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
