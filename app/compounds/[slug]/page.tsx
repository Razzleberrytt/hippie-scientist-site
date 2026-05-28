import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCompoundBySlug } from '@/lib/runtime-data'
import { getCompoundMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import TrustBar from '@/components/ui/TrustBar'
import ReadingProgress from '@/components/ui/ReadingProgress'
import CompoundHero from '@/components/ui/CompoundHero'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { compoundJsonLd as generateCompoundJsonLd, breadcrumbJsonLd as generateBreadcrumbJsonLd, generateDetailMetadata } from '@/lib/seo'
import {
  normalizeEvidenceLevel,
  normalizeSafetyLevel,
  getSources,
} from '@/lib/evidence-utils'
import { getEvidenceSnapshot } from '@/lib/semantic-runtime'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { getFeaturedCollections } from '@/lib/collections'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import { buildContinuationPrompts, buildSemanticNarrative } from '@/lib/semantic-exploration-narratives'
import { buildSourcingNotes, getMonetizationReadiness } from '@/lib/monetization-context'
import {
  buildSemanticAssistantSummary,
  buildSemanticNavigationSuggestions,
} from '@/lib/ai-semantic-navigation'
import ProfileAuthoritySections from '@/components/profile-authority-sections'
import { ProfileDecisionLayer } from '@/components/profile-decision-layer'
import DecisionClarityFieldManual from '@/components/decision-clarity-field-manual'
import DecisionVisualGrid from '@/components/decision-visual-grid'
import WhyThisInsteadPanel from '@/components/why-this-instead-panel'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'
import AuthorityEditorialLayer from '@/components/profile/AuthorityEditorialLayer'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import GuidedExplorationPanel from '@/components/guided-exploration-panel'
import EvidenceAwareCTA from '@/components/evidence-aware-cta'
import SemanticAssistantPanel from '@/components/semantic-assistant-panel'
import EvidenceSnapshotPanel from '@/components/ui/EvidenceSnapshotPanel'
import { buildDetailEvidenceSnapshotFields } from '@/components/ui/evidence-snapshot-fields'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import DetailTabDashboard from '@/components/ui/DetailTabDashboard'
import { SemanticIntelligenceDashboard } from '@/components/SemanticIntelligenceDashboard'
import { getEvidenceConfidence } from '@/lib/evidence-confidence'
import { SourcingCta } from '@/components/sourcing/SourcingCta'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { compounds } = await getUnifiedRuntimeRecords()

  return compounds
    .filter((compound:any) => getRuntimeVisibility(compound).canRender)
    .map((compound:any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const compound = await getCompoundMetadataRecord(slug)

  if (!compound) return {}

  return generateDetailMetadata(compound, 'compound')
}


const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i


const CALMING_PATTERN = /calm|relax|sleep|sedat|anxiolytic|anxiety|stress|gaba|parasympathetic/i
const STIMULATING_PATTERN = /stimulat|energ|fatigue|alert|caffeine|adrenergic|dopaminergic|nootropic|performance/i

function getRegulationProfile(signals: string[]) {
  const joined = signals.join(' ').toLowerCase()
  const calming = CALMING_PATTERN.test(joined)
  const stimulating = STIMULATING_PATTERN.test(joined)

  if (calming && stimulating) return 'Mixed: calming and stimulating signals both appear in the profile.'
  if (calming) return 'Leans calming / down-shifting based on listed effects and pathways.'
  if (stimulating) return 'Leans stimulating / activating based on listed effects and pathways.'
  return 'No clear calming or stimulating tilt in the available profile data.'
}

function getSafetyTone(summary: string, avoidIf: string[]) {
  if (avoidIf.length || CAUTION_PATTERN.test(summary)) return 'Use extra caution'
  return 'Standard caution'
}

function firstSentences(value: string, limit = 2) {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(sentence => sentence.trim()).filter(Boolean) || []
  return sentences.slice(0, limit).join(' ')
}

function cleanItems(value: unknown, limit = 6) {
  const values = Array.isArray(value) ? value.flatMap(item => list(item)) : list(value)

  return unique(
    values
      .map(formatDisplayLabel)
      .filter(item => item && isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function cleanText(value: unknown) {
  const formatted = text(value)
  if (!formatted || !isClean(formatted) || WEAK_PATTERN.test(formatted)) return ''
  return formatted
}

function getTimeline(compound: any) {
  return cleanText(compound.time_to_effect || compound.timeToEffect || compound.time_to_notice || compound.timeToNotice || compound.onset)
}

function getAvoidIf(compound: any) {
  return cleanItems([
    compound.avoid_if,
    compound.avoidIf,
    compound.who_should_skip,
    compound.whoShouldSkip,
    compound.contraindications,
    compound.interactions,
  ], 4)
}

function getSafetySummary(compound: any, avoidIf: string[]) {
  const note = cleanText(compound.safetyNotes || compound.safety_notes || compound.safety)
  if (avoidIf.length) return `Review before use if any apply: ${avoidIf.slice(0, 3).join(', ')}.`
  if (note) return firstSentences(note, 2)
  return 'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.'
}

function getMechanismHints(compound: any, provided: string[]) {
  return unique([
    ...provided,
    ...cleanItems(compound.primary_mechanisms || compound.primaryMechanisms || compound.pathways, 6),
  ]).slice(0, 6)
}

function ChipList({ items, limit = items.length }: { items: string[]; limit?: number }) {
  const visible = items.slice(0, limit)
  if (!visible.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((item) => (
        <span key={item} className="chip-readable text-xs">
          {item}
        </span>
      ))}
    </div>
  )
}



export default async function CompoundPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const compound = await getCompoundBySlug(normalizedSlug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
  }

  if (slug !== normalizedSlug || normalizeSlug(compound.slug) != normalizedSlug) {
    redirect(`/compounds/${normalizeSlug(compound.slug)}/`)
  }

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item:any) => item.slug))
  const compoundSlugs = new Set(compounds.map((item:any) => item.slug))
  const sourceSlug = compound.slug

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const effects = list(compound.effects || compound.primary_effects || compound.primaryActions)
    .map((effect:string) => formatDisplayLabel(effect))
    .filter(isClean)

  const mechanisms = list(compound.mechanisms)
    .map((item:any) => formatDisplayLabel(item))
    .filter(isClean)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier || compound.evidenceLevel || compound.evidence_grade)
  const safetyLevel = normalizeSafetyLevel(compound.safety || compound.safetyNotes)

  const snapshot = getEvidenceSnapshot(compound)

  const [
    relatedBySlug,
    comparisonBySlug,
    stackBySlug,
    ecosystemContinuityRecords,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [compound], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [compound], allRecords, 8),
    getBatchedRuntimeRecords('stack', [compound], allRecords, 6),
    getEcosystemContinuityRecords(compound, allRecords, 6),
  ])

  const relatedCandidates = (relatedBySlug[sourceSlug] || [])
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const relatedCompounds = relatedCandidates
    .filter((item:any) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item:any) => ({ ...item, entityType: 'compound' }))

  const relatedHerbs = relatedCandidates
    .filter((item:any) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item:any) => ({ ...item, entityType: 'herb' }))

  const visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const semanticRelated = mergeEcosystemContinuityRecords(
    [...relatedCompounds, ...relatedHerbs],
    visibleEcosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (comparisonBySlug[sourceSlug] || [])
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const stackRecords = (stackBySlug[sourceSlug] || [])
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .slice(0, 6)

  const featuredCollections = getFeaturedCollections(compound)
  const graph = buildSemanticGraphVisual(compound, semanticRelated, 14)
  const narrative = buildSemanticNarrative(compound, semanticRelated)
  const prompts = buildContinuationPrompts(compound, semanticRelated)
  const assistant = buildSemanticAssistantSummary(compound, semanticRelated)
  const assistantSuggestions = buildSemanticNavigationSuggestions(compound, semanticRelated, 5)
  const readiness = getMonetizationReadiness(compound)
  const sourcingNotes = buildSourcingNotes(compound)
  const confidenceObj = getEvidenceConfidence(compound as any)

  const sources = getSources(compound)
    .map((source:any) => text(source))
    .filter(isClean)
  const displayName = formatDisplayLabel(compound.name || compound.slug)
  const quickSummary = firstSentences(summary, 2) || 'Evidence-informed compound profile with safety, mechanism, and fit context.'
  const timeline = getTimeline(compound)
  const avoidIf = getAvoidIf(compound)
  const safetySummary = getSafetySummary(compound, avoidIf)
  const mechanismHints = getMechanismHints(compound, mechanisms)
  const topSignals = unique([...effects, ...mechanismHints]).slice(0, 8)
  const regulationProfile = getRegulationProfile([...topSignals, safetySummary])
  const safetyTone = getSafetyTone(safetySummary, avoidIf)
  const keyTakeaways = unique([
    effects.length ? `Most often explored for ${effects.slice(0, 3).join(', ')}.` : '',
    evidenceLevel ? `Evidence context currently reads as ${evidenceLevel.toLowerCase()}.` : '',
    safetySummary ? `Safety first: ${safetySummary}` : '',
    timeline ? `Timeline/onset context: ${timeline}.` : '',
    mechanismHints.length ? `Mechanism signals include ${mechanismHints.slice(0, 3).join(', ')}.` : '',
  ].filter(Boolean)).slice(0, 5)

  const compoundJsonLd = generateCompoundJsonLd({
    name: displayName,
    slug: compound.slug,
    description: summary,
    category: compound.compoundClass || compound.class || undefined,
    evidenceGrade: evidenceLevel || undefined,
    safetyNotes: compound.safetyNotes || compound.safety_notes || compound.safety || undefined,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Compounds', url: 'https://www.thehippiescientist.net/compounds' },
    { name: displayName, url: `https://www.thehippiescientist.net/compounds/${compound.slug}` },
  ])

  const tabs = [
    {
      id: 'evidence-outcomes',
      label: 'Evidence & Outcomes',
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">Evidence summary</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">What the current profile supports</h2>
            <p className="max-w-4xl text-sm leading-6 text-[#46574d]">
              Use this profile as an evidence-aware orientation, not a guarantee of outcomes. Human data quality, formulation differences, and dosing variability can change real-world effects.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {effects.length > 0 ? (
              <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Primary evidence topics</p>
                <div className="mt-3"><ChipList items={effects} limit={8} /></div>
              </div>
            ) : null}
            <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">What we still do not know</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
                <li>• Long-term effects can differ from short-term study windows.</li>
                <li>• Individual response varies across genetics, baseline health, and concurrent stack choices.</li>
                <li>• Mechanistic signals may not translate directly into clinically meaningful outcomes.</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-900/10 pt-6">
            <h3 className="text-lg font-semibold tracking-tight text-ink mb-3">Evidence snapshot metrics</h3>
            <EvidenceSnapshotCard snapshot={snapshot} />
          </div>
        </div>
      )
    },
    {
      id: 'decision-support',
      label: 'Decision Support',
      content: (
        <div className="space-y-8">
          <ProfileDecisionLayer
            record={compound}
            entityType="compound"
            relatedRecords={semanticRelated}
            effects={effects}
            mechanisms={mechanisms}
            summary={summary}
          />
          <SemanticIntelligenceDashboard node={compound as any} />
          <DecisionVisualGrid record={compound} />
          <WhyThisInsteadPanel
            record={compound}
            alternatives={semanticRelated}
          />
          <DecisionClarityFieldManual
            record={compound}
            entityType="compound"
            relatedRecords={semanticRelated}
            effects={effects}
            mechanisms={mechanisms}
            summary={summary}
          />
        </div>
      )
    },
    {
      id: 'ai-assistant-map',
      label: 'AI Assistant & Map',
      content: (
        <div className="space-y-8">
          <SemanticArtworkPanel
            slug={compound.slug}
            kind="compound"
            title={displayName}
            subtitle="Compound ecosystem artwork for mechanism-aware pathway exploration."
            height={260}
          />
          <AuthorityEditorialLayer
            record={compound}
            entityType="compound"
            effects={effects}
            mechanisms={mechanisms}
            summary={summary}
          />
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
              title="Compound relationship map"
              description="A lightweight map of mechanism overlap, pathway continuity, and connected semantic profiles."
              nodes={graph.nodes}
              edges={graph.edges}
            />
          </SemanticVisibilityGate>
          <ProfileAuthoritySections
            record={compound}
            entityType="compound"
            relatedRecords={semanticRelated}
            comparisonRecords={comparisonRecords}
            stackRecords={stackRecords}
            effects={effects}
            mechanisms={mechanisms}
            summary={summary}
          />
        </div>
      )
    },
    {
      id: 'authority-sourcing',
      label: 'Authority & Sourcing',
      content: (
        <div className="space-y-8">
          <SourcingCta record={compound} displayName={displayName} />
          <EvidenceAwareCTA
            readiness={readiness}
            sourcingNotes={sourcingNotes}
            record={compound}
          />
          <RuntimeOrchestratedDiscovery
            record={compound}
          />
          <CompactRelatedPathways record={compound} />
          {featuredCollections.length > 0 ? (
            <div className="border-t border-brand-900/10 pt-5">
              <p className="eyebrow-label">Featured in collections</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {featuredCollections.slice(0, 4).map((collection:any) => (
                  <Link
                    key={collection.slug}
                    href={collection.href}
                    className="border-b border-brand-900/10 py-1 text-sm font-semibold text-ink transition hover:border-brand-700/40"
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {sources.length > 0 ? (
            <div className="border-t border-brand-900/10 pt-6">
              <h3 className="text-lg font-semibold tracking-tight text-ink mb-3">Research and source context</h3>
              <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
                {sources.slice(0, 10).map((source:string) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compoundJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ReadingProgress />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 pb-24 sm:space-y-16 sm:py-10 sm:pb-32">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compounds', href: '/compounds' },
            { label: compound.name },
          ]}
        />

        <section className="hero-shell rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(340px,1.18fr)] lg:items-start">
            <div className="space-y-4 lg:pt-2">
              <CompoundHero
                compound={{ ...compound, summary: quickSummary }}
                evidenceLevel={evidenceLevel}
                safetyLevel={safetyLevel}
              />

              <EvidenceBadgeGroup record={compound} compact />
            </div>

            <EvidenceSnapshotPanel
              title="5-second profile read"
              subtitle="Educational overview only. Individual effects and side-effect sensitivity can vary."
              badge="Start here"
              className="rounded-[1.65rem] border border-brand-900/10 bg-white/95 p-4 shadow-[0_18px_45px_rgba(47,64,52,0.12)] sm:p-5 lg:sticky lg:top-6"
              fields={buildDetailEvidenceSnapshotFields({
                bestFit: effects.slice(0, 3).join(', '),
                humanEvidence: evidenceLevel,
                safetyLevel: `${safetyTone}: ${safetySummary}`,
                toleranceRisk: formatDisplayLabel(compound.tolerance_risk || compound.toleranceRisk),
                regulationProfile,
                typicalOnset: timeline || 'Timing varies by dose, form, and context.',
                useCautionIf: avoidIf.length ? avoidIf.slice(0, 3).join(', ') : '',
                uncertain: mechanismHints.length ? `Mechanism hints are preliminary: ${mechanismHints.slice(0, 3).join(', ')}. Real-world response can vary by person and product.` : '',
                confidenceLabel: confidenceObj.confidenceLabel,
                evidenceWeight: confidenceObj.evidenceWeight,
                humanEvidenceFlag: confidenceObj.humanEvidenceFlag,
                evidenceExplanation: confidenceObj.evidenceExplanation,
              })}
            />
          </div>
        </section>

        <TrustBar />

        {keyTakeaways.length > 0 ? (
          <section className="border-t border-brand-900/10 pt-6">
            <p className="eyebrow-label">Key takeaways</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
              {keyTakeaways.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-3xl bg-amber-50/70 p-5 sm:p-6">
          <div className="space-y-2">
            <p className="eyebrow-label text-amber-900">Safety first</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Review cautions before use</h2>
            <p className="max-w-4xl text-sm leading-6 text-[#5f4a24]">
              Educational-only framing: individual response varies by dose, formulation, concurrent medications, and health context. {safetySummary}
            </p>
          </div>
          {avoidIf.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-ink">Avoid / review first if</h3>
              <div className="mt-2"><ChipList items={avoidIf} limit={6} /></div>
            </div>
          ) : null}
        </section>

        <DetailTabDashboard tabs={tabs} />



        <RelatedDiscoveryGroups
          eyebrow="Related navigation"
          title="Keep exploring with evidence context"
          groups={[
            {
              title: 'Related comparisons',
              description: 'Side-by-side pages for closer tradeoff decisions.',
              links: comparisonRecords
                .filter((item: any) => item?.slug)
                .map((item: any) => {
                  const compSlug = getValidComparisonSlug(sourceSlug, item.slug)
                  if (!compSlug) return null
                  return {
                    href: `/compare/${compSlug}`,
                    label: formatDisplayLabel(item.name || item.title || item.slug)
                  }
                })
                .filter((item): item is { href: string; label: string } => item !== null)
                .slice(0, 4),
            },
            {
              title: 'Alternatives and adjacencies',
              description: 'Compounds and herbs with overlapping pathway signals.',
              links: semanticRelated.slice(0, 4).map((item:any) => ({ href: item.entityType === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`, label: formatDisplayLabel(item.name || item.displayName || item.slug) })),
            },
            {
              title: 'Beginner-friendly next reads',
              description: 'Start with educational explainers before stacking.',
              links: [
                { href: '/learn', label: 'Learn evidence and safety basics' },
                { href: '/goals', label: 'Browse goals guides' },
              ],
            },
          ]}
        />
      </main>
    </>
  )
}
