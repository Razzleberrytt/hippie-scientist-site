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

const truncate = (value: string | undefined, maxLength: number): string => {
  const text = normalizeText(value)
  if (!text) return 'Profile summary coming soon.'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

const titleInitial = (title: string): string => {
  const first = title.trim().charAt(0).toUpperCase()
  return /[A-Z0-9]/.test(first) ? first : '•'
}

const fallbackTag = (item: BrowserItem): string => {
  if (item.domain) return item.domain
  return item.typeLabel?.replace(' profile', '') || 'Profile'
}

export default function LibraryBrowser({
  eyebrow = 'Library',
  title,
  description,
  searchPlaceholder = 'Search by name, slug, or summary',
  emptyLabel = 'No herbs found',
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
      return (!letter || t.startsWith(letter)) && (!q || `${item.title} ${item.slug} ${item.summary}`.toLowerCase().includes(q))
    })
  }, [sortedItems, letter, debouncedQuery])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-3 py-4'>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className='w-full mb-4 px-5 py-4 rounded-2xl'
      />

      <div className='flex gap-4 overflow-x-auto'>
        <button onClick={() => setLetter('')}>All</button>
        {LETTERS.map(l => (
          <button key={l} onClick={() => setLetter(l)}>{l}</button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className='grid gap-6'>
          {filteredItems.map(item => (
            <Link key={item.slug} href={item.href}>{item.title}</Link>
          ))}
        </div>
      ) : (
        <p>No herbs found</p>
      )}

    </div>
  )
}
