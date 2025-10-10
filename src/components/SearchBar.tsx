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
    <div className="sticky top-[3.5rem] z-30 bg-[rgb(var(--bg))/0.9] backdrop-blur-sm border-b border-white/10">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className='relative'>
          <input
            type='search'
            placeholder='Search herbs, compounds, effects...'
            aria-label='Search herbs'
            tabIndex={0}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[color:color-mix(in_oklab,rgb(var(--fg))_14%,transparent)] bg-[color:color-mix(in_oklab,rgb(var(--fg))_10%,transparent)] px-4 py-2 text-[rgb(var(--fg))] placeholder:text-[color:color-mix(in_oklab,rgb(var(--fg))_55%,rgb(var(--bg)))] focus:ring-2 focus:ring-[rgb(var(--accent))]/60 outline-none backdrop-blur"
          />
          {suggestions.length > 0 && (
            <ul className='absolute left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl border border-white/10 bg-[rgb(var(--card))]/95 p-2 text-sm text-[rgb(var(--fg))] shadow-lg backdrop-blur'>
              {suggestions.map(s => (
                <li key={s.item.id}>
                  <button
                    type='button'
                    tabIndex={0}
                    aria-label={`Select ${s.item.name}`}
                    className='w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10'
                    onClick={() => setQuery(s.item.name)}
                    dangerouslySetInnerHTML={{ __html: labelFor(s) }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
