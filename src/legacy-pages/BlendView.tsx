import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Meta from '@/components/Meta'
import { GOALS } from '@/data/goals'
import { useHerbData, type HerbSummary } from '@/lib/herb-data'
import { deserializeBlend } from '@/utils/deserializeBlend'
import { getHerbEffects, herbDisplayName } from '@/utils/herbSignals'

export default function BlendView() {
  const herbs = useHerbData()
  const [searchParams] = useSearchParams()

  const blendState = useMemo(() => deserializeBlend(searchParams.get('blend')), [searchParams])

  const hydratedBlend = useMemo(() => {
    if (!blendState || !herbs.length) return null
    const herbMap = new Map(herbs.map(herb => [herb.slug.toLowerCase(), herb]))
      const primary = herbMap.get(blendState.primary.toLowerCase())
      const supporting = blendState.supporting
        .map(item => herbMap.get(item.toLowerCase()))
        .filter((herb): herb is HerbSummary => Boolean(herb))

    if (!primary || supporting.length === 0) return null

    return {
      goalLabel: GOALS.find(goal => goal.id === blendState.goal)?.label ?? blendState.goal,
      primary,
      supporting,
    }
  }, [blendState, herbs])

  const metaTitle = hydratedBlend
    ? `${hydratedBlend.goalLabel} Blend using ${[
        herbDisplayName(hydratedBlend.primary),
        ...hydratedBlend.supporting.map(herb => herbDisplayName(herb)),
      ]
        .slice(0, 3)
        .join(', ')}`
    : 'Shared Herbal Blend'

  const metaDescription = hydratedBlend
    ? `Shared ${hydratedBlend.goalLabel.toLowerCase()} blend with ${herbDisplayName(hydratedBlend.primary)} as the primary herb and ${hydratedBlend.supporting.length} supporting herbs.`
    : 'View a shared herbal blend recommendation.'

  return (
    <main className='mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10'>
      <Meta title={metaTitle} description={metaDescription} path='/blend' noindex />
      <header className='space-y-2'>
        <p className='text-xs uppercase tracking-[0.24em] text-cyan-300'>Shared Blend</p>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>{metaTitle}</h1>
        <p className='text-sm text-slate-300 sm:text-base'>
          This static-like view restores a full blend from a shareable URL.
        </p>
      </header>

      {!hydratedBlend ? (
        <Card className='rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 text-sm text-rose-100'>
          Invalid or outdated blend link.
        </Card>
      ) : (
        <div className='space-y-4'>
          <Card className='rounded-2xl border border-cyan-400/30 p-5 sm:p-6'>
            <h2 className='text-xs uppercase tracking-[0.22em] text-cyan-300'>Goal</h2>
            <p className='mt-2 text-xl font-semibold text-white'>{hydratedBlend.goalLabel}</p>
          </Card>

          <Card className='rounded-2xl border border-cyan-400/40 p-5 sm:p-6'>
            <h2 className='text-xs uppercase tracking-[0.22em] text-cyan-300'>Primary Herb</h2>
            <p className='mt-2 text-2xl font-bold text-cyan-50'>
              {herbDisplayName(hydratedBlend.primary)}
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              {getHerbEffects(hydratedBlend.primary)
                .slice(0, 6)
                .map(effect => (
                  <Badge key={`blend-primary-${effect}`} className='bg-cyan-600/20 text-cyan-50'>
                    {effect}
                  </Badge>
                ))}
            </div>
          </Card>

          <Card className='rounded-2xl p-5 sm:p-6'>
            <h2 className='text-xs uppercase tracking-[0.22em] text-slate-400'>Supporting Herbs</h2>
            <ul className='mt-3 space-y-2 text-sm text-slate-100'>
              {hydratedBlend.supporting.map(herb => (
                <li
                  key={herb.slug}
                  className='rounded-xl border border-slate-700/70 bg-slate-900/50 p-3'
                >
                  {herbDisplayName(herb)}
                </li>
              ))}
            </ul>
          </Card>

          <Card className='rounded-2xl p-5 sm:p-6'>
            <h2 className='text-xs uppercase tracking-[0.22em] text-slate-400'>Reasoning</h2>
            <p className='mt-3 text-sm text-slate-200'>
              This blend prioritizes {herbDisplayName(hydratedBlend.primary)} for{' '}
              {hydratedBlend.goalLabel.toLowerCase()} and adds supporting herbs to broaden coverage
              across complementary effects while staying deterministic.
            </p>
          </Card>
        </div>
      )}
    </main>
  )
}
