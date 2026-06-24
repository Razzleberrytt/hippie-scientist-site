'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

interface BotanicalItem {
  slug: string
  name: string
  displayName?: string
  description?: string
  mechanism?: string
  mechanisms?: string[]
  effects?: string[] | string
  safety?: string
  evidence?: string
  [key: string]: any
}

interface StackBuilderClientProps {
  herbs: any[]
  compounds: any[]
}

export default function StackBuilderClient({ herbs, compounds }: StackBuilderClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<BotanicalItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Merge datasets and tag them by type
  const allItems = useMemo(() => [
    ...herbs.map(item => ({ ...item, type: 'herb' as const })),
    ...compounds.map(item => ({ ...item, type: 'compound' as const })),
  ], [herbs, compounds])

  // Filter items by query
  const filteredItems = searchQuery
    ? allItems.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSlug = item.slug.toLowerCase().includes(searchQuery.toLowerCase())
        const notSelected = !selectedItems.some(selected => selected.slug === item.slug)
        return (matchesName || matchesSlug) && notSelected
      }).slice(0, 8)
    : []

  // Load stack from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('builder-stack')
      if (saved) {
        const parsedSlugs = JSON.parse(saved) as string[]
        const loaded = parsedSlugs
          .map(slug => allItems.find(item => item.slug === slug))
          .filter((item): item is typeof allItems[number] => !!item)
        setSelectedItems(loaded)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load stack:', e)
    }
  }, [allItems])

  // Save stack to localStorage
  const saveStack = (items: BotanicalItem[]) => {
    try {
      const slugs = items.map(item => item.slug)
      localStorage.setItem('builder-stack', JSON.stringify(slugs))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save stack:', e)
    }
  }

  const handleAddItem = (item: BotanicalItem) => {
    if (!selectedItems.some(i => i.slug === item.slug)) {
      const updated = [...selectedItems, item]
      setSelectedItems(updated)
      saveStack(updated)
    }
    setSearchQuery('')
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const handleRemoveItem = (slug: string) => {
    const updated = selectedItems.filter(item => item.slug !== slug)
    setSelectedItems(updated)
    saveStack(updated)
  }

  const handleClearStack = () => {
    setSelectedItems([])
    saveStack([])
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredItems[focusedIndex]) {
        handleAddItem(filteredItems[focusedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Parse mechanisms to find pathways and actions
  const analyzeStack = () => {
    const pathwayMatches: Record<string, string[]> = {}
    const mechanismTextList: string[] = []
    let safetyCautionCount = 0
    const safetyWarnings: string[] = []

    selectedItems.forEach(item => {
      const mechStr = [
        item.mechanism,
        ...(Array.isArray(item.mechanisms) ? item.mechanisms : []),
      ].filter(Boolean).join('; ')
      mechanismTextList.push(mechStr)

      // safety
      const safetyStr = (item.safety || '').toLowerCase()
      if (safetyStr.includes('caution') || safetyStr.includes('warning') || safetyStr.includes('avoid')) {
        safetyCautionCount++
        safetyWarnings.push(`${item.name}: ${item.safety}`)
      }

      // pathways extraction
      const lower = mechStr.toLowerCase()
      if (lower.includes('gaba')) {
        pathwayMatches['GABA (inhibitory/calm)'] = [...(pathwayMatches['GABA (inhibitory/calm)'] || []), item.name]
      }
      if (lower.includes('dopamine') || lower.includes('dopaminergic')) {
        pathwayMatches['Dopamine (motivation/focus)'] = [...(pathwayMatches['Dopamine (motivation/focus)'] || []), item.name]
      }
      if (lower.includes('serotonin') || lower.includes('serotonergic')) {
        pathwayMatches['Serotonin (mood/calm)'] = [...(pathwayMatches['Serotonin (mood/calm)'] || []), item.name]
      }
      if (lower.includes('acetylcholine') || lower.includes('cholinergic') || lower.includes('ache')) {
        pathwayMatches['Acetylcholine (cognition/memory)'] = [...(pathwayMatches['Acetylcholine (cognition/memory)'] || []), item.name]
      }
      if (lower.includes('glutamate') || lower.includes('glutamatergic')) {
        pathwayMatches['Glutamate (excitatory)'] = [...(pathwayMatches['Glutamate (excitatory)'] || []), item.name]
      }
      if (lower.includes('cortisol') || lower.includes('hpa')) {
        pathwayMatches['HPA Axis (stress regulation)'] = [...(pathwayMatches['HPA Axis (stress regulation)'] || []), item.name]
      }
    })

    // Find duplicates/redundancies
    const redundancies = Object.entries(pathwayMatches).filter(([_, items]) => items.length >= 2)

    return {
      redundancies,
      safetyCautionCount,
      safetyWarnings,
      totalMechanisms: mechanismTextList.filter(Boolean).length,
    }
  }

  const { redundancies, safetyCautionCount, safetyWarnings } = analyzeStack()

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Search and Selection Column */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='relative rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4' ref={dropdownRef}>
          <h2 className='text-xl font-bold text-slate-800'>Add to Stack</h2>
          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
                setFocusedIndex(-1)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder='Type an herb or compound name... (e.g. Ashwagandha, L-Theanine)'
              className='w-full rounded-2xl border border-brand-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-700/30 focus:ring-2 focus:ring-brand-700/15 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]'
            />
            {isOpen && filteredItems.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card-strong)] py-2 shadow-xl'>
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.slug}
                    onClick={() => handleAddItem(item)}
                    type='button'
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${
                      idx === focusedIndex
                        ? 'bg-brand-50/80 text-brand-900 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]'
                        : 'text-ink hover:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className='rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] uppercase font-bold text-muted dark:bg-[var(--surface-subtle)] dark:text-[var(--text-muted)]'>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Stack List */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-slate-800'>Your Current Stack ({selectedItems.length})</h2>
            {selectedItems.length > 0 && (
              <button
                onClick={handleClearStack}
                type='button'
                className='text-xs font-semibold text-rose-600 hover:underline'
              >
                Clear All
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className='py-12 text-center text-slate-400 text-sm'>
              No items added. Use the search input above to construct your custom blend.
            </div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2'>
              {selectedItems.map(item => (
                <div
                  key={item.slug}
                  className='flex flex-col justify-between rounded-2xl border border-brand-900/8 bg-white/80 p-4 transition-all hover:shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)]'
                >
                  <div>
                    <div className='flex items-start justify-between gap-2'>
                      <Link
                        href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                        className='text-sm font-bold text-slate-800 hover:text-emerald-700 hover:underline'
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.slug)}
                        type='button'
                        className='text-slate-400 hover:text-rose-500'
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    <span className='inline-flex mt-1 rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-muted dark:bg-[var(--surface-subtle)] dark:text-[var(--text-muted)]'>
                      {item.type}
                    </span>
                  </div>
                  {item.evidence && (
                    <div className='mt-3 flex items-center justify-between border-t border-brand-900/8 pt-2 text-[10px] text-muted dark:border-[var(--border-soft)]'>
                      <span>Evidence: {item.evidence}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Report Column */}
      <div className='space-y-6'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-xl font-bold text-slate-800'>Stack Audit Report</h2>

          {selectedItems.length === 0 ? (
            <div className='py-6 text-center text-slate-400 text-xs'>
              Add items to generate real-time safety, mechanism, and redundancy checks.
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Redundancy / Overlap check */}
              <div className='border-t border-slate-100 pt-3'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Receptor & Pathway Overlaps</h3>
                {redundancies.length === 0 ? (
                  <p className='mt-2 text-xs text-slate-500'>
                    ✓ Clean pathway distribution. No duplicates or overlaps detected.
                  </p>
                ) : (
                  <div className='mt-2 space-y-2.5'>
                    {redundancies.map(([pathway, items]) => (
                      <div key={pathway} className='rounded-xl bg-amber-50 p-3 border border-amber-200/50'>
                        <p className='text-xs font-bold text-amber-800'>Overlapping {pathway}</p>
                        <p className='mt-1 text-[11px] text-amber-700 leading-normal'>
                          Multiple ingredients target this signaling network: <span className='font-semibold'>{items.join(', ')}</span>. Stack with mindfulness.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Auditor */}
              <div className='border-t border-slate-100 pt-3'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Safety Warnings</h3>
                {safetyCautionCount === 0 ? (
                  <p className='mt-2 text-xs text-slate-500'>
                    ✓ All selected items generally report well-tolerated profiles.
                  </p>
                ) : (
                  <div className='mt-2 space-y-2'>
                    {safetyWarnings.map((warning, idx) => (
                      <div key={idx} className='rounded-xl bg-rose-50 p-3 border border-rose-200/30'>
                        <p className='text-[11px] text-rose-800 font-medium leading-normal'>
                          {warning}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stack Actions summary */}
              <div className='border-t border-slate-100 pt-3'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Stack Summary</h3>
                <div className='mt-2 grid grid-cols-2 gap-2 text-center'>
                  <div className='rounded-xl bg-[var(--surface-subtle)] p-2.5'>
                    <p className='text-lg font-bold text-slate-800'>{selectedItems.length}</p>
                    <p className='text-[9px] uppercase font-bold text-slate-400'>Ingredients</p>
                  </div>
                  <div className='rounded-xl bg-[var(--surface-subtle)] p-2.5'>
                    <p className='text-lg font-bold text-slate-800'>
                      {safetyCautionCount > 0 ? 'Caution' : 'Tolerated'}
                    </p>
                    <p className='text-[9px] uppercase font-bold text-slate-400'>Safety Status</p>
                  </div>
                </div>
              </div>

              <div className='pt-3 text-[10px] text-slate-400 italic leading-normal border-t border-slate-100'>
                Disclaimer: Stacks generated are for educational exploration only. Overlapping neurotransmitter pathways may amplify physiological effects. Consult a clinician.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
