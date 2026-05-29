import { notFound } from 'next/navigation'
import Link from 'next/link'
import { seoCollections } from '@/data/seoCollections'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { EcosystemPanelGrid, SemanticHubIntro, SignalPanel } from '@/components/semantic-hubs/semantic-hub-sections'
import { getAdjacentEcosystemPanels } from '@/lib/ecosystem-context'

type Params = { params: Promise<{ slug: string }> }

function textMatchesAny(text: string, filters: string[]) {
  const value = text.toLowerCase()
  return filters.some(filter => value.includes(filter.toLowerCase()))
}

function recordSignals(item: any) {
  return unique([
    ...list(item?.primary_effects),
    ...list(item?.effects),
    ...list(item?.mechanisms),
    ...list(item?.pathways),
  ]).filter(isClean)
}

export async function generateStaticParams() {
  return seoCollections.map(collection => ({ slug: collection.slug }))
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params
  const collection = seoCollections.find(item => item.slug === slug)
  if (!collection) notFound()

  const herbs = await getHerbs()
  const compounds = await getCompounds()
  const pool = collection.itemType === 'compound' ? compounds : herbs
  const effects = collection.filters.effectsAny ?? []

  const items = pool
    .filter(item => {
      if (effects.length === 0) return true
      const haystack = [item.summary, item.description, ...(item.mechanisms ?? [])]
        .filter(Boolean)
        .join(' ')
      return textMatchesAny(haystack, effects)
    })
    .slice(0, 40)

  const themes = unique(items.flatMap(recordSignals).map(formatDisplayLabel)).slice(0, 8)

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:space-y-12 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">Curated collection</p>
          <h1 className="heading-premium text-ink">{collection.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">{collection.description}</p>
        </div>
      </section>

      <SemanticHubIntro
        sections={[
          { title: 'Biological context', body: `This collection groups ${collection.itemType} profiles around shared workbook signals so readers can compare adjacent biology before opening individual profiles.` },
          { title: 'Research focus', body: 'Matching records are filtered by collection intent and summarized with concise profile excerpts rather than unsupported recommendations.' },
          { title: 'Discovery method', body: 'Theme chips and profile cards make the route useful as a crawlable bridge between broad search intent and evidence-informed depth pages.' },
        ]}
      />

      <SignalPanel
        eyebrow="Related scientific themes"
        title="Shared signals in this collection"
        description="These compact terms come from visible matching records and help recover context on otherwise sparse collection routes."
        signals={themes}
      />

      <EcosystemPanelGrid
        eyebrow="Research adjacencies"
        title="Adjacent systems for this collection"
        panels={getAdjacentEcosystemPanels(themes, 4)}
        limit={4}
      />

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="eyebrow-label">Matching profiles</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Evidence-informed collection cards</h2>
          </div>
          <span className="chip-readable">{items.length} matches</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const href = collection.itemType === 'compound' ? `/compounds/${item.slug}` : `/herbs/${item.slug}`
            const signals = recordSignals(item).slice(0, 3)
            return (
              <Link key={item.slug} href={href} className="card-premium group block p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {signals.map((signal) => (
                      <span key={signal} className="chip-readable">{formatDisplayLabel(signal)}</span>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-ink transition group-hover:text-brand-700">{item.displayName ?? item.name ?? item.slug}</h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#46574d]">{cleanSummary(item.summary ?? item.description, collection.itemType === 'compound' ? 'compound' : 'herb')}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
