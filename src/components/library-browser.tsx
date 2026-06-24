'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { safeArray, safeIncludes, safeJoin, safeLower, safeScore, safeTrim } from '@/lib/search-safe'

type BrowserItem = {
  slug: string
  title: string
  summary?: string
  preview?: string
  mechanism?: string
  effects?: string | string[]
  safety?: string
  dosage?: string
  evidence?: string
  onset?: string
  timeToEffect?: string
  duration?: string
  confidence?: string
  bestFor?: string
  avoidIf?: string
  profile_status?: string
  summary_quality?: string
  evidenceScore?: number
  evidenceTier?: string
  href: string
  typeLabel?: string
  domain?: string
  isATier?: boolean
}

type LibraryBrowserProps = {
  eyebrow?: string
  title: string
  description?: string
  searchPlaceholder?: string
  emptyLabel?: string
  ctaLabel?: string
  items: BrowserItem[]
}

const normalizeText = (value: unknown): string => safeArray(value).map(safeTrim).filter(Boolean).join(', ')

const short = (value: unknown, max = 40): string => {
  const text = normalizeText(value)
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

const lower = (value: unknown) => safeLower(normalizeText(value))

const decisionScore = (item: BrowserItem): number => {
  let score = 0
  score += safeScore(item.evidenceScore) * 5
  if (item.isATier) score += 25
  if (safeIncludes(item.confidence, 'high')) score += 18
  if (safeIncludes(item.summary_quality, 'strong')) score += 15
  if (safeIncludes(item.profile_status, 'complete')) score += 12
  if (safeTrim(item.bestFor) || safeTrim(item.domain)) score += 8
  if (safeTrim(item.safety) && !/^review$/i.test(normalizeText(item.safety))) score += 6
  if (safeTrim(item.onset) || safeTrim(item.timeToEffect)) score += 4
  if (safeTrim(item.dosage)) score += 4
  return safeScore(score)
}

const getPreview = (item: BrowserItem): string => {
  const sources = [item.preview, item.summary, item.mechanism, item.effects, item.evidence, item.safety, item.dosage]
  const text = sources.map(normalizeText).find(Boolean) || ''

  if (!text) return 'Open profile for evidence, dose, safety, and related compound context.'
  return text.length > 160 ? `${text.slice(0, 159).trimEnd()}…` : text
}

const getDecisionLabel = (item: BrowserItem): string => {
  if (safeTrim(item.bestFor)) return `Best for: ${short(item.bestFor, 34)}`
  if (safeTrim(item.domain)) return `Use case: ${short(item.domain, 34)}`
  if (safeTrim(item.effects)) return `Effect: ${short(item.effects, 34)}`
  return ''
}

const getMetaRows = (item: BrowserItem) => [
  getDecisionLabel(item),
  safeTrim(item.timeToEffect) || safeTrim(item.onset) ? `Onset: ${short(item.timeToEffect || item.onset, 24)}` : '',
  safeTrim(item.safety) ? `Safety: ${short(item.safety, 30)}` : '',
  safeTrim(item.confidence) ? `Confidence: ${short(item.confidence, 24)}` : '',
  safeTrim(item.evidence) ? `Evidence: ${short(item.evidence, 24)}` : '',
].filter(Boolean)

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name or compound',
  emptyLabel = 'No matching profiles found.',
  ctaLabel = 'View profile →',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200)
    return () => window.clearTimeout(timer)
  }, [query])

  const sortedItems = useMemo(
    () => safeArray<BrowserItem>(items)
      .filter(item => normalizeText(item?.slug) && normalizeText(item?.title) && normalizeText(item?.href))
      .sort((a, b) => {
        const scoreDelta = decisionScore(b) - decisionScore(a)
        if (scoreDelta !== 0) return scoreDelta
        return lower(a?.title).localeCompare(lower(b?.title))
      }),
    [items],
  )

  const filteredItems = useMemo(() => {
    const q = safeLower(debouncedQuery)

    return sortedItems.filter(item => {
      const searchable = safeJoin([
        item.title,
        item.slug,
        item.summary,
        item.preview,
        item.mechanism,
        item.effects,
        item.safety,
        item.evidence,
        item.domain,
        item.bestFor,
        item.avoidIf,
        item.onset,
        item.timeToEffect,
        item.confidence,
      ])

      return !q || safeIncludes(searchable, q)
    })
  }, [sortedItems, debouncedQuery])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-5 px-3 py-4'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5'>
        <p className='text-xs font-black uppercase tracking-[0.22em] text-emerald-700'>{eyebrow}</p>
        <h1 className='mt-2 text-3xl font-black text-slate-950 sm:text-5xl'>{title}</h1>
        {description ? <p className='mt-2 text-sm text-slate-600'>{description}</p> : null}
      </section>

      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        className='w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
      />

      {filteredItems.length > 0 ? (
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {filteredItems.map((item, index) => {
            const metaRows = getMetaRows(item)
            const score = decisionScore(item)

            return (
              <Link
                key={item.slug}
                href={item.href}
                className='group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition motion-safe:hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
              >
                <div className='flex flex-wrap items-center gap-2'>
                  {index < 3 && score >= 40 ? <span className='rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white'>Top match</span> : null}
                  {item.typeLabel ? <span className='rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600'>{item.typeLabel}</span> : null}
                  {item.isATier ? <span className='rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-800'>A-tier</span> : null}
                </div>

                <h2 className='mt-3 text-lg font-black text-slate-950'>
                  {item.title}
                </h2>

                {metaRows.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {metaRows.slice(0, 3).map(row => (
                      <span key={row} className='rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200'>
                        {row}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className='mt-3 line-clamp-3 text-sm leading-6 text-slate-600'>
                  {getPreview(item)}
                </p>

                {item.avoidIf ? (
                  <p className='mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900'>
                    <span className='font-black'>Avoid if:</span> {short(item.avoidIf, 90)}
                  </p>
                ) : null}

                <span className='mt-3 inline-block text-sm font-bold text-emerald-700 transition group-hover:translate-x-0.5'>
                  {ctaLabel}
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <section className='rounded-2xl border border-slate-200 bg-white p-8 text-center'>
          <p className='text-slate-600'>{emptyLabel}</p>
        </section>
      )}
    </div>
  )
}
