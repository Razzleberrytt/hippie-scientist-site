import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHerbBySlug } from '@/lib/runtime-data'
import { getHerbMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import { buildSemanticNarrative, buildContinuationPrompts } from '@/lib/semantic-exploration-narratives'
import { buildSourcingNotes, getMonetizationReadiness } from '@/lib/monetization-context'
import {
  buildSemanticAssistantSummary,
  buildSemanticNavigationSuggestions,
} from '@/lib/ai-semantic-navigation'
import { buildMeta } from '@/lib/seo'
import { buildAuthorityProfileModel } from '@/lib/authority-profile'
import { buildInternalLinkDensity } from '@/lib/internal-link-density'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getFeaturedCollections } from '@/lib/collections'
import ProfileAuthoritySections from '@/components/profile-authority-sections'
import { ProfileDecisionLayer } from '@/components/profile-decision-layer'
import DecisionClarityFieldManual from '@/components/decision-clarity-field-manual'
import DecisionVisualGrid from '@/components/decision-visual-grid'
import WhyThisInsteadPanel from '@/components/why-this-instead-panel'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'
import AuthorityEditorialLayer from '@/components/profile/AuthorityEditorialLayer'
import AuthorityProfileShell from '@/components/authority/AuthorityProfileShell'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import GuidedExplorationPanel from '@/components/guided-exploration-panel'
import EvidenceAwareCTA from '@/components/evidence-aware-cta'
import SemanticAssistantPanel from '@/components/semantic-assistant-panel'

