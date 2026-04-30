'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export default function LibraryBrowser({ eyebrow, title, description, searchPlaceholder, emptyLabel, items }: any) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState('')

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item: any) => {
      const matchesLetter = !letter || item.title.toUpperCase().startsWith(letter)
      const haystack = [item.title, item.slug, item.summary, item.domain, item.typeLabel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesLetter && matchesQuery
    })
  }, [items, letter, query])

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder={searchPlaceholder} />
      {filteredItems.map((item: any) => (
        <Link key={item.slug} href={item.href}>{item.title}</Link>
      ))}
    </div>
  )
}
