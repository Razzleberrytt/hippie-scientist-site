import Link from 'next/link'
import { getAllCompounds, getAllHerbs } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { KnowledgeGraphLinks, SemanticHubIntro } from '@/components/semantic-hubs/semantic-hub-sections'

function normalize(value: unknown) {
  return String(value || '').toLowerCase()
}

function isFocusRelated(record: any) {
  const signals = unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    record?.summary,
    record?.description,
  ])
    .map(normalize)
    .join(' ')

  return /focus|cognition|memory|dopamine|acetylcholine|nootropic|brain|clarity|attention|neuro/.test(signals)
}

function buildCards(records: any[], type: 'herb' | 'compound') {
  return records
    .filter((item: any) => {
      try {
        return getRuntimeVisibility(item).canRender
      } catch {
        return false
      }
    })
    .filter((item: any) => {
      try {
        return isFocusRelated(item)
      } catch {
        return false
      }
    })
    .slice(0, 12)
    .map((item: any) => ({
      record: item,
      slug: item?.slug || '',
      name: formatDisplayLabel(item?.name || item?.slug),
      summary: cleanSummary(
        item?.summary || item?.description || '',
        type
      ),
      href: `/${type === 'herb' ? 'herbs' : 'compounds'}/${item?.slug || ''}`,
      effects: unique([
        ...list(item?.primary_effects),
        ...list(item?.effects),
      ])
        .filter(isClean)
        .slice(0, 3),
    }))
}


const hubIntro = [
  { title: 'Biological context', body: 'Cognition-support exploration spans neurotransmitter signaling, attention, mental energy, neuroprotection, and fatigue resistance.' },
  { title: 'Research focus', body: 'Cards are selected from records with focus, memory, nootropic, dopamine, cholinergic, brain-health, or clarity signals.' },
  { title: 'Common mechanisms', body: 'Mechanistic overlap is used for discovery and internal linking, not as a shortcut for evidence strength.' },
]

const graphLinks = [
  { label: 'Dopamine pathway', href: '/pathways/dopamine', description: 'Motivation, attention, reward, and cognitive-performance pathway relationships.' },
  { label: 'Focus goal guide', href: '/goals/focus', description: 'Outcome-led guide for focus, attention, brain fog, and cognition support.' },
  { label: 'Cholinergic compounds', href: '/collections/cholinergic-compounds', description: 'Collection centered on acetylcholine-adjacent compounds and cognition context.' },
  { label: 'Supplements for brain fog', href: '/guides/supplements-for-brain-fog-and-fatigue', description: 'Editorial guide for fatigue, clarity, and cognitive-energy overlap.' },
]

const semanticSignals = [
  'Cognitive Performance',
  'Attention Support',
  'Neurotransmitters',
  'Mental Clarity',
  'Memory Pathways',
  'Neuroplasticity',
]

export default async function FocusExplorePage() {
  const [herbs, compounds] = await Promise.all([
    getAllHerbs(),
    getAllCompounds(),
  ])

  const herbCards = buildCards(herbs as any[], 'herb')
  const compoundCards = buildCards(compounds as any[], 'compound')

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-16 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-3">
            <p className="eyebrow-label">
              Semantic Authority Hub
            </p>

            <h1 className="heading-premium max-w-[10ch] text-ink">
              Focus & Cognition
            </h1>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Explore herbs and compounds commonly researched for cognition, mental performance, neurotransmitter signaling, memory, attention, and neuroprotective pathways.
          </p>

          <div className="flex flex-wrap gap-2">
            {semanticSignals.map((signal) => (
              <span key={signal} className="chip-readable">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SemanticHubIntro sections={hubIntro} />

      <KnowledgeGraphLinks
        eyebrow="Mechanism overlap"
        title="Follow adjacent cognition research"
        links={graphLinks}
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">
            Evidence-forward compounds
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Cognitive compounds
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {compoundCards.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="card-premium group p-5"
            >
              <div className="space-y-4">
                <EvidenceBadgeGroup record={item.record} compact />

                <div className="flex flex-wrap gap-2">
                  {item.effects.map((effect) => (
                    <span key={effect} className="chip-readable">
                      {formatDisplayLabel(effect)}
                    </span>
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">
            Botanical cognition pathways
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Focus-oriented herbs
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {herbCards.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="card-premium group p-5"
            >
              <div className="space-y-4">
                <EvidenceBadgeGroup record={item.record} compact />

                <div className="flex flex-wrap gap-2">
                  {item.effects.map((effect) => (
                    <span key={effect} className="chip-readable">
                      {formatDisplayLabel(effect)}
                    </span>
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
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
