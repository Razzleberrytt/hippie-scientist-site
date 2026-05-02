'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'

type LibraryItem = {
  slug: string
  title: string
  summary: string
  href: string
  typeLabel: string
  domain?: string
  isATier?: boolean
}

type LibraryBrowserProps = {
  eyebrow: string
  title: string
  description: string
  searchPlaceholder: string
  emptyLabel: string
  items: LibraryItem[]
}

type SortMode = 'featured' | 'a-z' | 'z-a'
type LetterFilter = 'all' | '#'
type ProfileStrength = 'strong' | 'partial' | 'thin'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const thinSummaryPatterns = [
  'profile coming soon',
  'profile summary coming soon',
  'coming soon',
]

const getFirstFilterChar = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return '#'

  const firstChar = trimmed.charAt(0).toUpperCase()
  return /[A-Z]/.test(firstChar) ? firstChar : '#'
}

const isThinProfile = (item: LibraryItem): boolean => {
  const summary = item.summary.trim().toLowerCase()
  return !summary || thinSummaryPatterns.some(pattern => summary.includes(pattern))
}

const getProfileStrength = (item: LibraryItem): ProfileStrength => {
  if (isThinProfile(item)) return 'thin'
  if (item.isATier || item.domain) return 'strong'
  return 'partial'
}

const getStrengthLabel = (strength: ProfileStrength): string => {
  if (strength === 'strong') return 'Research-ready'
  if (strength === 'partial') return 'Quick brief'
  return 'Stub'
}

const getCardCta = (strength: ProfileStrength): string => {
  if (strength === 'strong') return 'See benefits, evidence & risks →'
  if (strength === 'partial') return 'Read quick profile →'
  return 'Open draft profile →'
}

const getCardPreview = (item: LibraryItem): string => {
  if (isThinProfile(item)) {
    return item.typeLabel.toLowerCase().includes('compound')
      ? 'Draft compound entry. Prioritize researched profiles using the filters above.'
      : 'Draft herb entry. Prioritize researched profiles using the filters above.'
  }

  return item.summary.length > 190 ? `${item.summary.slice(0, 189).trimEnd()}…` : item.summary
}

const formatDomain = (domain: string): string =>
  domain
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const sortItems = (items: LibraryItem[], sortMode: SortMode): LibraryItem[] => {
  const alphaSorted = [...items].sort((a, b) => a.title.localeCompare(b.title))

  if (sortMode === 'z-a') return alphaSorted.reverse()
  if (sortMode === 'a-z') return alphaSorted

  return alphaSorted.sort((a, b) => {
    const strengthRank: Record<ProfileStrength, number> = { strong: 0, partial: 1, thin: 2 }
    const aStrength = strengthRank[getProfileStrength(a)]
    const bStrength = strengthRank[getProfileStrength(b)]

    if (aStrength !== bStrength) return aStrength - bStrength
    if (Boolean(a.isATier) !== Boolean(b.isATier)) return a.isATier ? -1 : 1
    return a.title.localeCompare(b.title)
  })
}

