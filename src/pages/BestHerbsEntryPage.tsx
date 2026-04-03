import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { getCommonName } from '@/lib/herbName'
import { getHerbProducts } from '@/lib/herbProducts'
import { rankHerbsByEffect } from '@/utils/effectSearch'
import { asStringArray } from '@/utils/asStringArray'
import type { Herb } from '@/types'

type EntryIntent = 'anxiety' | 'sleep' | 'focus' | 'stress' | 'energy'

type EntryPageConfig = {
  intent: EntryIntent
  path: string
  title: string
  intro: string
  rankingTerms: string[]
  metaTitle: string
  metaDescription: string
}

const ENTRY_PAGE_CONFIGS: Record<EntryIntent, EntryPageConfig> = {
  anxiety: {
    intent: 'anxiety',
    path: '/best-herbs-for-anxiety',
    title: 'Best Herbs for Anxiety Support',
    intro:
      'These herbs are commonly used to reduce anxious tension and support calmer day-to-day functioning. Use this list to compare practical options, then review the full herb pages for interactions and contraindications.',
    rankingTerms: ['relaxation', 'mood'],
    metaTitle: 'Best Herbs for Anxiety (Natural Options That Actually Help)',
    metaDescription:
      'Discover the most effective herbs for anxiety, how they work, and which ones to try first.',
  },
  sleep: {
    intent: 'sleep',
    path: '/best-herbs-for-sleep',
    title: 'Best Herbs for Better Sleep',
    intro:
      'If your goal is falling asleep faster or winding down before bed, these herbs are a practical starting point. Compare quick summaries here, then check each herb profile for dosing context and safety details.',
    rankingTerms: ['sleep', 'relaxation'],
    metaTitle: 'Best Herbs for Sleep (Natural Nighttime Support)',
    metaDescription:
      'Compare practical herbs for sleep support, how they are commonly used, and which options to test first.',
  },
  focus: {
    intent: 'focus',
    path: '/best-herbs-for-focus',
    title: 'Best Herbs for Focus and Clarity',
    intro:
      'Focus support can come from stimulation, stress reduction, or cognitive support. This page highlights herbs often used for sharper attention and cleaner concentration during work or study blocks.',
    rankingTerms: ['focus', 'energy'],
    metaTitle: 'Best Herbs for Focus (Natural Clarity and Concentration)',
    metaDescription:
      'Explore herbs for focus and mental clarity, including practical use cases and where to start safely.',
  },
  stress: {
    intent: 'stress',
    path: '/best-herbs-for-stress',
    title: 'Best Herbs for Stress Relief',
    intro:
      'For daily stress load, these herbs are often used to soften physical and mental strain without overcomplicating routines. Start with one option, track response, and adjust conservatively.',
    rankingTerms: ['relaxation', 'mood'],
    metaTitle: 'Best Herbs for Stress Relief (Calmer Daily Support)',
    metaDescription:
      'Find herbs commonly used for stress relief, how they may help, and which choices are easiest to begin with.',
  },
  energy: {
    intent: 'energy',
    path: '/best-herbs-for-energy',
    title: 'Best Herbs for Natural Energy',
    intro:
      'These herbs are commonly used for non-jittery energy, stamina, or daytime alertness. Use this page to shortlist options and click through for full evidence, interactions, and formulation notes.',
    rankingTerms: ['energy', 'focus'],
    metaTitle: 'Best Herbs for Natural Energy (Steady, Non-Jittery Options)',
    metaDescription:
      'Review herbs for natural energy and stamina, compare practical options, and pick a simple starting point.',
  },
}

const ENTRY_ORDER: EntryIntent[] = ['anxiety', 'sleep', 'focus', 'stress', 'energy']

function buildPracticalSummary(herb: Herb, matchedEffects: string[]): string {
  const description = String(herb.effectsSummary || herb.description || '').trim()
  const compactDescription = description
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(' ')
    .trim()

  if (compactDescription) return compactDescription

  const effectList = asStringArray(herb.effects)
    .flatMap(effect => effect.split(/[;,|]/))
    .map(effect => effect.trim())
    .filter(Boolean)

  const topEffects = (matchedEffects.length ? matchedEffects : effectList).slice(0, 2)
  if (topEffects.length > 0) {
    return `Commonly used for ${topEffects.join(' and ')}. Open the herb detail page for safety and interaction checks.`
  }

  return 'Use the herb detail page to review practical effects, preparation options, and key safety notes.'
}

