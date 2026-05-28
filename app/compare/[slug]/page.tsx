import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getStacks } from '@/lib/runtime-data'
import AffiliateBlock from '@/components/AffiliateBlock'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { bestPages } from '@/data/best'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import { buildContinuationPrompts, buildSemanticNarrative } from '@/lib/semantic-exploration-narratives'
import {
  buildSemanticAssistantSummary,
  buildSemanticNavigationSuggestions,
} from '@/lib/ai-semantic-navigation'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import GuidedExplorationPanel from '@/components/guided-exploration-panel'
import SemanticAssistantPanel from '@/components/semantic-assistant-panel'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import EvidenceSnapshotPanel from '@/components/ui/EvidenceSnapshotPanel'
import { buildCompareEvidenceSnapshotFields } from '@/components/ui/evidence-snapshot-fields'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'

type Params = { params: Promise<{ slug: string }> }

const formatSlug = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bL\b/g, 'L')
    .replace(/\bD3\b/g, 'D3')

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const displayName = (compound: any) => compound?.displayName || compound?.name || formatSlug(compound?.slug || 'Compound')
const summary = (compound: any) => cleanSummary(compound?.summary || compound?.description, 'compound') || 'Open the compound profile for more detail.'

const evidenceScore = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.evidence ?? ''} ${compound?.summary_quality ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|a-tier|meta|rct/.test(text)) return 5
  if (/moderate|tier\s*2|human/.test(text)) return 4
  if (/limited|low|tier\s*3/.test(text)) return 2
  return 3
}

const findCompound = (compounds: any[], candidates: string[]) =>
  compounds.find((compound: any) => {
    const aliases = new Set([compound.slug, normalize(compound.slug), compound.name, compound.displayName, normalize(compound.name), normalize(compound.displayName)].filter(Boolean))
    return candidates.some(candidate => aliases.has(candidate) || aliases.has(normalize(candidate)))
  })

const getComparisonConfig = (slug: string) => supplementComparisons.find(item => item.slug === slug)

const allComparisonSlugs = Array.from(new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(item => item.slug),
  // compound-vs-compound pairs (first 25 compounds, adjacent pairs)
  '11-keto-beta-boswellic-acid-vs-acemannan',
  'acemannan-vs-acetyl-11-keto-beta-boswellic-acid',
  'acetyl-11-keto-beta-boswellic-acid-vs-acetyl-beta-boswellic-acid',
  'acetyl-beta-boswellic-acid-vs-acetylshikonin',
  'acetylshikonin-vs-acteoside',
  'acteoside-vs-aescin',
  'aescin-vs-ajoene',
  'ajoene-vs-albiflorin',
  'albiflorin-vs-alpha-asarone',
  'alpha-asarone-vs-alpha-mangostin',
  'alpha-mangostin-vs-anabasine',
  'anabasine-vs-anatabine',
  'anatabine-vs-andrographolide',
  'andrographolide-vs-anethole',
  'anethole-vs-angelicin',
  'angelicin-vs-apigenin',
  'apigenin-vs-arjunolic-acid',
  'arjunolic-acid-vs-artemisinin',
  'artemisinin-vs-artemisinin-b',
  'artemisinin-b-vs-artesunate',
  'artesunate-vs-asiatic-acid',
  'asiatic-acid-vs-asiaticoside',
  'asiaticoside-vs-aspalathin',
  'aspalathin-vs-astragalin',
]))