export default function LibraryBrowser({
  eyebrow,
  title,
  description,
  searchPlaceholder,
  emptyLabel,
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('featured')
  const [letterFilter, setLetterFilter] = useState<string | LetterFilter>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [profileFilter, setProfileFilter] = useState<'all' | 'ready' | 'drafts'>('all')
  const [aTierOnly, setATierOnly] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [query])

  const stats = useMemo(() => {
    const ready = items.filter(item => getProfileStrength(item) !== 'thin').length
    const aTier = items.filter(item => item.isATier).length
    const domains = new Set(items.map(item => item.domain).filter(Boolean)).size

    return { ready, aTier, drafts: Math.max(items.length - ready, 0), domains }
  }, [items])

  const availableLetters = useMemo(() => {
    const letters = new Set(items.map(item => getFirstFilterChar(item.title)))
    return {
      letters,
      hasSymbols: letters.has('#'),
    }
  }, [items])

  const filteredItems = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()

    const matchingItems = items.filter(item => {
      const strength = getProfileStrength(item)
      const matchesQuery = normalizedQuery
        ? `${item.title} ${item.summary} ${item.slug} ${item.domain ?? ''}`.toLowerCase().includes(normalizedQuery)
        : true

      const firstChar = getFirstFilterChar(item.title)
      const matchesLetter =
        letterFilter === 'all' ? true : firstChar === letterFilter
      const matchesDomain = domainFilter === 'all' ? true : item.domain === domainFilter
      const matchesATier = aTierOnly ? Boolean(item.isATier) : true
      const matchesProfileStrength =
        profileFilter === 'all'
          ? true
          : profileFilter === 'ready'
            ? strength !== 'thin'
            : strength === 'thin'

      return matchesQuery && matchesLetter && matchesDomain && matchesATier && matchesProfileStrength
    })

    return sortItems(matchingItems, sortMode)
  }, [aTierOnly, debouncedQuery, domainFilter, items, letterFilter, profileFilter, sortMode])

  const availableDomains = useMemo(() => {
    return Array.from(
      new Set(items.map(item => item.domain).filter((domain): domain is string => Boolean(domain)))
    ).sort((a, b) => a.localeCompare(b))
  }, [items])

  const featuredItems = useMemo(() => {
    return sortItems(items, 'featured')
      .filter(item => getProfileStrength(item) !== 'thin')
      .slice(0, 3)
  }, [items])

  const renderHighlightedText = (value: string) => {
    const highlightQuery = debouncedQuery.trim()
    if (!highlightQuery) return value

    const escaped = highlightQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matcher = new RegExp(`(${escaped})`, 'ig')
    const parts = value.split(matcher)

    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === highlightQuery.toLowerCase()
      if (!isMatch) return <Fragment key={`${part}-${index}`}>{part}</Fragment>

      return (
        <mark
          key={`${part}-${index}`}
          className='rounded bg-emerald-300/25 px-1 text-emerald-50'
        >
          {part}
        </mark>
      )
    })
  }

  const clearFilters = () => {
    setQuery('')
    setSortMode('featured')
    setLetterFilter('all')
    setDomainFilter('all')
    setProfileFilter('all')
    setATierOnly(false)
  }

  return (
    <div className='space-y-7'>
      <section className='relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-emerald-950/20 sm:p-8'>
        <div className='absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl' />
        <div className='relative'>
          <p className='text-xs font-black uppercase tracking-[0.26em] text-emerald-200/75'>
            {eyebrow}
          </p>

          <div className='mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end'>
            <div>
              <h1 className='text-4xl font-black tracking-tight text-white sm:text-6xl'>{title}</h1>
              <p className='mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base'>
                {description}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center backdrop-blur sm:min-w-80'>
              <div className='rounded-2xl bg-white/[0.055] px-3 py-3'>
                <div className='text-2xl font-black text-white'>{stats.ready}</div>
                <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45'>Ready</div>
              </div>
              <div className='rounded-2xl bg-amber-300/10 px-3 py-3'>
                <div className='text-2xl font-black text-amber-100'>{stats.aTier}</div>
                <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-100/55'>A-tier</div>
              </div>
              <div className='rounded-2xl bg-emerald-300/10 px-3 py-3'>
                <div className='text-2xl font-black text-emerald-100'>{stats.domains}</div>
                <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100/55'>Domains</div>
              </div>
            </div>
          </div>

          {featuredItems.length > 0 ? (
            <div className='mt-6 grid gap-3 md:grid-cols-3'>
              {featuredItems.map(item => (
                <Link
                  key={`featured-${item.slug}`}
                  href={item.href}
                  className='group rounded-3xl border border-white/10 bg-black/24 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-emerald-300/[0.055]'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='rounded-full bg-emerald-300/12 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-emerald-100'>Featured</span>
                    {item.domain ? <span className='text-xs font-bold text-white/45'>{formatDomain(item.domain)}</span> : null}
                  </div>
                  <h2 className='mt-3 text-lg font-black text-white group-hover:text-emerald-100'>{item.title}</h2>
                  <p className='mt-2 line-clamp-2 text-xs leading-5 text-white/58'>{getCardPreview(item)}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className='rounded-[1.75rem] border border-white/10 bg-black/30 p-4 backdrop-blur'>
        <div className='grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(10rem,auto))]'>
          <label className='block'>
            <span className='mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45'>Search</span>
            <input
              type='search'
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className='w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-300/45 focus:bg-white/[0.08]'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45'>Sort</span>
            <select
              value={sortMode}
              onChange={event => setSortMode(event.target.value as SortMode)}
              className='w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/45'
            >
              <option value='featured'>Best first</option>
              <option value='a-z'>A to Z</option>
              <option value='z-a'>Z to A</option>
            </select>
          </label>

          <label className='block'>
            <span className='mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45'>Domain</span>
            <select
              value={domainFilter}
              onChange={event => setDomainFilter(event.target.value)}
              className='w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/45'
            >
              <option value='all'>All domains</option>
              {availableDomains.map(domain => (
                <option key={domain} value={domain}>
                  {formatDomain(domain)}
                </option>
              ))}
            </select>
          </label>

          <label className='block'>
            <span className='mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45'>Quality</span>
            <select
              value={profileFilter}
              onChange={event => setProfileFilter(event.target.value as 'all' | 'ready' | 'drafts')}
              className='w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/45'
            >
              <option value='all'>All profiles</option>
              <option value='ready'>Ready profiles</option>
              <option value='drafts'>Draft stubs</option>
            </select>
          </label>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => setATierOnly(current => !current)}
            className={`rounded-full border px-3 py-2 text-xs font-black transition ${
              aTierOnly
                ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                : 'border-white/10 text-white/62 hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-100'
            }`}
          >
            A-tier only
          </button>

          <button
            type='button'
            onClick={() => setProfileFilter(profileFilter === 'ready' ? 'all' : 'ready')}
            className={`rounded-full border px-3 py-2 text-xs font-black transition ${
              profileFilter === 'ready'
                ? 'border-emerald-300/45 bg-emerald-300/15 text-emerald-100'
                : 'border-white/10 text-white/62 hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-emerald-100'
            }`}
          >
            Hide stubs
          </button>

          <span className='ml-auto text-xs font-semibold text-white/45'>
            Showing <span className='text-white'>{filteredItems.length}</span> of {items.length}
          </span>

          {(query.trim() || letterFilter !== 'all' || domainFilter !== 'all' || aTierOnly || sortMode !== 'featured' || profileFilter !== 'all') ? (
            <button
              type='button'
              onClick={clearFilters}
              className='rounded-full border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className='mt-5 flex gap-2 overflow-x-auto pb-1'>
          <button
            type='button'
            onClick={() => setLetterFilter('all')}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              letterFilter === 'all'
                ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                : 'border-white/10 text-white/58 hover:border-white/25 hover:bg-white/5 hover:text-white'
            }`}
          >
            All
          </button>

          {alphabet.map(letter => {
            const disabled = !availableLetters.letters.has(letter)

            return (
              <button
                key={letter}
                type='button'
                onClick={() => setLetterFilter(letter)}
                disabled={disabled}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  letterFilter === letter
                    ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                    : disabled
                      ? 'cursor-not-allowed border-white/5 text-white/18'
                      : 'border-white/10 text-white/58 hover:border-white/25 hover:bg-white/5 hover:text-white'
                }`}
              >
                {letter}
              </button>
            )
          })}

          {availableLetters.hasSymbols ? (
            <button
              type='button'
              onClick={() => setLetterFilter('#')}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                letterFilter === '#'
                  ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                  : 'border-white/10 text-white/58 hover:border-white/25 hover:bg-white/5 hover:text-white'
              }`}
            >
              #
            </button>
          ) : null}
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map(item => {
            const strength = getProfileStrength(item)
            const isThin = strength === 'thin'

            return (
              <Link
                key={item.slug}
                href={item.href}
                className={`group relative flex h-full min-h-44 overflow-hidden rounded-[1.7rem] border p-4 transition hover:-translate-y-0.5 sm:p-5 ${
                  strength === 'strong'
                    ? 'border-emerald-300/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] shadow-lg shadow-emerald-950/10 hover:border-emerald-300/45'
                    : strength === 'partial'
                      ? 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]'
                      : 'border-white/7 bg-white/[0.022] opacity-75 hover:border-white/16 hover:opacity-95'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${strength === 'strong' ? 'bg-emerald-300/60' : strength === 'partial' ? 'bg-white/15' : 'bg-white/5'}`} />

                <div className='flex min-w-0 flex-1 flex-col'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] ${
                      isThin
                        ? 'border-white/8 text-white/35'
                        : 'border-white/10 bg-black/18 text-white/58'
                    }`}>
                      {item.typeLabel}
                    </span>

                    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] ${
                      strength === 'strong'
                        ? 'bg-emerald-300/14 text-emerald-100'
                        : strength === 'partial'
                          ? 'bg-white/7 text-white/48'
                          : 'bg-white/5 text-white/32'
                    }`}>
                      {getStrengthLabel(strength)}
                    </span>

                    {item.isATier ? (
                      <span className='rounded-full border border-amber-300/25 bg-amber-300/12 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-amber-100'>A-tier</span>
                    ) : null}
                  </div>

                  <h2 className={`mt-4 text-xl font-black tracking-tight sm:text-2xl ${isThin ? 'text-white/72' : 'text-white group-hover:text-emerald-100'}`}>
                    {renderHighlightedText(item.title)}
                  </h2>

                  <p className={`mt-3 flex-1 text-sm leading-6 ${isThin ? 'text-white/42' : 'text-white/68'}`}>
                    {renderHighlightedText(getCardPreview(item))}
                  </p>

                  <div className='mt-4 flex flex-wrap items-center gap-2'>
                    {item.domain ? (
                      <span className='rounded-full border border-emerald-300/18 bg-emerald-300/9 px-2.5 py-1 text-xs font-bold text-emerald-100/80'>
                        {formatDomain(item.domain)}
                      </span>
                    ) : null}
                    <span className={`inline-flex text-sm font-black transition group-hover:translate-x-1 ${isThin ? 'text-white/42' : 'text-emerald-200'}`}>
                      {getCardCta(strength)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      ) : (
        <section className='rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-8 text-center'>
          <h2 className='text-xl font-black text-white'>No matches found</h2>
          <p className='mt-3 text-sm leading-6 text-white/65'>{emptyLabel}</p>
          <button
            type='button'
            onClick={clearFilters}
            className='mt-5 rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200'
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  )
}