function buildRankedHerbs(herbs: Herb[], terms: string[], limit = 6) {
  const ranked: Array<ReturnType<typeof rankHerbsByEffect>[number]> = []
  const seen = new Set<string>()

  terms.forEach(term => {
    rankHerbsByEffect(herbs, term).forEach(entry => {
      const slug = String(entry.herb.slug || '').trim()
      if (!slug || seen.has(slug)) return
      seen.add(slug)
      ranked.push(entry)
    })
  })

  return ranked.slice(0, limit)
}

export default function BestHerbsEntryPage() {
  const { intent = '' } = useParams<{ intent: EntryIntent }>()
  const config = ENTRY_PAGE_CONFIGS[intent as EntryIntent]
  const herbs = useHerbData()

  if (!config) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Page not found.</p>
      </main>
    )
  }

  const ranked = buildRankedHerbs(herbs, config.rankingTerms, 6)

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${config.metaTitle} | The Hippie Scientist`}
        description={config.metaDescription}
        path={config.path}
      />

      <div className='ds-stack'>
        <section className='ds-card-lg'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-white/60'>
            Guided entry page
          </p>
          <h1 className='mt-2 text-3xl font-semibold text-white'>{config.title}</h1>
          <p className='mt-3 text-sm leading-7 text-white/80'>{config.intro}</p>
        </section>

        <section className='ds-card'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-lg font-semibold text-white'>Herbs to compare first</h2>
              <p className='mt-1 text-xs text-white/70'>
                Showing {ranked.length} practical options to explore.
              </p>
            </div>
            <p className='text-xs text-white/60'>Open any herb for full safety and interaction detail.</p>
          </div>

          <ol className='mt-4 space-y-3'>
          {ranked.map((entry, index) => {
            const slug = String(entry.herb.slug || '').trim()
            const herbName = getCommonName(entry.herb) || entry.herb.scientific || slug
            const products = getHerbProducts(slug).slice(0, 2)
            const shouldSurfaceProducts = index < 3 && products.length > 0

            return (
              <li key={slug} className='rounded-xl border border-white/10 bg-white/[0.04] p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <h3 className='text-base font-semibold text-white'>
                    <Link
                      to={`/herbs/${encodeURIComponent(slug)}`}
                      className='hover:text-cyan-200'
                    >
                      {herbName}
                    </Link>
                  </h3>
                  <span className='text-xs text-white/65'>#{index + 1}</span>
                </div>

                <p className='mt-2 text-sm text-white/80'>
                  {buildPracticalSummary(entry.herb, entry.matchedEffects)}
                </p>

                <p className='mt-2 text-xs text-white/65'>
                  Matched effects: {entry.matchedEffects.slice(0, 3).join(', ') || 'general support'}
                </p>

                {shouldSurfaceProducts && (
                  <div className='mt-3 rounded-lg border border-white/10 bg-black/15 p-3'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-white/70'>
                      Product options
                    </p>
                    <div className='mt-2 space-y-2'>
                      {products.map(product => (
                        <article
                          key={`${slug}-${product.productTitle}`}
                          className='rounded-lg border border-white/10 bg-white/[0.03] p-2.5'
                        >
                          <p className='text-sm font-medium text-white'>{product.productTitle}</p>
                          <p className='mt-1 text-xs capitalize text-white/65'>Form: {product.form}</p>
                          {product.notes && <p className='mt-1 text-xs text-white/70'>{product.notes}</p>}
                          {product.affiliateUrl ? (
                            <a
                              href={product.affiliateUrl}
                              target='_blank'
                              rel='noreferrer nofollow sponsored'
                              className='mt-2 inline-flex text-xs font-medium text-emerald-200 hover:text-emerald-100'
                            >
                              View product
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
          </ol>
        </section>

        <section className='ds-card'>
          <h2 className='text-lg font-semibold text-white'>Explore related pages</h2>
          <div className='mt-3 grid gap-2 sm:grid-cols-2'>
            {ENTRY_ORDER.filter(item => item !== config.intent).map(item => (
              <Link
                key={item}
                to={ENTRY_PAGE_CONFIGS[item].path}
                className='rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/85 transition hover:border-cyan-300/50 hover:text-cyan-100'
              >
                {ENTRY_PAGE_CONFIGS[item].title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