export async function generateStaticParams() {
  const { herbs } = await getUnifiedRuntimeRecords()

  return herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const herb = await getHerbMetadataRecord(params.slug)

  if (!herb) {
    return {
      title: 'Herb Not Found',
    }
  }

  const visibility = getRuntimeVisibility(herb)
  const meta = buildMeta({
    title: `${formatDisplayLabel(herb.name || herb.slug)} | Herb`,
    description: cleanSummary(herb.summary || herb.description || '', 'herb'),
    path: `/herbs/${herb.slug}`,
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

function getEffects(herb: any) {
  return unique([
    ...list(herb.primary_effects),
    ...list(herb.effects),
    ...list(herb.primaryActions),
  ])
    .filter(isClean)
    .slice(0, 6)
}

function LinkDensitySection({ links }: { links: ReturnType<typeof buildInternalLinkDensity> }) {
  const items = [...links.guides, ...links.ecosystems, ...links.compares].slice(0, 9)
  if (items.length === 0) return null

  return (
    <section className="compact-card section-rhythm-compact">
      <div className="space-y-1">
        <p className="eyebrow-label">Continue Research</p>
        <h2 className="max-w-none text-2xl font-semibold tracking-tight text-ink">
          Related guides, ecosystems, and comparisons
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-700/30 hover:bg-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function HerbDetailPage({ params }: any) {
  const herb = await getHerbBySlug(params.slug)

  if (!herb || !getRuntimeVisibility(herb).canRender) {
    notFound()
  }

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item: any) => item.slug))
  const compoundSlugs = new Set(compounds.map((item: any) => item.slug))
  const sourceSlug = herb.slug

  const [
    relatedBySlug,
    comparisonBySlug,
    stackBySlug,
    ecosystemContinuityRecords,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [herb], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [herb], allRecords, 8),
    getBatchedRuntimeRecords('stack', [herb], allRecords, 6),
    getEcosystemContinuityRecords(herb, allRecords, 6),
  ])

  const relatedCandidates = (relatedBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedHerbs = relatedCandidates
    .filter((item: any) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'herb' }))

  const relatedCompounds = relatedCandidates
    .filter((item: any) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'compound' }))

  const visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedProfiles = mergeEcosystemContinuityRecords(
    [...relatedHerbs, ...relatedCompounds],
    visibleEcosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (comparisonBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const stackRecords = (stackBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .slice(0, 6)

  const featuredCollections = getFeaturedCollections(herb)
  const effects = getEffects(herb)
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  const graph = buildSemanticGraphVisual(herb, relatedProfiles, 14)
  const narrative = buildSemanticNarrative(herb, relatedProfiles)
  const prompts = buildContinuationPrompts(herb, relatedProfiles)
  const assistant = buildSemanticAssistantSummary(herb, relatedProfiles)
  const assistantSuggestions = buildSemanticNavigationSuggestions(herb, relatedProfiles, 5)
  const readiness = getMonetizationReadiness(herb)
  const sourcingNotes = buildSourcingNotes(herb)
  const authorityModel = buildAuthorityProfileModel(herb)
  const internalLinks = buildInternalLinkDensity(herb)

  const herbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DietarySupplement',
    name: formatDisplayLabel(herb.name || herb.slug),
    description: summary,
    url: `https://www.thehippiescientist.net/herbs/${herb.slug}`,
    ...(herb.latin_name ? { alternateName: herb.latin_name } : {}),
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
        name: 'Herbs',
        item: 'https://www.thehippiescientist.net/herbs',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: formatDisplayLabel(herb.name || herb.slug),
        item: `https://www.thehippiescientist.net/herbs/${herb.slug}`,
      },
    ],
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(herbJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/herbs" className="hover:text-ink transition">
          Herbs
        </Link>

        <span>/</span>

        <span className="text-ink">
          {formatDisplayLabel(herb.name || herb.slug)}
        </span>
      </nav>

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-stretch">
          <div className="max-w-4xl space-y-5">
            <p className="eyebrow-label">
              Botanical Research Profile
            </p>

            <h1 className="heading-premium text-ink">
              {formatDisplayLabel(herb.name || herb.slug)}
            </h1>

            <EvidenceBadgeGroup record={herb} />

            <p className="detail-reading text-base text-[#46574d] sm:text-lg">
              {summary}
            </p>

            {effects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {effects.map((effect: string) => (
                  <span key={effect} className="chip-readable">
                    {effect}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <SemanticArtworkPanel
            slug={herb.slug}
            kind="botanical"
            title={formatDisplayLabel(herb.name || herb.slug)}
            subtitle="Botanical ecosystem artwork for evidence-aware pathway exploration."
            height={300}
          />
        </div>
      </section>

      <ProfileDecisionLayer
        record={herb}
        entityType="herb"
        relatedRecords={relatedProfiles}
        effects={effects}
        summary={summary}
      />

      <DecisionVisualGrid record={herb} />

      <WhyThisInsteadPanel
        record={herb}
        alternatives={relatedProfiles}
      />

      <DecisionClarityFieldManual
        record={herb}
        entityType="herb"
        relatedRecords={relatedProfiles}
        effects={effects}
        summary={summary}
      />

      <AuthorityProfileShell model={authorityModel} record={herb} />

      <LinkDensitySection links={internalLinks} />

      <AuthorityEditorialLayer
        record={herb}
        entityType="herb"
        effects={effects}
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
          title="Profile relationship map"
          description="A lightweight map of pathway signals, mechanism overlap, and connected semantic profiles."
          nodes={graph.nodes}
          edges={graph.edges}
        />
      </SemanticVisibilityGate>

      <ProfileAuthoritySections
        record={herb}
        entityType="herb"
        relatedRecords={relatedProfiles}
        comparisonRecords={comparisonRecords}
        stackRecords={stackRecords}
        effects={effects}
        summary={summary}
      />

      <EvidenceAwareCTA
        readiness={readiness}
        sourcingNotes={sourcingNotes}
        record={herb}
      />

      <RuntimeOrchestratedDiscovery
        record={herb}
      />

      <CompactRelatedPathways record={herb} />

      {featuredCollections.length > 0 ? (
        <section className="card-premium space-y-4 p-5">
          <div className="space-y-1">
            <p className="eyebrow-label">Featured In Collections</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Evidence-aware collection links
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {featuredCollections.slice(0, 4).map((collection) => (
              <Link
                key={collection.slug}
                href={collection.href}
                className="surface-subtle rounded-2xl border border-brand-900/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-white/60"
              >
                {collection.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
