import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCompoundBySlug } from '@/lib/runtime-data'
import { getCompoundMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import TrustBar from '@/components/ui/TrustBar'
import ReadingProgress from '@/components/ui/ReadingProgress'
import SectionBlock from '@/components/ui/SectionBlock'
import CompoundHero from '@/components/ui/CompoundHero'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text } from '@/lib/display-utils'
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

export async function generateStaticParams() {
  const { compounds } = await getUnifiedRuntimeRecords()

  return compounds
    .filter((compound:any) => getRuntimeVisibility(compound).canRender)
    .map((compound:any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: any) {
  const compound = await getCompoundMetadataRecord(params.slug)

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

function CompactDisclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-[1.5rem] border border-brand-900/10 bg-white/75 p-5 shadow-sm">
      <summary className="cursor-pointer list-none">
        <span className="flex items-center justify-between gap-4 text-base font-semibold tracking-tight text-ink">
          <span>{title}</span>
          <span className="text-brand-800 transition group-open:rotate-90" aria-hidden="true">›</span>
        </span>
      </summary>
      <div className="mt-5 space-y-5 border-t border-brand-900/10 pt-5">
        {children}
      </div>
    </details>
  )
}

export default async function CompoundPage({ params }: any) {
  const compound = await getCompoundBySlug(params.slug)

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

  const compoundJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DietarySupplement',
    name: formatDisplayLabel(compound.name || compound.slug),
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
        name: formatDisplayLabel(compound.name || compound.slug),
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

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-24 sm:space-y-10 sm:py-10 sm:pb-32">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compounds', href: '/compounds' },
            { label: compound.name },
          ]}
        />

        <TrustBar />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-stretch">
            <div className="space-y-5">
              <CompoundHero
                compound={{ ...compound, summary }}
                evidenceLevel={evidenceLevel}
                safetyLevel={safetyLevel}
              />

              <EvidenceBadgeGroup record={compound} />

              {effects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {effects.slice(0, 6).map((effect:string) => (
                    <span key={effect} className="chip-readable">
                      {effect}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <SemanticArtworkPanel
              slug={compound.slug}
              kind="compound"
              title={formatDisplayLabel(compound.name || compound.slug)}
              subtitle="Compound ecosystem artwork for mechanism-aware pathway exploration."
              height={300}
            />
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
            <SectionBlock title="Featured In Collections">
              <div className="flex flex-wrap gap-3">
                {featuredCollections.slice(0, 4).map((collection:any) => (
                  <Link
                    key={collection.slug}
                    href={collection.href}
                    className="surface-subtle rounded-2xl border border-brand-900/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-white/60"
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>
            </SectionBlock>
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
