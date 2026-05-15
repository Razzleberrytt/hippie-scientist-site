import Link from 'next/link'
import { getAllCompounds, getAllHerbs } from '@/lib/server/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { KnowledgeGraphLinks, SemanticHubIntro } from '@/components/semantic-hubs/semantic-hub-sections'

function normalize(value: unknown) {
  return String(value || '').toLowerCase()
}

function isSleepRelated(record: any) {
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

  return /sleep|gaba|calm|relax|circadian|rest|sedative|melatonin/.test(signals)
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
        return isSleepRelated(item)
      } catch {
        return false
      }
    })
    .slice(0, 12)
    .map((item: any) => ({
      record: item,
      slug: item?.slug || '',
      name: formatDisplayLabel(item?.name || item?.slug),
      summary: cleanSummary(item?.summary || item?.description || '', type),
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
  { title: 'Biological context', body: 'Sleep-support exploration intersects with inhibitory neurotransmission, arousal state, circadian rhythm, and recovery biology.' },
  { title: 'Research focus', body: 'Cards are selected from records with sleep, relaxation, GABA, circadian, melatonin-adjacent, or restorative workbook signals.' },
  { title: 'Common mechanisms', body: 'Mechanism chips improve navigation, but individual evidence badges and profile cautions should carry the interpretive weight.' },
]

const graphLinks = [
  { label: 'GABA pathway', href: '/pathways/gaba', description: 'Inhibitory-tone and relaxation pathway context for sleep-adjacent profiles.' },
  { label: 'Sleep goal guide', href: '/goals/sleep', description: 'Outcome-led sleep guide for comparing latency, quality, and relaxation support.' },
  { label: 'Sleep herbs vs melatonin', href: '/sleep-herbs-vs-melatonin', description: 'Comparison cluster linking botanical sleep supports with melatonin context.' },
  { label: 'Best studied sleep compounds', href: '/collections/best-studied-sleep-compounds', description: 'Collection view for sleep-related compounds with stronger evidence signals.' },
]

const semanticSignals = [
  'GABA Signaling',
  'Circadian Rhythm',
  'Sleep Latency',
  'Relaxation Support',
  'Nervous System Support',
  'Recovery Support',
]

export default async function SleepExplorePage() {
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
              Sleep Support
            </h1>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Explore herbs and compounds commonly researched for sleep quality, relaxation signaling, circadian support, nighttime recovery, and calming neurological pathways.
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
        eyebrow="Pathway companions"
        title="Follow adjacent sleep research"
        links={graphLinks}
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">
            Evidence-forward compounds
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Sleep-related compounds
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
            Botanical pathways
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Calming and restorative herbs
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
