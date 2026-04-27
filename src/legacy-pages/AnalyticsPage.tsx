import { useCallback, useEffect, useMemo, useState } from 'react'
import Meta from '@/components/Meta'
import {
  getConversionRates,
  getEventCountsByType,
  getTopCollectionPages,
  getTopCombosRun,
  getTopItemsAddedToChecker,
  getTopItemsAddedToStack,
} from '@/utils/analytics/aggregateEvents'
import { clearAnalyticsEvents, readAnalyticsEvents } from '@/utils/analytics/eventStorage'
import { seedAnalyticsData } from '@/utils/analytics/seedAnalytics'

type DashboardState = {
  totalEvents: number
  eventCounts: Record<string, number>
  topCollections: ReturnType<typeof getTopCollectionPages>
  topCheckerItems: ReturnType<typeof getTopItemsAddedToChecker>
  topStackItems: ReturnType<typeof getTopItemsAddedToStack>
  topCombos: ReturnType<typeof getTopCombosRun>
  conversionRates: ReturnType<typeof getConversionRates>
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function maxCount<T>(rows: T[], selector: (row: T) => number) {
  return rows.reduce((max, row) => Math.max(max, selector(row)), 0) || 1
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const width = `${Math.max(6, (value / max) * 100)}%`

  return (
    <div className='h-2 w-full rounded-full bg-white/10'>
      <div className='h-2 rounded-full bg-emerald-300/70' style={{ width }} />
    </div>
  )
}

function buildState(): DashboardState {
  return {
    totalEvents: readAnalyticsEvents().length,
    eventCounts: getEventCountsByType(),
    topCollections: getTopCollectionPages(),
    topCheckerItems: getTopItemsAddedToChecker(),
    topStackItems: getTopItemsAddedToStack(),
    topCombos: getTopCombosRun(),
    conversionRates: getConversionRates(),
  }
}

export default function AnalyticsPage() {
  const [state, setState] = useState<DashboardState>(() => buildState())

  const refresh = useCallback(() => {
    setState(buildState())
  }, [])

  useEffect(() => {
    refresh()

    const onUpdate = () => refresh()

    window.addEventListener('hs:analytics-events-updated', onUpdate)
    window.addEventListener('storage', onUpdate)

    return () => {
      window.removeEventListener('hs:analytics-events-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [refresh])

  const checkerRuns = state.eventCounts.collection_item_add_to_checker || 0

  const collectionMax = useMemo(
    () => maxCount(state.topCollections, row => row.views),
    [state.topCollections]
  )
  const checkerMax = useMemo(
    () => maxCount(state.topCheckerItems, row => row.count),
    [state.topCheckerItems]
  )
  const stackMax = useMemo(
    () => maxCount(state.topStackItems, row => row.count),
    [state.topStackItems]
  )
  const comboMax = useMemo(() => maxCount(state.topCombos, row => row.count), [state.topCombos])

  return (
    <main className='container-page py-8'>
      <Meta
        title='Analytics Dashboard | The Hippie Scientist'
        description='Internal analytics dashboard.'
        path='/analytics'
        noindex
      />
      <header className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>Collection Analytics (Local)</h1>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-white/75'>
          Internal dashboard powered by localStorage events only. Data is browser-specific and
          resets when local data is cleared.
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          {import.meta.env.DEV ? (
            <button
              type='button'
              onClick={() => {
                seedAnalyticsData()
                refresh()
              }}
              className='btn-secondary text-xs'
            >
              Seed test data
            </button>
          ) : null}

          <button
            type='button'
            onClick={() => {
              clearAnalyticsEvents()
              refresh()
            }}
            className='btn-secondary text-xs'
          >
            Reset analytics
          </button>
        </div>
      </header>

      <section className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <article className='ds-card p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-white/60'>Total events</p>
          <p className='mt-2 text-3xl font-semibold text-white'>{state.totalEvents}</p>
        </article>
        <article className='ds-card p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-white/60'>Page views</p>
          <p className='mt-2 text-3xl font-semibold text-white'>
            {state.eventCounts.collection_page_view || 0}
          </p>
        </article>
        <article className='ds-card p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-white/60'>CTA clicks</p>
          <p className='mt-2 text-3xl font-semibold text-white'>
            {state.eventCounts.collection_cta_click || 0}
          </p>
        </article>
        <article className='ds-card p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-white/60'>Checker actions</p>
          <p className='mt-2 text-3xl font-semibold text-white'>{checkerRuns}</p>
        </article>
      </section>

      <section className='ds-card mt-6 p-4'>
        <h2 className='text-base font-semibold text-white'>Top Collection Pages</h2>
        {state.topCollections.length === 0 ? (
          <p className='mt-3 text-sm text-white/70'>No collection events yet.</p>
        ) : (
          <ul className='mt-3 space-y-3'>
            {state.topCollections.map(row => (
              <li key={row.slug} className='rounded-lg border border-white/10 bg-black/20 p-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-sm font-medium text-white'>{row.slug}</p>
                  <p className='text-xs text-white/70'>
                    {row.views} views · {row.ctaClicks} CTA · {pct(row.conversionRate)} conversion
                  </p>
                </div>
                <div className='mt-2'>
                  <MiniBar value={row.views} max={collectionMax} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='mt-6 grid gap-4 lg:grid-cols-2'>
        <article className='ds-card p-4'>
          <h2 className='text-base font-semibold text-white'>Top Items Added to Checker</h2>
          {state.topCheckerItems.length === 0 ? (
            <p className='mt-3 text-sm text-white/70'>No checker item events yet.</p>
          ) : (
            <ul className='mt-3 space-y-2'>
              {state.topCheckerItems.map(item => (
                <li key={item.name} className='rounded-lg border border-white/10 bg-black/20 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-sm text-white'>{item.name}</span>
                    <span className='text-xs text-white/70'>{item.count}</span>
                  </div>
                  <div className='mt-2'>
                    <MiniBar value={item.count} max={checkerMax} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className='ds-card p-4'>
          <h2 className='text-base font-semibold text-white'>Top Items Added to Stack</h2>
          {state.topStackItems.length === 0 ? (
            <p className='mt-3 text-sm text-white/70'>No stack item events yet.</p>
          ) : (
            <ul className='mt-3 space-y-2'>
              {state.topStackItems.map(item => (
                <li key={item.name} className='rounded-lg border border-white/10 bg-black/20 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-sm text-white'>{item.name}</span>
                    <span className='text-xs text-white/70'>{item.count}</span>
                  </div>
                  <div className='mt-2'>
                    <MiniBar value={item.count} max={stackMax} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className='mt-6 grid gap-4 lg:grid-cols-2'>
        <article className='ds-card p-4'>
          <h2 className='text-base font-semibold text-white'>Top Combos</h2>
          {state.topCombos.length === 0 ? (
            <p className='mt-3 text-sm text-white/70'>No combo runs yet.</p>
          ) : (
            <ul className='mt-3 space-y-2'>
              {state.topCombos.map(combo => (
                <li
                  key={combo.comboId}
                  className='rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <span>{combo.comboId}</span>
                    <span className='text-xs text-white/70'>{combo.count}</span>
                  </div>
                  <div className='mt-2'>
                    <MiniBar value={combo.count} max={comboMax} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className='ds-card p-4'>
          <h2 className='text-base font-semibold text-white'>Conversion Metrics</h2>
          <ul className='mt-3 space-y-2 text-sm text-white/85'>
            <li className='rounded-lg border border-white/10 bg-black/20 p-3'>
              Page view → CTA:{' '}
              <strong className='text-white'>{pct(state.conversionRates.viewToCTA)}</strong>
            </li>
            <li className='rounded-lg border border-white/10 bg-black/20 p-3'>
              CTA → checker action:{' '}
              <strong className='text-white'>{pct(state.conversionRates.CTAtoChecker)}</strong>
            </li>
            <li className='rounded-lg border border-white/10 bg-black/20 p-3'>
              Checker action → stack action:{' '}
              <strong className='text-white'>{pct(state.conversionRates.checkerToStack)}</strong>
            </li>
          </ul>
        </article>
      </section>
    </main>
  )
}
