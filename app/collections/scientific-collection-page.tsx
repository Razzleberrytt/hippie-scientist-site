import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import {
  buildCollectionMetadata,
  findCollectionBySlug,
  getCollectionCard,
  getCollectionRecords,
  normalizeCollection,
  type ScientificCollection,
} from '@/lib/collections'
import { formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { EcosystemPanelGrid, KnowledgeGraphLinks, SemanticHubIntro, SignalPanel } from '@/components/semantic-hubs/semantic-hub-sections'
import { getAdjacentEcosystemPanels } from '@/lib/ecosystem-context'

type CollectionPageProps = {
  slug: string
}

function getEffects(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.primaryActions),
  ])
    .filter(isClean)
    .slice(0, 4)
}

function getMechanisms(record: any) {
  return unique([
    ...list(record?.mechanisms),
    ...list(record?.mechanism),
    ...list(record?.pathway_bucket),
  ])
    .filter(isClean)
    .slice(0, 4)
}


function buildCollectionIntro(collection: ScientificCollection) {
  const subject = collection.primaryType === 'herb' ? 'botanical records' : collection.primaryType === 'compound' ? 'compound records' : 'matching records'

  return [
    {
      title: 'Biological context',
      body: `${collection.title} groups ${subject} by shared effect language, pathway signals, and practical research context rather than by alphabetical browsing.`,
    },
    {
      title: 'Research focus',
      body: 'This collection is strongest when matching profiles expose clean mechanisms, associated effects, and publication-ready summaries from the workbook pipeline.',
    },
    {
      title: 'Common mechanisms',
      body: 'Mechanism and effect chips provide relationship context while preserving the profile pages as the source for evidence strength, cautions, and interpretation.',
    },
  ]
}

function getAdjacentThemes(collection: ScientificCollection, mechanisms: string[], effects: string[]) {
  return unique([
    ...collection.chips,
    ...mechanisms.map(formatDisplayLabel),
    ...effects.map(formatDisplayLabel),
  ]).slice(0, 8)
}

function visible(records: any[]) {
  return records.filter((record) => getRuntimeVisibility(record).canRender)
}

function primaryFirst<T extends { type: 'herb' | 'compound' }>(cards: T[], collection: ScientificCollection) {
  if (!collection.primaryType) return cards
  return [
    ...cards.filter(card => card.type === collection.primaryType),
    ...cards.filter(card => card.type !== collection.primaryType),
  ]
}

function CollectionCards({ cards }: { cards: ReturnType<typeof getCollectionCard>[] }) {
  if (!cards.length) {
    return (
      <div className="surface-subtle rounded-2xl border border-brand-900/10 p-5 text-sm leading-7 text-[#46574d]">
        No runtime-visible records currently expose enough matching evidence and semantic context for this section.
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((item) => (
        <Link key={`${item.type}-${item.slug}`} href={item.href} className="card-premium group p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <EvidenceBadgeGroup record={item.record} compact />
              <span className="identity-meta capitalize">{item.type}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.signals.slice(0, 3).map((signal) => (
                <span key={signal} className="chip-readable">{signal}</span>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-ink transition group-hover:text-brand-700">
                {item.name}
              </h3>

              <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#46574d]">
                {item.summary}
              </p>
            </div>

            {item.pathways.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                {item.pathways.map((pathway) => (
                  <span key={pathway} className="identity-meta">{pathway} pathway</span>
                ))}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}

export function generateCollectionMetadata(slug: string): Metadata {
  const collection = findCollectionBySlug(slug)
  if (!collection) return {}

  const meta = buildCollectionMetadata(collection)

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
  }
}

export async function ScientificCollectionPage({ slug }: CollectionPageProps) {
  const collection = normalizeCollection(findCollectionBySlug(slug))
  if (!collection) notFound()

  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const herbMatches = visible(getCollectionRecords(herbs, collection)).map(record => getCollectionCard(record, 'herb', collection))
  const compoundMatches = visible(getCollectionRecords(compounds, collection)).map(record => getCollectionCard(record, 'compound', collection))
  const allCards = primaryFirst([...compoundMatches, ...herbMatches], collection).filter(card => card.slug && card.href)

  const mechanisms = unique(allCards.flatMap(card => getMechanisms(card.record))).slice(0, 12)
  const effects = unique(allCards.flatMap(card => getEffects(card.record))).slice(0, 12)
  const primaryCards = allCards.filter(card => !collection.primaryType || card.type === collection.primaryType).slice(0, 12)
  const supportingCards = allCards.filter(card => collection.primaryType && card.type !== collection.primaryType).slice(0, 6)
  const adjacentThemes = getAdjacentThemes(collection, mechanisms, effects)

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-14 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-3">
            <p className="eyebrow-label">{collection.eyebrow}</p>

            <h1 className="heading-premium text-ink">
              {collection.title}
            </h1>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            {collection.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {collection.chips.map((chip) => (
              <span key={chip} className="chip-readable">{chip}</span>
            ))}
          </div>
        </div>
      </section>

      <SemanticHubIntro sections={buildCollectionIntro(collection)} />

      <SignalPanel
        eyebrow="Related scientific themes"
        title="How this collection connects"
        description="These terms summarize the strongest adjacent systems, effects, and mechanism language present in the matching runtime records."
        signals={adjacentThemes}
      />

      <EcosystemPanelGrid
        eyebrow="Category ecosystems"
        title="Where this collection sits in the larger map"
        panels={getAdjacentEcosystemPanels(adjacentThemes, 4)}
        limit={4}
      />

      <section className="grid gap-5 md:grid-cols-2">
        <div className="card-premium p-6">
          <p className="eyebrow-label">Mechanism relationships</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mechanisms.length > 0 ? mechanisms.map(mechanism => (
              <span key={mechanism} className="chip-readable">{formatDisplayLabel(mechanism)}</span>
            )) : <p className="text-sm leading-7 text-[#46574d]">Mechanism chips appear when matching workbook records expose clean semantic signals.</p>}
          </div>
        </div>

        <div className="card-premium p-6">
          <p className="eyebrow-label">Related effects</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {effects.length > 0 ? effects.map(effect => (
              <span key={effect} className="chip-readable">{formatDisplayLabel(effect)}</span>
            )) : <p className="text-sm leading-7 text-[#46574d]">Effect chips appear when matching workbook records expose clean associated-effect fields.</p>}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Evidence-informed discovery</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            {collection.primaryType === 'herb' ? 'Primary herbs' : collection.primaryType === 'compound' ? 'Primary compounds' : 'Matching records'}
          </h2>
        </div>

        <CollectionCards cards={primaryCards} />
      </section>

      {supportingCards.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="eyebrow-label">Semantic overlap</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">
              Supporting {collection.primaryType === 'herb' ? 'compounds' : 'herbs'}
            </h2>
          </div>

          <CollectionCards cards={supportingCards} />
        </section>
      ) : null}

      <KnowledgeGraphLinks
        eyebrow="Related Collections"
        title="Continue the scientific graph"
        links={collection.related.map((item) => ({ label: item.title, href: item.href, description: item.description }))}
      />
    </main>
  )
}
