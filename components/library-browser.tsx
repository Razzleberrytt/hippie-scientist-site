'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  href: string
  typeLabel?: string
  domain?: string
  isATier?: boolean
  meta?: string[]
}

type LibraryBrowserProps = {
  eyebrow?: string
  title: string
  description?: string
  searchPlaceholder?: string
  emptyLabel?: string
  items: BrowserItem[]
}

type QualityFilter = 'ready' | 'all' | 'drafts'
type SortMode = 'best' | 'a-z' | 'z-a'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const isDraftProfile = (item: BrowserItem): boolean => {
  const summary = normalizeText(item.summary).toLowerCase()
  return !summary || summary.includes('profile coming soon') || summary.includes('coming soon') || summary.length < 24
}

const getPreview = (item: BrowserItem): string => {
  const text = normalizeText(item.summary)
  if (isDraftProfile(item)) return 'Needs a clean public summary, but the profile may still include useful searchable metadata.'
  return text.length > 150 ? `${text.slice(0, 149).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split(/[-_,]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1))
    .join(' ')

const getBestFor = (item: BrowserItem): string => {
  const meta = item.meta ?? []
  const bestFor = meta.find(value => value.toLowerCase().startsWith('best for:'))
  if (bestFor) return bestFor.replace(/^best for:\s*/i, '').trim()
  if (item.domain) return formatChip(item.domain)
  return ''
}

const getEvidenceStrength = (item: BrowserItem): number => {
  const text = `${item.summary ?? ''} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
  if (item.isATier || /strong|high|tier 1|rct|meta/.test(text)) return 5
  if (/moderate|tier 2|human/.test(text)) return 4
  if (/limited|low|tier 3/.test(text)) return 2
  return 3
}

