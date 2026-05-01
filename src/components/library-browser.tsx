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

export default function LibraryBrowser({
  title,
  searchPlaceholder = 'Search by name, slug, or summary',
  items,
}: LibraryBrowserProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [letter, setLetter] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const sortedItems = useMemo(() => [...items].filter(i => normalizeText(i.slug) && normalizeText(i.title)), [items])

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return sortedItems.filter(item => {
      const t = normalizeText(item.title)
      return (!letter || t.toUpperCase().startsWith(letter)) && (!q || `${item.title} ${item.slug} ${item.summary}`.toLowerCase().includes(q))
    })
  }, [sortedItems, letter, debouncedQuery])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-3 py-4'>
      <h1 className='text-3xl font-bold text-white'>{title}</h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className='w-full mb-4 px-5 py-4 rounded-2xl'
      />

      <div className='flex gap-4 overflow-x-auto'>
        <button onClick={() => setLetter('')}>All</button>
        {LETTERS.map(l => (
          <button key={l} onClick={() => setLetter(current => current === l ? '' : l)}>{l}</button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className='grid gap-6'>
          {filteredItems.map(item => (
            <Link key={item.slug} href={item.href} className='rounded-2xl border border-white/10 p-4 text-white'>
              {item.title}
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border border-white/10 p-6 text-center text-white/70'>
          No data available yet.
        </div>
      )}
    </div>
  )
}
