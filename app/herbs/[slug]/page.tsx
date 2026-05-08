import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHerbBySlug, getHerbs } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getRelatedRuntimeRecords } from '@/lib/related-runtime'
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

  const herbs = await getHerbs()

  const relatedHerbs = getRelatedRuntimeRecords(herb, herbs, 6)
    .filter((item: any) => getRuntimeVisibility(item).canRender)
  const featuredCollections = getFeaturedCollections(herb)
  const effects = getEffects(herb)
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">
            Botanical Research Profile
          </p>

          <h1 className="heading-premium text-ink">
            {formatDisplayLabel(herb.name || herb.slug)}
          </h1>

          <EvidenceBadgeGroup record={herb} />

          <p className="detail-reading text-lg text-[#46574d]">
            {summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {effects.map((effect: string) => (
              <span key={effect} className="chip-readable">
                {effect}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ProfileAuthoritySections
        record={herb}
        entityType="herb"
        relatedRecords={relatedHerbs}
        effects={effects}
        summary={summary}
      />

      <CompactRelatedPathways record={herb} />

      {featuredCollections.length > 0 ? (
        <section className="card-premium space-y-4 p-5">
          <div className="space-y-1">
            <p className="eyebrow-label">Featured In Collections</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence-aware collection links</h2>
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

      {relatedHerbs.length > 0 ? (
        <section className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label">
              Semantic discovery
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-ink">
              Related herbs and pathways
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedHerbs.map((item: any) => (
              <Link
                key={item.slug}
                href={`/herbs/${item.slug}`}
                className="card-premium group p-5"
              >
                <div className="space-y-4">
                  <EvidenceBadgeGroup record={item} compact />

                  <div className="flex flex-wrap gap-2">
                    {(item.relatedOverlap || []).slice(0, 2).map((signal: string) => (
                      <span key={signal} className="chip-readable">
                        {formatDisplayLabel(signal)}
                      </span>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink transition group-hover:text-brand-700">
                      {formatDisplayLabel(item.name || item.slug)}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
                      {cleanSummary(item.summary || item.description || '', 'herb')}
                    </p>
                  </div>

                  <div className="identity-meta">
                    {item.relatedScore || 0} shared semantic signals
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