const getConversionBadge = (item: BrowserItem): string => {
  const text = `${item.title} ${item.slug} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
  if (item.isATier) return 'Top evidence pick'
  if (/sleep|stress|focus|fat loss|blood pressure|gut|joint|testosterone/.test(text)) return 'Goal-ready'
  if (/dose|onset|duration|best for/.test(text)) return 'Decision-ready'
  return 'Research profile'
}

const getBenefitSignals = (item: BrowserItem): string[] => {
  const directMeta = (item.meta ?? [])
    .map(value => value.replace(/^(best for|domain|effect|category):\s*/i, '').trim())
    .filter(value => value && !/^(needs summary|a-tier)$/i.test(value))

  const summarySignals = normalizeText(item.summary)
    .split(/[.;]/)
    .map(value => value.trim())
    .filter(value => /support|help|improve|reduce|promote|benefit|sleep|stress|focus|energy|inflammation|blood pressure|gut|joint|testosterone/i.test(value))

  return Array.from(new Set([...directMeta, ...summarySignals]))
    .filter(value => value.length > 3)
    .slice(0, 3)
}

const qualityRank = (item: BrowserItem): number => {
  if (item.isATier) return 0
  if (!isDraftProfile(item)) return 1
  return 2
}

const cardAccent = (item: BrowserItem): string => {
  if (item.isATier) return 'from-amber-300/18 via-white/[0.045] to-white/[0.02] border-amber-200/25'
  if (isDraftProfile(item)) return 'from-slate-300/8 via-white/[0.025] to-white/[0.015] border-white/10'
  return 'from-emerald-300/14 via-white/[0.045] to-white/[0.02] border-emerald-200/18'
}

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name, slug, summary, or effect',
  emptyLabel = 'No matching profiles found. Try a different search or clear the filters.',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('best')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 160)
    return () => window.clearTimeout(timer)
  }, [query])

  const cleanItems = useMemo(
    () => items.filter(item => normalizeText(item.slug) && normalizeText(item.title)),
    [items],
  )

  const stats = useMemo(() => {
    const ready = cleanItems.filter(item => !isDraftProfile(item)).length
    const aTier = cleanItems.filter(item => item.isATier).length
    return { total: cleanItems.length, ready, drafts: cleanItems.length - ready, aTier }
  }, [cleanItems])

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    const filtered = cleanItems.filter(item => {
      const titleText = normalizeText(item.title)
      const searchable = `${item.title} ${item.slug} ${item.summary ?? ''} ${item.domain ?? ''} ${(item.meta ?? []).join(' ')}`.toLowerCase()
      const draft = isDraftProfile(item)
      const matchesQuality = qualityFilter === 'all' ? true : qualityFilter === 'ready' ? !draft : draft

      return (!letter || titleText.toUpperCase().startsWith(letter)) && (!q || searchable.includes(q)) && matchesQuality
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'a-z') return a.title.localeCompare(b.title)
      if (sortMode === 'z-a') return b.title.localeCompare(a.title)
      return qualityRank(a) - qualityRank(b) || getEvidenceStrength(b) - getEvidenceStrength(a) || a.title.localeCompare(b.title)
    })
  }, [cleanItems, debouncedQuery, letter, qualityFilter, sortMode])

  const resetFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setLetter('')
    setQualityFilter('all')
    setSortMode('best')
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 py-2'>
      <section className='relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.17),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl' />
        <div className='relative'>
          <p className='text-xs font-black uppercase tracking-[0.24em] text-emerald-100/70'>{eyebrow}</p>
          <h1 className='mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl'>{title}</h1>
          {description ? <p className='mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg'>{description}</p> : null}
          <div className='mt-5 flex flex-wrap gap-2 text-xs font-black text-white/60'>
            <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1.5'><span className='text-white'>{stats.total}</span> profiles</span>
            <span className='rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-100'><span className='text-white'>{stats.ready}</span> useful summaries</span>
            {stats.aTier > 0 ? <span className='rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-1.5 text-amber-100'>{stats.aTier} A-tier</span> : null}
          </div>
        </div>
      </section>

      <section className='rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10'>
        <div className='grid gap-3 md:grid-cols-[1fr_auto_auto]'>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className='w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-emerald-200/55 focus:bg-black/35'
          />
          <select value={qualityFilter} onChange={event => setQualityFilter(event.target.value as QualityFilter)} className='rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white'>
            <option value='all'>All profiles</option>
            <option value='ready'>Useful only</option>
            <option value='drafts'>Needs summary</option>
          </select>
          <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)} className='rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-bold text-white'>
            <option value='best'>Best first</option>
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
          </select>
        </div>

        <div className='mt-4 flex gap-1.5 overflow-x-auto pb-1'>
          <button type='button' onClick={() => setLetter('')} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black transition ${!letter ? 'bg-emerald-200 text-slate-950' : 'border border-white/10 bg-black/20 text-white/55 hover:text-white'}`}>All</button>
          {LETTERS.map(currentLetter => (
            <button key={currentLetter} type='button' onClick={() => setLetter(activeLetter => activeLetter === currentLetter ? '' : currentLetter)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black transition ${letter === currentLetter ? 'bg-emerald-200 text-slate-950' : 'border border-white/10 bg-black/20 text-white/55 hover:text-white'}`}>
              {currentLetter}
            </button>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between gap-3 text-xs text-white/45'>
          <span>Showing <strong className='text-white'>{filteredItems.length}</strong> of {stats.total}</span>
          <button type='button' onClick={resetFilters} className='rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-black text-white/60 hover:text-white'>Reset</button>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => {
            const draft = isDraftProfile(item)
            const meta = (item.meta ?? []).filter(Boolean).slice(0, 3)
            const bestFor = getBestFor(item)
            const evidenceStrength = getEvidenceStrength(item)
            const benefitSignals = getBenefitSignals(item)

            return (
              <Link key={item.slug} href={item.href} className={`group relative flex min-h-[245px] flex-col overflow-hidden rounded-[1.6rem] border bg-gradient-to-br p-5 text-white shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 ${cardAccent(item)}`}>
                <div className='pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/8 blur-2xl transition group-hover:bg-emerald-300/12' />
                <div className='relative flex flex-wrap items-center gap-2'>
                  <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.68rem] font-black text-emerald-100'>
                    {getConversionBadge(item)}
                  </span>
                  <span className='rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/50'>{item.typeLabel || 'Profile'}</span>
                  {item.isATier ? <span className='rounded-full border border-amber-200/25 bg-amber-300/12 px-2.5 py-1 text-[0.68rem] font-black text-amber-100'>A-tier</span> : null}
                  {draft ? <span className='rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.68rem] font-black text-white/35'>Needs summary</span> : null}
                </div>

                <div className='relative mt-4 flex-1'>
                  <h2 className='text-xl font-black leading-tight tracking-tight text-white group-hover:text-emerald-100'>{item.title}</h2>
                  {item.domain ? <p className='mt-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100/60'>{formatChip(item.domain)}</p> : null}
                  {bestFor ? (
                    <p className='mt-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-100'>
                      Best for: {bestFor}
                    </p>
                  ) : null}
                  <p className='mt-3 line-clamp-4 text-sm leading-6 text-white/66'>{getPreview(item)}</p>
                </div>

                {benefitSignals.length ? (
                  <div className='relative mt-4 rounded-2xl border border-white/10 bg-black/18 p-3'>
                    <p className='text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/35'>Fast scan</p>
                    <ul className='mt-2 space-y-1.5'>
                      {benefitSignals.map(value => (
                        <li key={value} className='flex gap-2 text-xs font-semibold leading-5 text-white/62'>
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80' />
                          <span className='line-clamp-2'>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {meta.length ? (
                  <div className='relative mt-4 flex flex-wrap gap-2'>
                    {meta.map(value => (
                      <span key={value} className='rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.72rem] font-semibold text-white/52'>{value}</span>
                    ))}
                  </div>
                ) : null}

                <div className='relative mt-4'>
                  <div className='flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/40'>
                    <span>Evidence signal</span>
                    <span>{evidenceStrength}/5</span>
                  </div>
                  <div className='mt-2 grid grid-cols-5 gap-1'>
                    {[1, 2, 3, 4, 5].map(score => (
                      <span
                        key={score}
                        className={`h-1.5 rounded-full ${
                          score <= evidenceStrength
                            ? 'bg-emerald-300/80'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className='relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4'>
                  <span className='text-xs font-semibold text-white/45'>Check benefits, safety, and forms</span>
                  <span className='text-sm font-black text-emerald-200 transition group-hover:translate-x-1'>View →</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-white/65'>
          <p>{emptyLabel}</p>
          <button type='button' onClick={resetFilters} className='mt-4 premium-button'>Clear filters</button>
        </div>
      )}
    </div>
  )
}
