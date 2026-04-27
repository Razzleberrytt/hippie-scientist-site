import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { getCommonName } from '@/lib/herbName'
import { useGoalBundles } from '@/hooks/useGoalBundles'
import {
  buildEffectCollectionFeed,
  EFFECT_COLLECTION_CONFIGS,
  type EffectCollectionIntent,
} from '@/utils/effectCollections'
import { getPrimaryEffects, getProfileStatus, getSummaryQuality, resolveHeroSummary, shouldRenderSummary } from '@/lib/workbookRender'

const COLLECTION_ORDER: EffectCollectionIntent[] = ['sleep', 'focus', 'relaxation']

function confidenceTone(level: string) {
  if (level === 'high') return 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100'
  if (level === 'medium') return 'border-amber-300/40 bg-amber-500/15 text-amber-100'
  return 'border-rose-300/40 bg-rose-500/15 text-rose-100'
}

export default function HerbGoalPage() {
  const { goal = '' } = useParams<{ goal: string }>()
  const intent = goal as EffectCollectionIntent
  const config = EFFECT_COLLECTION_CONFIGS[intent]
  const goalLabel = goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : ''
  const herbs = useHerbData()
  const { bundles, loading: bundlesLoading } = useGoalBundles(goal)

  if (!config) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Collection not found.</p>
      </main>
    )
  }

  const ranked = buildEffectCollectionFeed(herbs, intent, 18)
  const curatedBundles = [...bundles].sort((a, b) => a.rank - b.rank)

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${config.title} | The Hippie Scientist`}
        description={config.seoDescription}
        path={`/herbs-for-${intent}`}
      />

      <section className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{config.title}</h1>
        <p className='mt-3 text-sm leading-7 text-white/80'>{config.intro}</p>
      </section>

      {curatedBundles.length > 0 && (
        <section className='ds-card mt-5'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-lg font-semibold text-white'>Curated Herb Stacks for {goalLabel}</h2>
            <p className='text-xs text-white/70'>{curatedBundles.length} curated stacks</p>
          </div>

          <ul className='mt-3 space-y-3'>
            {curatedBundles.map(bundle => (
              <li
                key={`${bundle.goal}-${bundle.rank}-${bundle.stack}`}
                className='rounded-xl border border-white/10 bg-white/5 p-4'
              >
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-cyan-200/90'>#{bundle.rank}</p>
                    <p className='text-base font-semibold text-white'>{bundle.stack}</p>
                    <p className='mt-1 text-xs text-white/70'>Intent: {bundle.intent}</p>
                  </div>
                  <p className='text-xs text-white/70'>Score: {bundle.score}</p>
                </div>

                <div className='mt-2 flex flex-wrap items-center gap-2'>
                  <span className='rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100'>
                    {bundle.time_of_day.toUpperCase()}
                  </span>
                  <span className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100'>
                    {bundle.balance_profile}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className='ds-card mt-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-white'>Browse All Herbs for {goalLabel}</h2>
          <p className='text-xs text-white/70'>
            {bundlesLoading ? 'Loading curated stacks…' : `${ranked.length} ranked matches`}
          </p>
        </div>

        <ol className='mt-3 space-y-3'>
          {ranked.map(item => {
            const slug = String(item.herb.slug || '').trim()
            const rawHerb = (item.herb.rawData as Record<string, unknown> | undefined) || (item.herb as unknown as Record<string, unknown>)
            const profileStatus = getProfileStatus(rawHerb)
            const summaryQuality = getSummaryQuality(rawHerb)
            const showSummary = shouldRenderSummary(profileStatus, summaryQuality)
            const summary = resolveHeroSummary(rawHerb, 1) || (summaryQuality === 'strong' ? item.summary : '')
            const primaryEffects = getPrimaryEffects(rawHerb, profileStatus === 'minimal' ? 1 : 3)
            return (
              <li
                key={slug || item.rank}
                className='rounded-xl border border-white/10 bg-white/5 p-4'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-cyan-200/90'>#{item.rank}</p>
                    <Link
                      to={`/herbs/${encodeURIComponent(slug)}`}
                      className='text-base font-semibold text-white hover:text-cyan-200'
                    >
                      {getCommonName(item.herb) || item.herb.scientific || slug}
                    </Link>
                  </div>
                  <p className='text-xs text-white/70'>Effect score: {item.score}</p>
                </div>

                <div className='mt-2 flex flex-wrap items-center gap-2'>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(item.confidence)}`}
                  >
                    confidence: {item.confidence}
                  </span>
                  <span className='rounded-full border border-sky-300/35 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-100'>
                    compounds: {item.compoundSupportCount}
                  </span>
                </div>

                {showSummary && summary && <p className='mt-2 text-sm text-white/80'>{summary}</p>}
                <p className='mt-2 text-xs text-white/65'>
                  Matched effects: {item.matchedEffects.slice(0, 3).join(', ') || config.query}
                </p>

                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {primaryEffects.map(effect => (
                    <span
                      key={`${slug}-${effect}`}
                      className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100'
                    >
                      {effect}
                    </span>
                  ))}
                </div>

                <ul className='mt-2 list-disc pl-5 text-xs text-amber-100/85'>
                  {item.safetyNotes.map(note => (
                    <li key={`${slug}-${note}`}>{note}</li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </section>

      <section className='ds-card mt-5'>
        <h2 className='text-lg font-semibold text-white'>Safety framing</h2>
        <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-white/80'>
          {config.safetyFraming.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className='ds-card mt-5'>
        <h2 className='text-lg font-semibold text-white'>Explore related effect collections</h2>
        <div className='mt-3 flex flex-wrap gap-2'>
          {COLLECTION_ORDER.filter(item => item !== intent).map(item => (
            <Link
              key={item}
              to={`/herbs-for-${item}`}
              className='rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs capitalize text-white/85 transition hover:border-cyan-300/50 hover:text-cyan-100'
            >
              Herbs for {item}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
