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
}

type LibraryBrowserProps = {
  eyebrow?: string
  title: string
  description?: string
  searchPlaceholder?: string
  emptyLabel?: string
  items: BrowserItem[]
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const getPreview = (value: unknown): string => {
  const text = normalizeText(value)
  if (!text) return 'No profile yet — tap to explore related data.'
  return text.length > 160 ? `${text.slice(0, 159).trimEnd()}…` : text
}

const formatChip = (value: string): string =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name or compound',
  emptyLabel = 'No matching profiles found.',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200)
    return () => window.clearTimeout(timer)
  }, [query])

  const sortedItems = useMemo(
    () =>
      [...items]
        .filter(item => normalizeText(item.slug) && normalizeText(item.title))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [items],
  )

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()

    return sortedItems.filter(item => {
      const title = normalizeText(item.title)
      const searchable = `${item.title} ${item.slug} ${item.summary ?? ''}`.toLowerCase()
      return (!letter || title.toUpperCase().startsWith(letter)) && (!q || searchable.includes(q))
    })
  }, [sortedItems, letter, debouncedQuery])

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

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {filteredItems.map(item => (
          <Link
            key={item.slug}
            href={item.href}
            className='group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md'
          >
            <h2 className='text-lg font-black text-slate-950 group-hover:text-emerald-700'>
              {item.title}
            </h2>

            <p className='mt-2 text-sm text-slate-600'>
              {getPreview(item.summary)}
            </p>

            <span className='mt-3 inline-block text-sm font-bold text-emerald-700'>
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
