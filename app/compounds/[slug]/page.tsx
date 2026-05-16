import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
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
import { buildMeta } from '@/lib/seo'
import {
  normalizeEvidenceLevel,
  normalizeSafetyLevel,
  getSources,
} from '@/lib/evidence-utils'
import { getEvidenceSnapshot } from '@/lib/semantic-runtime'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { getFeaturedCollections } from '@/lib/collections'
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

  const visibility = getRuntimeVisibility(compound)

  const meta = buildMeta({
    title: `${formatDisplayLabel(compound.name)} Benefits, Effects & Safety | The Hippie Scientist`,
    description: cleanSummary(compound.summary || compound.description, 'compound'),
    path: `/compounds/${compound.slug}`,
  })

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url: meta.url,
      images: [meta.image],
    },
    robots: visibility.canIndex
      ? undefined
      : {
          index: false,
          follow: true,
        },
  }
}


const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i

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

function DecisionSignalCard({ label, value, tone = 'neutral' }: { label: string; value?: string; tone?: 'neutral' | 'caution' | 'strong' | 'muted' }) {
  if (!value) return null

  const toneClass = tone === 'caution'
    ? 'text-amber-950'
    : tone === 'strong'
      ? 'text-emerald-950'
      : tone === 'muted'
        ? 'text-[#5b6b61]'
        : 'text-[#33443a]'

  return (
    <div className={`border-t border-brand-900/10 pt-3 ${toneClass}`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] opacity-65">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
    </div>
  )
}

function CompactDisclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-t border-brand-900/10 py-6 first:border-t-0 first:pt-0">
      <summary className="cursor-pointer list-none">
        <span className="flex items-center justify-between gap-4 text-base font-semibold tracking-tight text-ink">
          <span>{title}</span>
          <span className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">Open</span>
        </span>
      </summary>
      <div className="mt-6 space-y-7">
        {children}
      </div>
    </details>
  )
}

export default async function CompoundPage({ params }: PageProps) {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
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

  const compoundJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DietarySupplement',
    name: displayName,
    description: summary,
    url: `https://www.thehippiescientist.net/compounds/${compound.slug}`,
    ...(effects.length > 0 ? { activeIngredient: effects.join(', ') } : {}),
    safetyConsideration:
      'Educational content only. Consult a healthcare professional before use.',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Compounds',
        item: 'https://www.thehippiescientist.net/compounds',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayName,
        item: `https://www.thehippiescientist.net/compounds/${compound.slug}`,
      },
    ],
  }

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

        <TrustBar />

        <section className="hero-shell rounded-[2rem] p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="space-y-5">
              <CompoundHero
                compound={{ ...compound, summary: quickSummary }}
                evidenceLevel={evidenceLevel}
                safetyLevel={safetyLevel}
              />

              <div className="space-y-3">
                <EvidenceBadgeGroup record={compound} compact />
                {topSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {topSignals.slice(0, 5).map((signal:string) => (
                      <span key={signal} className="chip-readable text-xs">
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="rounded-3xl bg-sand-50/70 p-5">
              <p className="eyebrow-label">Decision snapshot</p>
              <div className="mt-3 grid gap-3">
                <DecisionSignalCard label="Evidence level" value={evidenceLevel} tone={evidenceLevel.toLowerCase().includes('strong') || evidenceLevel.toLowerCase().includes('high') ? 'strong' : 'neutral'} />
                <DecisionSignalCard label="Safety read" value={safetySummary} tone={CAUTION_PATTERN.test(safetySummary) || avoidIf.length > 0 ? 'caution' : 'neutral'} />
                <DecisionSignalCard label="Timeline" value={timeline || 'Timing varies by dose, form, and context.'} tone={timeline ? 'neutral' : 'muted'} />
                <DecisionSignalCard label="Mechanism hints" value={mechanismHints.slice(0, 3).join(', ')} />
              </div>
            </aside>
          </div>
        </section>

        <EvidenceSnapshotCard snapshot={snapshot} />

        <CompactDisclosure title="Decision support and practical notes">
          <ProfileDecisionLayer
            record={compound}
            entityType="compound"
            relatedRecords={semanticRelated}
            effects={effects}
            mechanisms={mechanisms}
            summary={summary}
          />

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
        </CompactDisclosure>

        <CompactDisclosure title="Authority, exploration, and semantic analysis">
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
        </CompactDisclosure>

        <CompactDisclosure title="Related discovery, pathways, and collections">
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
        </CompactDisclosure>

        {sources.length > 0 ? (
          <CompactDisclosure title="Research and source context">
            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              {sources.slice(0, 10).map((source:string) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </CompactDisclosure>
        ) : null}
      </main>
    </>
  )
}
