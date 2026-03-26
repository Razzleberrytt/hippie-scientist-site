import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { effectSuggestions, rankHerbsByEffect } from '@/utils/effectSearch'
import type { Herb } from '@/types'
import { asStringArray } from '@/utils/asStringArray'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'

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
  const defaultQuery = 'relaxation'
  const normalizedQuery = query.trim()
  const activeQuery = normalizedQuery || defaultQuery

  const suggestions = useMemo(() => effectSuggestions(herbs, 12), [herbs])
  const activeResults = useMemo(
    () => rankHerbsByEffect(herbs, activeQuery).slice(0, 9),
    [herbs, activeQuery]
  )
  const fallbackResults = useMemo(
    () => rankHerbsByEffect(herbs, defaultQuery).slice(0, 9),
    [herbs, defaultQuery]
  )
  const hasExactQueryResults = normalizedQuery ? activeResults.length > 0 : true
  const results = hasExactQueryResults ? activeResults : fallbackResults
  const popularChips = useMemo(() => ['relaxation', 'focus', 'sleep', 'mood', 'energy'], [])

  return (
    <section id='effect-search' className='container mx-auto max-w-4xl px-4 pt-5 sm:px-6'>
      <div className='ds-card-lg border-violet-300/30 bg-violet-500/10'>
        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/85'>
          Effect search
        </p>
        <h2 className='mt-2 text-2xl font-semibold'>What outcome are you looking for?</h2>
        <p className='mt-2 text-sm text-white/75'>
          Search by desired effect and explore ranked herbs from the site&apos;s herb dataset.
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
          {!normalizedQuery && (
            <p className='mt-2 text-xs text-violet-100/75'>
              Showing top matches for{' '}
              <span className='font-semibold text-violet-100'>relaxation</span> to help you start
              quickly.
            </p>
          )}
        </div>

        <div className='mt-3 flex flex-wrap gap-2'>
          {popularChips.map(chip => (
            <button
              key={chip}
              type='button'
              onClick={() => setQuery(chip)}
              className='rounded-full border border-violet-300/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium capitalize text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-500/15'
            >
              {chip}
            </button>
          ))}
        </div>

        <div className='mt-5'>
          <p className='mb-3 text-sm text-white/70'>
            {results.length} ranked matches for <span className='font-semibold'>{activeQuery}</span>
          </p>
          {!hasExactQueryResults && (
            <p className='mb-3 text-xs text-amber-100/85'>
              No close matches for “{normalizedQuery}” yet. Showing strong relaxation fits instead.
            </p>
          )}

          <div className='grid gap-3 sm:grid-cols-2'>
            {results.map((result, index) => {
              const herb = result.herb
              const herbLabel = herb.common || herb.name || herb.scientific || 'Herb'
              const slug = String(herb.slug || '').trim()
              const topEffects = extractPrimaryEffects(asStringArray(herb.effects), 4)
              const summary =
                String(herb.effectsSummary || herb.description || herb.mechanism || '')
                  .replace(/\s+/g, ' ')
                  .trim() || 'Traditionally used for relaxation and nervous-system support.'
              const safetyNote =
                String(herb.safety || herb.sideEffects || herb.contraindicationsText || '')
                  .replace(/\s+/g, ' ')
                  .trim() || 'Review contraindications and interactions before use.'
              const tags = asStringArray(herb.tags).slice(0, 3)
              const confidenceLabel =
                result.confidence === 'high'
                  ? 'high'
                  : result.confidence === 'medium'
                    ? 'moderate'
                    : 'traditional'
              const isTopThree = index < 3
              return (
                <article
                  key={`${slug}-${index}`}
                  className={`ds-card flex h-full flex-col gap-3 p-4 ${
                    isTopThree
                      ? 'border-violet-200/45 bg-violet-500/15 shadow-lg shadow-violet-900/30'
                      : ''
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-base font-semibold text-white'>{herbLabel}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${isTopThree ? 'border-violet-200/60 bg-violet-400/20 text-violet-50' : 'border-violet-300/40 bg-violet-500/10 text-violet-100'}`}
                    >
                      #{index + 1} {isTopThree ? 'Top match' : ''}
                    </span>
                  </div>

                  <p className='line-clamp-1 text-sm text-white/80'>{summary}</p>

                  {tags.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                      {tags.map(tag => (
                        <span
                          key={`${slug}-${tag}`}
                          className='rounded-full border border-fuchsia-300/35 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] text-fuchsia-100'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='flex flex-wrap gap-1.5'>
                    {topEffects.slice(0, 3).map(effect => (
                      <span
                        key={`${slug}-${effect}`}
                        className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100'
                      >
                        {effect}
                      </span>
                    ))}
                  </div>

                  <p className='text-xs text-white/75'>
                    Match: {result.matchedEffects.slice(0, 2).join(', ') || result.normalizedQuery}
                  </p>

                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceTone(result.confidence)}`}
                    >
                      confidence: {confidenceLabel}
                    </span>
                    <span className='rounded-full border border-sky-300/35 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-100'>
                      compounds: {result.compoundSupportCount}
                    </span>
                  </div>

                  <p className='line-clamp-2 text-xs text-white/65'>Safety: {safetyNote}</p>

                  {slug && (
                    <Link
                      to={`/herbs/${encodeURIComponent(slug)}`}
                      className='mt-auto inline-flex text-sm text-violet-200 underline underline-offset-4 hover:text-violet-100'
                    >
                      View herb details
                    </Link>
                  )}
                </article>
              )
            })}
          </div>

          <div className='mt-5 rounded-xl border border-violet-300/35 bg-violet-500/10 p-4'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/85'>
              Next actions
            </p>
            <div className='mt-3 grid gap-2 text-sm'>
              <Link
                className='underline underline-offset-4 hover:text-violet-100'
                to='/build-blend'
              >
                Build a blend with these herbs
              </Link>
              <Link className='underline underline-offset-4 hover:text-violet-100' to='/compare'>
                Compare top herbs
              </Link>
              <Link
                className='underline underline-offset-4 hover:text-violet-100'
                to='/interactions'
              >
                Check interactions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
