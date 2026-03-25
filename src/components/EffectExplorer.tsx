import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { effectSuggestions, rankHerbsByEffect } from '@/utils/effectSearch'
import type { Herb } from '@/types'

type EffectExplorerProps = {
  herbs: Herb[]
}

function confidenceTone(level: string) {
  if (level === 'high') return 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100'
  if (level === 'medium') return 'border-amber-300/40 bg-amber-500/15 text-amber-100'
  return 'border-rose-300/40 bg-rose-500/15 text-rose-100'
}

export default function EffectExplorer({ herbs }: EffectExplorerProps) {
  const [query, setQuery] = useState('')

  const suggestions = useMemo(() => effectSuggestions(herbs, 12), [herbs])
  const results = useMemo(() => rankHerbsByEffect(herbs, query).slice(0, 9), [herbs, query])

  return (
    <section className='ds-card-lg mb-6'>
      <h2 className='text-2xl font-semibold'>What do you want to feel?</h2>
      <p className='mt-2 text-sm text-white/75'>
        Search by desired effect (for example: relaxation, focus, sleep) and get ranked herbs.
      </p>

      <div className='mt-4'>
        <label htmlFor='effect-explorer-input' className='sr-only'>
          What do you want to feel?
        </label>
        <input
          id='effect-explorer-input'
          list='effect-explorer-suggestions'
          type='search'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Try “relaxation”, “focus”, “sleep”…'
          className='w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/45 focus:border-violet-300/40 focus:outline-none'
        />
        <datalist id='effect-explorer-suggestions'>
          {suggestions.map(suggestion => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      {query.trim() && (
        <div className='mt-5'>
          <p className='mb-3 text-sm text-white/70'>{results.length} ranked matches</p>

          {results.length === 0 ? (
            <div className='rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70'>
              No close matches yet. Try another effect term.
            </div>
          ) : (
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {results.map((result, index) => {
                const herb = result.herb
                const herbLabel = herb.common || herb.name || herb.scientific || 'Herb'
                const slug = String(herb.slug || '').trim()
                return (
                  <article
                    key={`${slug}-${index}`}
                    className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <h3 className='text-base font-semibold text-white'>{herbLabel}</h3>
                      <span className='rounded-full border border-violet-300/40 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-100'>
                        #{index + 1}
                      </span>
                    </div>

                    <p className='mt-2 text-sm text-white/75'>
                      Match:{' '}
                      {result.matchedEffects.slice(0, 2).join(', ') || result.normalizedQuery}
                    </p>

                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(result.confidence)}`}
                      >
                        confidence: {result.confidence}
                      </span>
                      <span className='rounded-full border border-sky-300/35 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-100'>
                        compounds: {result.compoundSupportCount}
                      </span>
                      <span className='rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] text-white/80'>
                        score: {Math.round(result.score)}
                      </span>
                    </div>

                    {slug && (
                      <Link
                        to={`/herbs/${encodeURIComponent(slug)}`}
                        className='mt-3 inline-flex text-sm text-violet-200 underline underline-offset-4 hover:text-violet-100'
                      >
                        View herb details
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
