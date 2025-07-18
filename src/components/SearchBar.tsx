import React from 'react'
import type Fuse from 'fuse.js'
import type { Herb } from '../types'

interface Props {
  query: string
  setQuery: (q: string) => void
  fuse: Fuse<Herb>
}

export default function SearchBar({ query, setQuery, fuse }: Props) {
  const [suggestions, setSuggestions] = React.useState<ReturnType<typeof fuse.search>>([])

  React.useEffect(() => {
    const q = query.trim()
    if (q) {
      setSuggestions(
        fuse.search(q, { limit: 5, isCaseSensitive: false, ignoreLocation: true })
      )
    } else {
      setSuggestions([])
    }
  }, [query, fuse])

  const highlight = (text: string) => {
    if (!query) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'ig')
    return text.replace(regex, '<span class="font-bold">$1</span>')
  }

  const labelFor = (s: ReturnType<typeof fuse.search>[0]) => {
    const text = [s.item.name, ...(s.item as any).altNames || []].join(', ')
    return highlight(text)
  }

  return (
    <div className='relative w-full'>
      <input
        type='text'
        placeholder='Search herbs...'
        aria-label='Search herbs'
        tabIndex={0}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none'
      />
      {suggestions.length > 0 && (
        <ul className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black/80 p-2 text-sm text-sand backdrop-blur-md'>
          {suggestions.map(s => (
            <li key={s.item.id}>
              <button
                type='button'
                tabIndex={0}
                aria-label={`Select ${s.item.name}`}
                className='w-full text-left rounded px-2 py-1 hover:bg-white/10'
                onClick={() => setQuery(s.item.name)}
                dangerouslySetInnerHTML={{ __html: labelFor(s) }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
