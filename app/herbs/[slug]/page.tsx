import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getHerbBySlug, getHerbs } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getComparisonRuntimeRecords, getRelatedRuntimeRecords, getStackRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { buildMeta } from '@/lib/seo'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getFeaturedCollections } from '@/lib/collections'
import ProfileAuthoritySections from '@/components/profile-authority-sections'

export async function generateStaticParams() {
  const herbs = await getHerbs()

  return herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const herb = await getHerbBySlug(params.slug)

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

export default async function HerbDetailPage({ params }: any) {
  const herb = await getHerbBySlug(params.slug)

  if (!herb || !getRuntimeVisibility(herb).canRender) {
    notFound()
  }

  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  const relatedHerbs = (await getRelatedRuntimeRecords(herb, herbs, 4))
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .map((item: any) => ({ ...item, entityType: 'herb' }))

  const relatedCompounds = (await getRelatedRuntimeRecords(herb, compounds, 4))
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .map((item: any) => ({ ...item, entityType: 'compound' }))

  const graphCandidateRecords = [
    ...herbs.map((item: any) => ({ ...item, entityType: 'herb' })),
    ...compounds.map((item: any) => ({ ...item, entityType: 'compound' })),
  ]

  const ecosystemContinuityRecords = getEcosystemContinuityRecords(herb, graphCandidateRecords, 6)
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedProfiles = mergeEcosystemContinuityRecords(
    [...relatedHerbs, ...relatedCompounds],
    ecosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (await getComparisonRuntimeRecords(herb, graphCandidateRecords, 8))
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const stackRecords = (await getStackRuntimeRecords(herb, graphCandidateRecords, 6))
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const featuredCollections = getFeaturedCollections(herb)
  const effects = getEffects(herb)
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
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
      </section>

      <ProfileAuthoritySections
        record={herb}
        entityType="herb"
        relatedRecords={relatedProfiles}
        comparisonRecords={comparisonRecords}
        stackRecords={stackRecords}
        effects={effects}
        summary={summary}
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
