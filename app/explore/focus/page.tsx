import Link from 'next/link'
import herbs from '../../../public/data/herbs.json'
import compounds from '../../../public/data/compounds.json'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'

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

const herbCards = buildCards(herbs as any[], 'herb')
const compoundCards = buildCards(compounds as any[], 'compound')

const semanticSignals = [
  'Cognitive Performance',
  'Attention Support',
  'Neurotransmitters',
  'Mental Clarity',
  'Memory Pathways',
  'Neuroplasticity',
]

export default function FocusExplorePage() {
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
