'use client'

import { useMemo, useState } from 'react'
import type { RegisteredResearchSource } from '@/lib/research-source-register'

type Props = {
  records: RegisteredResearchSource[]
  previousPmids: string[]
  categories: Array<{ key: string; count: number }>
}

const PAGE_SIZE = 30

function humanize(value: string) {
  return value.split('_').map(word => word === 'nps' ? 'NPS' : word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function SourceRegisterClient({ records, previousPmids, categories }: Props) {
  const [view, setView] = useState<'verified' | 'previous'>('verified')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [year, setYear] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const years = useMemo(() => [...new Set(records.map(record => record.year).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a)), [records])

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim()
    return records.filter(item =>
      (!category || item.category === category) &&
      (!year || item.year === year) &&
      (!needle || [item.title, item.journal, item.pmid, item.doi, humanize(item.category)]
        .some(value => value.toLowerCase().includes(needle))))
      .sort((a, b) => b.wave - a.wave)
  }, [records, query, category, year])

  const filteredPrevious = useMemo(() => {
    const needle = query.trim()
    return needle ? previousPmids.filter(pmid => pmid.includes(needle)) : previousPmids
  }, [previousPmids, query])

  const count = view === 'verified' ? filtered.length : filteredPrevious.length
  const hasMore = visibleCount < count

  function changeView(value: 'verified' | 'previous') {
    setView(value)
    setVisibleCount(PAGE_SIZE)
    setQuery('')
    setCategory('')
    setYear('')
  }

  function resetFilters() {
    setQuery('')
    setCategory('')
    setYear('')
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className='space-y-7'>
      <section aria-labelledby='source-topics-heading' className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='eyebrow-label'>Topic coverage</p>
            <h2 id='source-topics-heading' className='mt-2 text-2xl font-bold tracking-tight text-ink'>Where the latest 500 papers were discovered</h2>
          </div>
          <p className='text-xs leading-5 text-muted'>Discovery labels, not evidence grades</p>
        </div>
        <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map(item => (
            <button
              key={item.key}
              type='button'
              aria-pressed={view === 'verified' && category === item.key}
              onClick={() => { setView('verified'); setCategory(category === item.key ? '' : item.key); setYear(''); setQuery(''); setVisibleCount(PAGE_SIZE) }}
              className={'min-w-0 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ' +
                (view === 'verified' && category === item.key ? 'border-brand-700 bg-brand-50' : 'border-brand-900/10 bg-brand-50/40 hover:border-brand-700/30')}
            >
              <span className='flex items-center justify-between gap-3 text-xs font-semibold text-ink'>
                <span>{humanize(item.key)}</span>
                <span className='tabular-nums'>{item.count}</span>
              </span>
              <span className='mt-2 block h-1.5 overflow-hidden rounded-full bg-brand-900/10' aria-hidden='true'>
                <span className='block h-full rounded-full bg-brand-700' style={{ width: (100 * item.count / Math.max(1, ...categories.map(topic => topic.count))) + '%' }} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby='source-browse-heading' className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='eyebrow-label'>Searchable source trail</p>
            <h2 id='source-browse-heading' className='mt-2 text-2xl font-bold tracking-tight text-ink'>Browse the register</h2>
          </div>
          <a href='/learn/citation-explorer/' className='text-sm font-semibold text-brand-700 hover:underline'>Reviewed runtime evidence →</a>
        </div>
        <div className='mt-5 flex flex-wrap gap-2' aria-label='Select source collection'>
          <button
            type='button'
            aria-pressed={view === 'verified'}
            onClick={() => changeView('verified')}
            className={'min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ' + (view === 'verified' ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-900/15 text-ink hover:bg-brand-50')}
          >
            Latest source-verified (500)
          </button>
          <button
            type='button'
            aria-pressed={view === 'previous'}
            onClick={() => changeView('previous')}
            className={'min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ' + (view === 'previous' ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-900/15 text-ink hover:bg-brand-50')}
          >
            Historical PMID index ({previousPmids.length.toLocaleString()})
          </button>
        </div>
        <p className='mt-3 text-xs leading-6 text-muted'>
          {view === 'verified'
            ? 'These titles, identifiers, and journals were checked against PubMed. Scientific interpretation and evidence-grade assignment are separate editorial steps.'
            : 'Earlier unique PubMed identifiers are available for direct source lookup. Titles and topic labels are intentionally not invented for entries without this batch’s exact-source metadata.'}
        </p>

        <div className='mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_minmax(0,9rem)]'>
          <label className={view === 'previous' ? 'md:col-span-3' : ''}>
            <span className='block text-xs font-bold uppercase tracking-wider text-muted'>{view === 'verified' ? 'Search title, PMID, journal, or DOI' : 'Find a PMID'}</span>
            <input
              type='search'
              value={query}
              onChange={event => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE) }}
              placeholder={view === 'verified' ? 'e.g. magnesium, sleep, 18499602' : 'Enter digits from a PubMed ID'}
              className='mt-1.5 min-h-11 w-full rounded-xl border border-brand-900/20 bg-white px-3 py-2.5 text-base text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand-700'
            />
          </label>
          {view === 'verified' ? (
            <>
              <label>
                <span className='block text-xs font-bold uppercase tracking-wider text-muted'>Research topic</span>
                <select value={category} onChange={event => { setCategory(event.target.value); setVisibleCount(PAGE_SIZE) }} className='mt-1.5 min-h-11 w-full rounded-xl border border-brand-900/20 bg-white px-3 py-2.5 text-sm text-ink'>
                  <option value=''>All topics</option>
                  {categories.map(item => <option key={item.key} value={item.key}>{humanize(item.key)}</option>)}
                </select>
              </label>
              <label>
                <span className='block text-xs font-bold uppercase tracking-wider text-muted'>Publication year</span>
                <select value={year} onChange={event => { setYear(event.target.value); setVisibleCount(PAGE_SIZE) }} className='mt-1.5 min-h-11 w-full rounded-xl border border-brand-900/20 bg-white px-3 py-2.5 text-sm text-ink'>
                  <option value=''>All years</option>
                  {years.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            </>
          ) : null}
        </div>
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-900/10 pt-4'>
          <p className='text-sm text-muted' role='status' aria-live='polite'><strong className='text-ink'>{count.toLocaleString()}</strong> identifiers match</p>
          {(query || category || year) ? <button type='button' onClick={resetFilters} className='min-h-10 rounded-full border border-brand-900/15 px-4 text-xs font-bold text-ink hover:bg-brand-50'>Clear filters</button> : null}
        </div>
      </section>

      <section aria-label='Research source results'>
        {count === 0 ? <p className='rounded-xl border border-brand-900/10 bg-white p-6 text-sm text-muted'>No records match these filters.</p> : null}
        {view === 'verified' ? (
          <div className='grid gap-3 md:grid-cols-2'>
            {filtered.slice(0, visibleCount).map(item => (
              <article key={item.pmid} className='flex min-w-0 flex-col rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
                <div className='flex flex-wrap items-center gap-2 text-xs'>
                  <span className='rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-800'>{humanize(item.category)}</span>
                  <span className='font-medium text-muted'>Wave {item.wave}</span>
                  {item.year ? <span className='font-medium text-muted'>· {item.year}</span> : null}
                </div>
                <h3 className='mt-3 text-base font-semibold leading-6 text-ink'>{item.title}</h3>
                {item.journal ? <p className='mt-2 text-xs leading-5 text-muted'>{item.journal}</p> : null}
                <p className='mt-3 text-xs leading-5 text-muted'>Source identity verified · Research-only · Not evidence-graded</p>
                <div className='mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4 text-sm font-semibold'>
                  <a href={'https://pubmed.ncbi.nlm.nih.gov/' + item.pmid + '/'} target='_blank' rel='noopener noreferrer' className='text-brand-700 hover:underline'>PubMed · {item.pmid} ↗</a>
                  {item.doi ? <a href={'https://doi.org/' + encodeURIComponent(item.doi)} target='_blank' rel='noopener noreferrer' className='text-brand-700 hover:underline'>DOI ↗</a> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
            {filteredPrevious.slice(0, visibleCount).map(pmid => (
              <a key={pmid} href={'https://pubmed.ncbi.nlm.nih.gov/' + pmid + '/'} target='_blank' rel='noopener noreferrer'
                className='flex min-h-14 items-center justify-between gap-2 rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-sm font-semibold text-brand-700 hover:border-brand-700/40 hover:bg-brand-50'>
                <span>PMID {pmid}</span><span aria-hidden='true'>↗</span>
              </a>
            ))}
          </div>
        )}
        {hasMore ? (
          <div className='mt-6 flex justify-center'>
            <button type='button' onClick={() => setVisibleCount(n => n + PAGE_SIZE)} className='min-h-11 rounded-full border border-brand-900/20 bg-white px-6 py-3 text-sm font-bold text-brand-800 hover:border-brand-700/40 hover:bg-brand-50'>
              Show more · {Math.min(PAGE_SIZE, count - visibleCount)} next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
