'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PublicResearchSource } from '@/lib/research-source-register'
import type { SemanticNetwork } from '@/lib/research-semantic-network'
import SemanticResearchObservatory from './SemanticResearchObservatory'

type Props = {
  records: PublicResearchSource[]
  previousCount: number
  priorIndexHref: string
  throughWave: number
  categories: Array<{ key: string; count: number }>
  networkSummary: Pick<SemanticNetwork, 'concepts' | 'bridges' | 'summary'>
}

const PAGE_SIZE = 30

function humanize(value: string) {
  return value.split('_').map(word => word === 'nps' ? 'NPS' : word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function SourceRegisterClient({ records, previousCount, priorIndexHref, throughWave, categories, networkSummary }: Props) {
  // Initial HTML contains only graph overview, not all paper-to-paper edges.
  const [loadedNetwork, setLoadedNetwork] = useState<SemanticNetwork | null>(null)
  const [semanticLoading, setSemanticLoading] = useState(false)
  const [semanticError, setSemanticError] = useState('')
  const network: SemanticNetwork = loadedNetwork || { ...networkSummary, entries: {}, typedEdges: [] }
  const [view, setView] = useState<'verified' | 'previous'>('verified')
  const [previousPmids, setPreviousPmids] = useState<string[]>([])
  const [historicalLoaded, setHistoricalLoaded] = useState(false)
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [historicalError, setHistoricalError] = useState('')
  const [query, setQuery] = useState('')
  const [semanticConcept, setSemanticConcept] = useState('')
  const [category, setCategory] = useState('')
  const [year, setYear] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  async function activateSemanticNetwork() {
    if (semanticLoading || loadedNetwork) return
    setSemanticLoading(true)
    setSemanticError('')
    try {
      const response = await fetch('/research/source-register/semantic-network.json', { cache: 'force-cache' })
      if (!response.ok) throw new Error('Semantic graph response unavailable')
      const payload: unknown = await response.json()
      const data = payload as SemanticNetwork & {
        schema_version?: number
        through_wave?: number
        research_only?: boolean
      }
      if (data.schema_version !== 1 || data.through_wave !== throughWave || data.research_only !== true ||
          data.summary?.sourcePapers !== records.length ||
          !data.entries || Object.keys(data.entries).length !== records.length ||
          !Array.isArray(data.concepts) || data.concepts.length !== networkSummary.concepts.length ||
          data.summary?.activeConcepts !== networkSummary.summary.activeConcepts ||
          data.summary?.explainableEdges !== networkSummary.summary.explainableEdges ||
          data.summary?.typedEvidenceEdges !== networkSummary.summary.typedEvidenceEdges ||
          !Array.isArray(data.typedEdges) || data.typedEdges.length !== data.summary?.typedEvidenceEdges ||
          !records.every(record => data.entries[record.pmid]?.pmid === record.pmid)) {
        throw new Error('Semantic graph data integrity mismatch')
      }
      setLoadedNetwork(data)
    } catch {
      setSemanticError('The detailed graph could not be loaded or verified. Source lookup and direct PubMed links remain available.')
    } finally {
      setSemanticLoading(false)
    }
  }

  const years = useMemo(() => [...new Set(records.map(record => record.year).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a)), [records])

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim()
    return records.filter(item =>
      (!category || item.category === category) &&
      (!year || item.year === year) &&
      (!semanticConcept || !loadedNetwork || network.entries[item.pmid]?.mentions.some(m => m.id === semanticConcept)) &&
      (!needle || [item.title, item.journal, item.pmid, item.doi, humanize(item.category),
        ...(network.entries[item.pmid]?.mentions.map(m => m.label) || [])]
        .some(value => value.toLowerCase().includes(needle))))
      .sort((a, b) => b.wave - a.wave)
  }, [records, query, category, year, semanticConcept, loadedNetwork, network.entries])

  const filteredPrevious = useMemo(() => {
    const needle = query.trim()
    return needle ? previousPmids.filter(pmid => pmid.includes(needle)) : previousPmids
  }, [previousPmids, query])

  const count = view === 'verified' ? filtered.length : filteredPrevious.length
  const hasMore = visibleCount < count

  async function loadHistoricalIndex() {
    if (historicalLoading || historicalLoaded) return
    setHistoricalLoading(true)
    setHistoricalError('')
    try {
      const response = await fetch(priorIndexHref, { cache: 'force-cache' })
      if (!response.ok) throw new Error('Static research index unavailable')
      const payload: unknown = await response.json()
      const data = payload as { schema_version?: number; through_wave?: number; prior_unique_pmids?: number; inventory_only?: boolean; pmids?: unknown }
      if (data.schema_version !== 1 || data.through_wave !== throughWave - 500 || data.inventory_only !== true ||
          data.prior_unique_pmids !== previousCount || !Array.isArray(data.pmids) ||
          data.pmids.length !== previousCount || new Set(data.pmids).size !== previousCount ||
          !data.pmids.every((pmid: unknown) => typeof pmid === 'string' && /^\d{5,10}$/.test(pmid))) {
        throw new Error('Historical source-index integrity check failed')
      }
      setPreviousPmids(data.pmids)
      setHistoricalLoaded(true)
    } catch {
      setHistoricalError('Historical PMID index could not be loaded or verified. The latest source records remain available.')
    } finally {
      setHistoricalLoading(false)
    }
  }

  function changeView(value: 'verified' | 'previous') {
    setView(value)
    if (value === 'previous' && !historicalLoaded) void loadHistoricalIndex()
    setVisibleCount(PAGE_SIZE)
    setQuery('')
    setCategory('')
    setYear('')
    setSemanticConcept('')
  }

  function resetFilters() {
    setQuery('')
    setCategory('')
    setYear('')
    setSemanticConcept('')
    setVisibleCount(PAGE_SIZE)
  }

  function focusConcept(id: string) {
    setView('verified')
    setSemanticConcept(id)
    if (!loadedNetwork) void activateSemanticNetwork()
    setQuery('')
    setCategory('')
    setYear('')
    setVisibleCount(PAGE_SIZE)
  }

  function focusPaper(pmid: string) {
    setView('verified')
    setQuery(pmid)
    if (!loadedNetwork) void activateSemanticNetwork()
    setSemanticConcept('')
    setCategory('')
    setYear('')
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className='space-y-7'>
      <div className='space-y-3' aria-label='Semantic research discovery'>
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-900/10 bg-white px-4 py-3'>
          <div>
            <p className='text-xs font-bold uppercase tracking-wider text-brand-700'>Semantic research lab</p>
            <p className='mt-1 text-xs text-muted'>
              {loadedNetwork ? 'The source-grounded graph is active.' : 'An editorial map is ready. Detailed links load only when you explore them.'}
            </p>
          </div>
          {!loadedNetwork ? (
            <button type='button' onClick={() => void activateSemanticNetwork()} disabled={semanticLoading}
              aria-busy={semanticLoading}
              className='min-h-11 rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60'>
              {semanticLoading ? 'Loading research connections…' : 'Activate semantic lab ↗'}
            </button>
          ) : <span className='text-xs font-semibold text-brand-800'>500 source records connected</span>}
        </div>
        {semanticError ? <p role='alert' className='rounded-xl border border-amber-700/20 bg-amber-50 p-3 text-sm text-amber-900'>{semanticError}</p> : null}
        <SemanticResearchObservatory network={network} onFocusConcept={focusConcept} onFocusPaper={focusPaper} />
        {!loadedNetwork ? (
          <p className='text-xs leading-6 text-muted' role='status'>
            Preview counts are taken from the verified research batch. Activating the lab unlocks paper-level intersections,
            direct citation matches, explainable edges and multi-hop source witnesses.
          </p>
        ) : null}
      </div>
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
          <Link href='/learn/citation-explorer/' className='text-sm font-semibold text-brand-700 hover:underline'>Reviewed runtime evidence →</Link>
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
            Historical PMID index ({previousCount.toLocaleString()})
          </button>
        </div>
        <p className='mt-3 text-xs leading-6 text-muted'>
          {view === 'verified'
            ? 'These titles, identifiers, and journals were checked against PubMed. Scientific interpretation and evidence-grade assignment are separate editorial steps.'
            : 'Earlier unique PubMed identifiers are available for direct source lookup. Titles and topic labels are intentionally not invented for entries without this batch’s exact-source metadata.'}
        </p>

        {view === 'previous' && historicalLoading ? <p role='status' className='mt-4 text-sm text-muted'>Loading the historical source index on demand…</p> : null}
        {view === 'previous' && historicalError ? <div role='alert' className='mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-700/20 bg-amber-50 p-3 text-sm text-amber-900'>
          <span>{historicalError}</span>
          <button type='button' onClick={() => void loadHistoricalIndex()} className='rounded-full border border-amber-700/30 bg-white px-4 py-2 font-semibold'>Try again</button>
        </div> : null}
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
        {semanticConcept && view === 'verified' ? (
          <div className='mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-900/15 bg-brand-50 p-3 text-sm'>
            <span className='text-muted'>Active semantic lens:</span>
            <strong className='text-ink'>{network.concepts.find(c => c.id === semanticConcept)?.label || semanticConcept}</strong>
            <button type='button' onClick={() => { setSemanticConcept(''); setVisibleCount(PAGE_SIZE) }} className='ml-auto rounded-full border border-brand-900/20 bg-white px-3 py-2 text-xs font-semibold text-brand-700'>Remove lens ×</button>
          </div>
        ) : null}
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-900/10 pt-4'>
          <p className='text-sm text-muted' role='status' aria-live='polite'><strong className='text-ink'>{count.toLocaleString()}</strong> identifiers match</p>
          {(query || category || year || semanticConcept) ? <button type='button' onClick={resetFilters} className='min-h-10 rounded-full border border-brand-900/15 px-4 text-xs font-bold text-ink hover:bg-brand-50'>Clear filters</button> : null}
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
                {(network.entries[item.pmid]?.reviewedCitations.length || 0) > 0 ? (
                  <div className='mt-3 rounded-xl border border-brand-700/20 bg-brand-50 p-3'>
                    <p className='text-xs font-semibold text-brand-800'>Exact PMID also appears in the separately published Citation Explorer</p>
                    <div className='mt-2 flex flex-wrap gap-3 text-xs'>
                      {network.entries[item.pmid].reviewedCitations.map(citation => (
                        <Link key={citation.studyId} href={citation.href} className='font-semibold text-brand-700 hover:underline'>
                          View indexed citation ↗
                        </Link>
                      ))}
                    </div>
                    <p className='mt-2 text-xs leading-5 text-muted'>Identity match only. Review the linked evidence record for interpretation; this source register assigns no efficacy or safety grade.</p>
                  </div>
                ) : null}
                {network.entries[item.pmid] ? (
                  <div className='mt-3 space-y-3 border-t border-brand-900/10 pt-3'>
                    <div className='flex flex-wrap items-center gap-2 text-xs'>
                      <span className='font-semibold text-muted'>{network.entries[item.pmid].methodTag}</span>
                      {network.entries[item.pmid].mentions.slice(0, 5).map(m => (
                        <button key={m.id} type='button' onClick={() => focusConcept(m.id)}
                          title={m.basis === 'title' ? 'Exact controlled phrase in title' : 'Exact controlled phrase in abstract (exploratory)'}
                          className='rounded-full border border-brand-900/15 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 hover:border-brand-700'>
                          {m.label} · {m.basis}
                        </button>
                      ))}
                    </div>
                    {network.entries[item.pmid].profiles.length > 0 ? (
                      <div className='text-xs leading-6 text-muted'>
                        <strong className='text-ink'>Named in title · related published profiles: </strong>
                        {network.entries[item.pmid].profiles.slice(0, 3).map((p, i) => (
                          <span key={p.href}>{i ? ' · ' : ''}
                            <Link href={p.href} className='font-semibold text-brand-700 hover:underline'>{p.name} ↗</Link>
                          </span>
                        ))}
                        <p className='mt-1'>Name match only—not an evidence-grade link or clinical endorsement.</p>
                      </div>
                    ) : null}
                    {network.entries[item.pmid].related.length > 0 ? (
                      <details className='rounded-xl border border-brand-900/10 bg-brand-50/50 px-3 py-2 text-xs'>
                        <summary className='cursor-pointer font-semibold text-brand-800'>Explore {network.entries[item.pmid].related.length} explainable paper connections</summary>
                        <div className='mt-2 space-y-2'>
                          {network.entries[item.pmid].related.map(rel => (
                            <div key={rel.pmid} className='border-t border-brand-900/10 pt-2'>
                              <button type='button' onClick={() => focusPaper(rel.pmid)} className='font-bold text-brand-800 hover:underline'>PMID {rel.pmid} →</button>
                              <p className='mt-1 leading-5 text-muted'>{rel.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ) : null}
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
