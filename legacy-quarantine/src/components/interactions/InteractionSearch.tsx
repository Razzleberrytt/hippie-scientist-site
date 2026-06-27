import { useMemo, useState } from 'react'

export type InteractionCatalogItem = {
  id: string
  name: string
  kind: 'herb' | 'compound'
  category?: string
  effects: string[]
}

type InteractionSearchProps = {
  items: InteractionCatalogItem[]
  selectedIds: string[]
  onAddItem: (item: InteractionCatalogItem) => void
  maxSelection?: number
}

function scoreMatch(item: InteractionCatalogItem, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0

  const name = item.name.toLowerCase()
  const category = (item.category || '').toLowerCase()
  const effects = item.effects.join(' ').toLowerCase()

  let score = 0
  if (name === q) score += 120
  if (name.startsWith(q)) score += 80
  if (name.includes(q)) score += 50
  if (category.includes(q)) score += 25
  if (effects.includes(q)) score += 15

  return score
}

export default function InteractionSearch({
  items,
  selectedIds,
  onAddItem,
  maxSelection = 3,
}: InteractionSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    return items
      .map(item => ({ item, score: scoreMatch(item, query) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(entry => entry.item)
  }, [items, query])

  const limitReached = selectedIds.length >= maxSelection

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <label className='text-xs uppercase tracking-[0.2em] text-white/65'>Search herbs</label>
        <p className='text-xs text-white/60'>
          {selectedIds.length}/{maxSelection} selected
        </p>
      </div>
      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder='Search herbs by name, class, or effects'
        className='w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20'
      />
      {limitReached && (
        <p className='rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100'>
          You can compare up to {maxSelection} items at once. Remove one to add another.
        </p>
      )}

      {query.trim() && (
        <div className='rounded-2xl border border-white/10 bg-black/35 p-2'>
          {filtered.length === 0 ? (
            <p className='px-3 py-2 text-sm text-white/70'>No matching herbs found.</p>
          ) : (
            <ul className='space-y-1'>
              {filtered.map(item => {
                const isSelected = selectedIds.includes(item.id)
                const disabled = isSelected || limitReached

                return (
                  <li key={item.id}>
                    <button
                      type='button'
                      disabled={disabled}
                      onClick={() => onAddItem(item)}
                      className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white/90 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-55'
                    >
                      <span>
                        <span className='font-medium'>{item.name}</span>
                        <span className='ml-2 text-xs uppercase tracking-wide text-white/55'>
                          {item.kind}
                        </span>
                      </span>
                      <span className='text-xs text-white/60'>
                        {isSelected ? 'Selected' : limitReached ? 'Limit reached' : 'Add'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
