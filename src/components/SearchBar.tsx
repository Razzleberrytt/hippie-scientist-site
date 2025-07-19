import React from 'react'
import type Fuse from 'fuse.js'

interface Props {
  query: string
  setQuery: (q: string) => void
  fuse: Fuse<any>
}

export default function SearchBar({ query, setQuery, fuse }: Props) {
  const [suggestions, setSuggestions] = React.useState<ReturnType<typeof fuse.search>>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setLoading(true)
    const q = query.trim()
    const handle = setTimeout(() => {
      if (q) {
        setSuggestions(
          fuse.search(q, { limit: 5, isCaseSensitive: false, ignoreLocation: true })
        )
      } else {
        setSuggestions([])
      }
      setLoading(false)
    }, 200)
    return () => clearTimeout(handle)
  }, [query, fuse])

  const highlight = (text: string) => {
    if (!query) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'ig')
    return text.replace(
      regex,
      '<mark class="rounded bg-yellow-500/40 px-1">$1</mark>'
    )
  }

  return (
    <div className='relative w-full'>
      <input
        type='text'
        placeholder='Search herbs...'
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none'
      />
      {loading && (
        <div className='absolute z-10 mt-1 w-full rounded-md bg-black/80 p-2 text-center text-sm text-sand backdrop-blur-md'>
          Searching...
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <ul className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black/80 p-2 text-sm text-sand backdrop-blur-md'>
          {suggestions.map(s => (
            <li key={s.item.id}>
              <button
                type='button'
                className='w-full rounded px-2 py-1 text-left hover:bg-white/10'
                onClick={() => setQuery(s.item.name)}
                dangerouslySetInnerHTML={{ __html: highlight(s.item.name) }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