function getSignals(compound: any) {
  return unique([
    ...list(compound?.effects),
    ...list(compound?.primary_effects),
    ...list(compound?.mechanisms),
    ...list(compound?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 6)
}

function sharedSignals(a: any, b: any) {
  const bSet = new Set(getSignals(b).map((item) => item.toLowerCase()))
  return getSignals(a).filter((item) => bSet.has(item.toLowerCase()))
}

function divergentSignals(a: any, b: any) {
  const bSet = new Set(getSignals(b).map((item) => item.toLowerCase()))
  return getSignals(a).filter((item) => !bSet.has(item.toLowerCase()))
}

const evidenceLabel = (score: number) => {
  if (score >= 5) return 'Stronger'
  if (score >= 4) return 'Moderate'
  if (score <= 2) return 'Limited'
  return 'Mixed'
}

const profileLabel = (compound: any) => {
  const text = `${list(compound?.effects).join(' ')} ${list(compound?.primary_effects).join(' ')} ${compound?.summary || ''}`.toLowerCase()
  if (/stim|energy|focus|alert/.test(text)) return 'More stimulating'
  if (/sleep|calm|sedat|relax|anx/.test(text)) return 'More calming'
  return 'Mixed or goal-dependent'
}

const firstItems = (values: string[], fallback: string) => (values.length > 0 ? values.slice(0, 3) : [fallback])

export function generateStaticParams() {
  return allComparisonSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const title = config?.title ? `${config.title}: Which Is Better? | The Hippie Scientist` : `${formatSlug(slug)}: Which Is Better? | The Hippie Scientist`
  const description = config?.summary || `Compare ${formatSlug(slug)} for benefits, safety, evidence, best use cases, and supplement buying options.`

  return {
    title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/compare/${slug}`,
    },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const [aSlug, bSlug] = slug.split('-vs-')
  const [compounds, stacks] = await Promise.all([getCompounds(), getStacks()])

  const a = config ? findCompound(compounds, config.a.candidates) : compounds.find((c: any) => c.slug === aSlug)
  const b = config ? findCompound(compounds, config.b.candidates) : compounds.find((c: any) => c.slug === bSlug)
  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const loser = winner.slug === a.slug ? b : a
  const title = config?.title || `${displayName(a)} vs ${displayName(b)}`
  const pageSummary = config?.summary || `Compare ${displayName(a)} and ${displayName(b)} by evidence, fit, safety, and practical use.`
  const signalsA = getSignals(a)
  const signalsB = getSignals(b)
  const overlap = sharedSignals(a, b)
  const uniqueA = divergentSignals(a, b)
  const uniqueB = divergentSignals(b, a)

  const chooseWinnerIf = `You prioritize a stronger clinical evidence base (${evidenceLabel(evidenceScore(winner))} Evidence), or if your goals align with the primary outcomes of ${firstItems(getSignals(winner), 'general support').slice(0, 2).join(' and ')}.`

  const chooseLoserIf = `You seek an alternative pathway profile, or if your goals focus specifically on ${firstItems(getSignals(loser), 'targeted support').slice(0, 2).join(' and ')}.`
  const syntheticCompareNode = {
    slug,
    displayName: title,
    effects: overlap.length > 0 ? overlap : [...signalsA, ...signalsB].slice(0, 8),
    mechanisms: overlap,
    pathways: [...signalsA, ...signalsB].slice(0, 8),
  }
  const graph = buildSemanticGraphVisual(syntheticCompareNode, [a, b], 12)
  const narrative = buildSemanticNarrative(syntheticCompareNode, [a, b])
  const prompts = buildContinuationPrompts(syntheticCompareNode, [winner, loser])
  const assistant = buildSemanticAssistantSummary(syntheticCompareNode, [a, b])
  const assistantSuggestions = buildSemanticNavigationSuggestions(syntheticCompareNode, [a, b], 5)

  const relatedStack = stacks.find((s: any) =>
    (s.compounds || s.stack || []).some((i: any) => {
      const compoundSlug = i.compound_slug || i.compound
      return compoundSlug === a.slug || compoundSlug === b.slug
    })
  )

  const relatedComparisons = supplementComparisons
    .filter(item => item.slug !== slug)
    .filter(item =>
      item.a.candidates.includes(a.slug) || item.b.candidates.includes(a.slug) ||
      item.a.candidates.includes(b.slug) || item.b.candidates.includes(b.slug) ||
      item.a.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)) ||
      item.b.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug))
    )
    .slice(0, 3)

  const relatedBestPages = bestPages
    .filter(page => page.compoundCandidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)))
    .slice(0, 3)
  const evidenceA = evidenceScore(a)
  const evidenceB = evidenceScore(b)
  const cautionA = firstItems(list(a?.safety_flags || a?.safetyNotes || a?.contraindications).map(formatDisplayLabel).filter(isClean), 'Review interactions, health conditions, and timing fit.')
  const cautionB = firstItems(list(b?.safety_flags || b?.safetyNotes || b?.contraindications).map(formatDisplayLabel).filter(isClean), 'Review interactions, health conditions, and timing fit.')
  const timingA = formatDisplayLabel(a?.time_to_effect) || 'Timing varies'
  const timingB = formatDisplayLabel(b?.time_to_effect) || 'Timing varies'
  const durationA = formatDisplayLabel(a?.duration) || 'Not consistently reported'
  const durationB = formatDisplayLabel(b?.duration) || 'Not consistently reported'
  const costA = formatDisplayLabel(a?.cost) || 'Price varies by product quality'
  const costB = formatDisplayLabel(b?.cost) || 'Price varies by product quality'

  return (
    <main className="space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-stretch">
          <div className="relative max-w-4xl">
            <p className="eyebrow-label">Semantic Comparison</p>
            <h1 className="heading-premium mt-3 text-ink">{title}</h1>
            <p className="detail-reading mt-5 text-base text-[#46574d] sm:text-lg">{pageSummary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip-readable">Decision guide</span>
              <span className="chip-readable">Evidence signals compared</span>
              <span className="chip-readable">Mechanism contrast</span>
            </div>
          </div>

          <SemanticArtworkPanel
            slug={winner.slug}
            kind="comparison"
            title={`${displayName(a)} vs ${displayName(b)}`}
            subtitle="Comparison ecosystem artwork for mechanism overlap, evidence contrast, and decision-oriented exploration."
            height={300}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {[a, b].map((compound: any) => (
          <article key={compound.slug} className="compact-card section-rhythm-compact">
            <SemanticArtworkPanel
              slug={compound.slug}
              kind="compound"
              title={displayName(compound)}
              subtitle="Compound visual identity for comparison context."
              height={220}
            />
            <div className="flex flex-wrap gap-2">
              <span className="identity-kicker">Evidence signal: {evidenceScore(compound)}/5</span>
            </div>
            <h2 className="max-w-none text-2xl font-semibold tracking-tight text-ink">{displayName(compound)}</h2>
            <p className="text-sm leading-6 text-[#46574d]">{summary(compound)}</p>
            <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
              {getSignals(compound).slice(0, 5).map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
            <Link href={`/compounds/${compound.slug}`} className="text-sm font-semibold text-brand-800 hover:text-brand-700">Open full profile →</Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="compact-card section-rhythm-compact bg-emerald-50/80">
          <p className="eyebrow-label">Better default</p>
          <h2 className="max-w-none text-3xl font-semibold text-ink">{displayName(winner)}</h2>
          <p className="text-sm font-semibold leading-6 text-[#46574d]">Usually the better starting point based on the current evidence and profile signals.</p>
          <div className="rounded-xl bg-white/70 p-3 border border-emerald-900/5 text-xs text-[#33443a] space-y-1">
            <p className="font-bold uppercase tracking-wider text-emerald-800 text-[9px]">Choose this if:</p>
            <p className="leading-relaxed">{chooseWinnerIf}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/compounds/${winner.slug}`} className="button-primary text-center">View full profile →</Link>
            <AffiliateBlock compound={winner.slug} compact />
          </div>
        </article>

        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Alternative</p>
          <h2 className="max-w-none text-3xl font-semibold text-ink">{displayName(loser)}</h2>
          <p className="text-sm leading-6 text-[#46574d]">Still worth considering if it better matches your goal, tolerance, timing, or product preference.</p>
          <div className="rounded-xl bg-brand-50/50 p-3 border border-brand-900/5 text-xs text-[#46574d] space-y-1">
            <p className="font-bold uppercase tracking-wider text-brand-800 text-[9px]">Consider this instead if:</p>
            <p className="leading-relaxed">{chooseLoserIf}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/compounds/${loser.slug}`} className="button-secondary text-center">View profile →</Link>
            <AffiliateBlock compound={loser.slug} compact />
          </div>
        </article>
      </section>

      <EvidenceSnapshotPanel
        title="Fast decision snapshot"
        subtitle="Educational comparison only. Individual response, tolerance, and side effects vary."
        fields={buildCompareEvidenceSnapshotFields({
          bestFit: `Start with ${displayName(winner)} when you want the stronger evidence signal and a clearer starting point for comparison.`,
          humanEvidence: `${displayName(a)}: ${evidenceLabel(evidenceA)} (${evidenceA}/5) • ${displayName(b)}: ${evidenceLabel(evidenceB)} (${evidenceB}/5)`,
          safetyLevel: `Shared baseline: review medications, health conditions, and timing fit before use. ${displayName(a)}: ${cautionA[0]} ${displayName(b)}: ${cautionB[0]}`,
          toleranceRisk: `${displayName(a)}: ${formatDisplayLabel(a?.tolerance_risk) || 'Unclear; monitor response.'} ${displayName(b)}: ${formatDisplayLabel(b?.tolerance_risk) || 'Unclear; monitor response.'}`,
          regulationProfile: `${displayName(a)}: ${profileLabel(a)} • ${displayName(b)}: ${profileLabel(b)}`,
          typicalOnset: `${displayName(a)}: ${timingA} • ${displayName(b)}: ${timingB}`,
          useCautionIf: unique([...cautionA, ...cautionB]).slice(0, 3).join(', '),
          uncertain: 'Long-term outcomes, product standardization, and real-world effect size can vary. Choose based on top constraint first and reassess after conservative trials.',
        })}
        className="compact-card section-rhythm-compact border border-brand-900/15 bg-white/95"
        columnsClassName="grid gap-4 md:grid-cols-2"
      />

      <section className="compact-card section-rhythm-compact">
        <p className="eyebrow-label">Scan-first framing</p>
        <h2 className="compact-heading">Compare high-impact factors before details.</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { label: 'Evidence strength', a: `${evidenceLabel(evidenceA)} (${evidenceA}/5)`, b: `${evidenceLabel(evidenceB)} (${evidenceB}/5)` },
            { label: 'Safety', a: cautionA[0], b: cautionB[0] },
            { label: 'Stimulation / sedation profile', a: profileLabel(a), b: profileLabel(b) },
            { label: 'Tolerance risk', a: formatDisplayLabel(a?.tolerance_risk) || 'Unclear; monitor response', b: formatDisplayLabel(b?.tolerance_risk) || 'Unclear; monitor response' },
            { label: 'Onset', a: timingA, b: timingB },
            { label: 'Duration', a: durationA, b: durationB },
            { label: 'Cost/value', a: costA, b: costB },
            { label: 'Mechanism confidence', a: signalsA.length > 0 ? 'Some pathway signal clarity' : 'Low mechanism clarity', b: signalsB.length > 0 ? 'Some pathway signal clarity' : 'Low mechanism clarity' },
          ].map((row) => (
            <article key={row.label} className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{row.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#46574d]"><strong>{displayName(a)}:</strong> {row.a}</p>
              <p className="text-sm leading-6 text-[#46574d]"><strong>{displayName(b)}:</strong> {row.b}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">What remains uncertain</p>
          <ul className="space-y-2 text-sm leading-6 text-[#46574d]">
            <li>• Long-term outcome evidence is still limited for many compounds.</li>
            <li>• Product standardization and third-party testing quality can vary across brands.</li>
            <li>• Some signals come from small or short-duration studies, so effect size can shift in broader use.</li>
            <li>• Individual response variation is common, including differences in tolerance and side effects.</li>
          </ul>
        </article>
        <article className="compact-card section-rhythm-compact bg-amber-50/70">
          <p className="eyebrow-label">Beginner notes</p>
          <ul className="space-y-2 text-sm leading-6 text-[#46574d]">
            <li>• Start conservatively and avoid escalating quickly.</li>
            <li>• Avoid stacking multiple stimulants or multiple calming compounds at first.</li>
            <li>• Evaluate one variable at a time so you can observe fit, tolerance, and tradeoffs clearly.</li>
          </ul>
        </article>
      </section>

      <SemanticAssistantPanel
        headline={assistant.headline}
        body={assistant.body}
        signals={assistant.signals}
        suggestions={assistantSuggestions}
      />

      <GuidedExplorationPanel
        overview={narrative.overview}
        pathways={narrative.pathways}
        exploration={narrative.exploration}
        prompts={prompts}
      />

      <SemanticVisibilityGate minHeight={420}>
        <SemanticGraphMap
          title="Comparison relationship map"
          description="A lightweight map of overlap signals, evidence relationships, and semantic contrast between the compared profiles."
          nodes={graph.nodes}
          edges={graph.edges}
        />
      </SemanticVisibilityGate>

      <section className="compact-section section-rhythm-balanced">
        <div className="space-y-2">
          <p className="eyebrow-label">Overlap + divergence</p>
          <h2 className="compact-heading">Where these profiles converge and separate.</h2>
          <p className="compact-copy">Overlap chips show shared semantic signals; each side keeps its own mechanism and pathway identity so the comparison does not collapse into a simplistic winner claim.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="compact-card section-rhythm-compact">
            <p className="eyebrow-label">Shared signals</p>
            <div className="flex flex-wrap gap-2">
              {(overlap.length > 0 ? overlap : ['evidence context']).map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
          </article>
          <article className="compact-card section-rhythm-compact">
            <p className="eyebrow-label">Unique to {displayName(a)}</p>
            <div className="flex flex-wrap gap-2">
              {(uniqueA.length > 0 ? uniqueA : ['specific targets']).slice(0, 5).map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
          </article>
          <article className="compact-card section-rhythm-compact">
            <p className="eyebrow-label">Unique to {displayName(b)}</p>
            <div className="flex flex-wrap gap-2">
              {(uniqueB.length > 0 ? uniqueB : ['specific targets']).slice(0, 5).map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {relatedStack && (
          <article className="compact-card section-rhythm-compact">
            <h2 className="max-w-none text-xl font-semibold text-ink">Use it in a routine</h2>
            <p className="text-sm leading-6 text-[#46574d]">These options may make more sense inside a goal-based stack.</p>
            <Link href={`/stacks/${relatedStack.slug}`} className="text-sm font-semibold text-brand-800">View stack →</Link>
          </article>
        )}

        {relatedComparisons.length > 0 && (
          <article className="compact-card section-rhythm-compact">
            <h2 className="max-w-none text-xl font-semibold text-ink">Related comparisons</h2>
            <div className="grid gap-2">
              {relatedComparisons.map(item => (
                <Link key={item.slug} href={`/compare/${item.slug}`} className="text-sm font-semibold text-brand-800">{item.title} →</Link>
              ))}
            </div>
          </article>
        )}

        {relatedBestPages.length > 0 && (
          <article className="compact-card section-rhythm-compact">
            <h2 className="max-w-none text-xl font-semibold text-ink">Best-of guides</h2>
            <div className="grid gap-2">
              {relatedBestPages.map(page => (
                <Link key={page.slug} href={`/best/${page.slug}`} className="text-sm font-semibold text-brand-800">{page.title} →</Link>
              ))}
            </div>
          </article>
        )}
      </section>

      <RelatedDiscoveryGroups
        eyebrow="Continue comparison research"
        title="Explore nearby decision paths"
        groups={[
          {
            title: 'Related comparisons',
            description: 'Compare close alternatives without forcing a single winner.',
            links: relatedComparisons.map(item => ({ href: `/compare/${item.slug}`, label: item.title })),
          },
          {
            title: 'Beginner-friendly next reads',
            description: 'Start with practical overviews before advanced stacking.',
            links: [
              { href: `/compounds/${winner.slug}`, label: `${displayName(winner)} profile` },
              { href: '/learn', label: 'Learn evidence basics' },
            ],
          },
          {
            title: 'Safety context',
            description: 'Read safety framing before trial decisions.',
            links: [
              { href: '/sleep-herbs-vs-melatonin', label: 'Sleep safety tradeoffs' },
              { href: '/psychedelic-adjacent-herbs', label: 'Harm-reduction herb context' },
            ],
          },
          {
            title: 'Related goals pages',
            description: 'Use goal pages when choosing by outcome instead of ingredient.',
            links: [
              { href: '/goals', label: 'Browse goal guides' },
              { href: '/goals', label: 'Find a beginner-friendly goal path' },
            ],
          },
        ]}
      />
    </main>
  )
}
