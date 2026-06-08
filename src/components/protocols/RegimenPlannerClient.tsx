'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'

interface RegimenItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  dosage?: string
  dose?: string
  safety?: string
  mechanism?: string
  effects?: string[] | string
}

interface RegimenPlannerClientProps {
  herbs: any[]
  compounds: any[]
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'prebed'

interface PlannedInterval {
  slot: TimeSlot
  label: string
  icon: string
  items: RegimenItem[]
}

export default function RegimenPlannerClient({ herbs, compounds }: RegimenPlannerClientProps) {
  const allItems = useMemo(() => {
    return [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ] as RegimenItem[]
  }, [herbs, compounds])

  // Time Slot definitions
  const slots: { id: TimeSlot; label: string; icon: string; timeRange: string }[] = [
    { id: 'morning', label: 'Morning', icon: '🌅', timeRange: '6:00 AM - 11:00 AM' },
    { id: 'afternoon', label: 'Afternoon', icon: '☀️', timeRange: '11:00 AM - 4:00 PM' },
    { id: 'evening', label: 'Evening', icon: '🌆', timeRange: '4:00 PM - 9:00 PM' },
    { id: 'prebed', label: 'Pre-Bed / Night', icon: '🌙', timeRange: '9:00 PM - 6:00 AM' },
  ]

  // State for selections in each slot
  const [morningItems, setMorningItems] = useState<RegimenItem[]>([])
  const [afternoonItems, setAfternoonItems] = useState<RegimenItem[]>([])
  const [eveningItems, setEveningItems] = useState<RegimenItem[]>([])
  const [prebedItems, setPrebedItems] = useState<RegimenItem[]>([])

  // Search input queries per slot
  const [activeSlot, setActiveSlot] = useState<TimeSlot>('morning')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Map state hooks to slots
  const getSlotItems = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning': return morningItems
      case 'afternoon': return afternoonItems
      case 'evening': return eveningItems
      case 'prebed': return prebedItems
    }
  }

  const setSlotItems = (slot: TimeSlot, items: RegimenItem[]) => {
    switch (slot) {
      case 'morning': setMorningItems(items); break
      case 'afternoon': setAfternoonItems(items); break
      case 'evening': setEveningItems(items); break
      case 'prebed': setPrebedItems(items); break
    }
  }

  // Load from LocalStorage or URL params on mount
  useEffect(() => {
    try {
      // 1. Check URL parameters first for shared link
      const params = new URLSearchParams(window.location.search)
      let loadedFromUrl = false

      slots.forEach(slot => {
        const paramVal = params.get(slot.id)
        if (paramVal) {
          const slugs = paramVal.split(',')
          const matched = slugs
            .map(slug => allItems.find(item => item.slug === slug))
            .filter((item): item is RegimenItem => !!item)
          
          if (matched.length > 0) {
            setSlotItems(slot.id, matched)
            loadedFromUrl = true
          }
        }
      })

      if (loadedFromUrl) return

      // 2. Fall back to LocalStorage
      const saved = localStorage.getItem('user-regimen')
      if (saved) {
        const parsed = JSON.parse(saved) as Record<TimeSlot, string[]>
        slots.forEach(slot => {
          if (parsed[slot.id]) {
            const matched = parsed[slot.id]
              .map(slug => allItems.find(item => item.slug === slug))
              .filter((item): item is RegimenItem => !!item)
            setSlotItems(slot.id, matched)
          }
        })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load regimen:', e)
    }
  }, [allItems])

  // Save changes to local storage
  const saveRegimen = (
    m: RegimenItem[],
    a: RegimenItem[],
    ev: RegimenItem[],
    p: RegimenItem[]
  ) => {
    try {
      const data = {
        morning: m.map(i => i.slug),
        afternoon: a.map(i => i.slug),
        evening: ev.map(i => i.slug),
        prebed: p.map(i => i.slug),
      }
      localStorage.setItem('user-regimen', JSON.stringify(data))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save regimen:', e)
    }
  }

  const handleAddItem = (item: RegimenItem) => {
    const current = getSlotItems(activeSlot)
    if (!current.some(i => i.slug === item.slug)) {
      const updated = [...current, item]
      setSlotItems(activeSlot, updated)
      
      // Save
      const m = activeSlot === 'morning' ? updated : morningItems
      const a = activeSlot === 'afternoon' ? updated : afternoonItems
      const ev = activeSlot === 'evening' ? updated : eveningItems
      const pb = activeSlot === 'prebed' ? updated : prebedItems
      saveRegimen(m, a, ev, pb)
    }
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleRemoveItem = (slot: TimeSlot, slug: string) => {
    const current = getSlotItems(slot)
    const updated = current.filter(i => i.slug !== slug)
    setSlotItems(slot, updated)

    const m = slot === 'morning' ? updated : morningItems
    const a = slot === 'afternoon' ? updated : afternoonItems
    const ev = slot === 'evening' ? updated : eveningItems
    const pb = slot === 'prebed' ? updated : prebedItems
    saveRegimen(m, a, ev, pb)
  }

  const handleClearAll = () => {
    setMorningItems([])
    setAfternoonItems([])
    setEveningItems([])
    setPrebedItems([])
    localStorage.removeItem('user-regimen')
  }

  // Filter out items already selected in active slot
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery) return []
    const current = getSlotItems(activeSlot)
    return allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const notSelected = !current.some(selected => selected.slug === item.slug)
      return nameMatch && notSelected
    }).slice(0, 8)
  }, [searchQuery, activeSlot, morningItems, afternoonItems, eveningItems, prebedItems, allItems])

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

  // Analyze Daily Cumulative Doses & Safety overlaps
  const regimenAnalysis = useMemo(() => {
    const warnings: string[] = []
    let totalCaffeine = 0
    let sedativeCount = 0

    // Collect all unique selected items and their slots
    const allSelected: { item: RegimenItem; slot: TimeSlot }[] = [
      ...morningItems.map(i => ({ item: i, slot: 'morning' as const })),
      ...afternoonItems.map(i => ({ item: i, slot: 'afternoon' as const })),
      ...eveningItems.map(i => ({ item: i, slot: 'evening' as const })),
      ...prebedItems.map(i => ({ item: i, slot: 'prebed' as const })),
    ]

    allSelected.forEach(({ item, slot }) => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase()

      // Calculate caffeine intake (estimating typical dose yields)
      if (item.slug === 'caffeine') {
        totalCaffeine += 150 // standard dose
      } else if (item.slug.includes('green-tea') || item.slug.includes('egcg')) {
        totalCaffeine += 50
      }

      // Check for sedative loads
      const isSedative = safetyText.includes('sedative') || safetyText.includes('drowsiness') || 
                        mechText.includes('gaba-a') || mechText.includes('gabaergic')
      if (isSedative) {
        sedativeCount++
      }

      // Late day stimulant checks (Evening & Prebed)
      const isStimulant = safetyText.includes('stimulant') || mechText.includes('stimulant') || item.slug === 'caffeine'
      if (isStimulant && (slot === 'evening' || slot === 'prebed')) {
        warnings.push(`Sleep Disruption Risk: ${item.name} is scheduled in the ${slot}. Stimulants late in the day block adenosine and disrupt sleep architecture.`)
      }
    })

    // General warnings
    if (totalCaffeine > 400) {
      warnings.push(`Caffeine Overload Alert: Cumulative scheduled caffeine is ${totalCaffeine}mg, exceeding the recommended daily limit of 400mg.`)
    }
    if (sedativeCount >= 3) {
      warnings.push(`High Depressant Load Warning: You have stacked ${sedativeCount} CNS depressants across your schedule. Combining multiple GABAergic/sedative agents increases risk of motor slowing and excessive fatigue.`)
    }

    return {
      warnings,
      totalCaffeine,
      sedativeCount
    }
  }, [morningItems, afternoonItems, eveningItems, prebedItems])

  // Share link generator
  const getShareLink = () => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams()
    
    if (morningItems.length > 0) params.set('morning', morningItems.map(i => i.slug).join(','))
    if (afternoonItems.length > 0) params.set('afternoon', afternoonItems.map(i => i.slug).join(','))
    if (eveningItems.length > 0) params.set('evening', eveningItems.map(i => i.slug).join(','))
    if (prebedItems.length > 0) params.set('prebed', prebedItems.map(i => i.slug).join(','))
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  // Handle JSON export
  const exportJson = () => {
    const data = {
      morning: morningItems.map(i => ({ slug: i.slug, name: i.name })),
      afternoon: afternoonItems.map(i => ({ slug: i.slug, name: i.name })),
      evening: eveningItems.map(i => ({ slug: i.slug, name: i.name })),
      prebed: prebedItems.map(i => ({ slug: i.slug, name: i.name })),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hippie-scientist-regimen.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle JSON import
  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        const loadSlot = (slugData: any[]): RegimenItem[] => {
          if (!Array.isArray(slugData)) return []
          return slugData
            .map((s: any) => {
              const slug = typeof s === 'string' ? s : s.slug
              return allItems.find(item => item.slug === slug)
            })
            .filter((item): item is RegimenItem => !!item)
        }

        const m = loadSlot(parsed.morning)
        const a = loadSlot(parsed.afternoon)
        const ev = loadSlot(parsed.evening)
        const pb = loadSlot(parsed.prebed)

        setMorningItems(m)
        setAfternoonItems(a)
        setEveningItems(ev)
        setPrebedItems(pb)

        saveRegimen(m, a, ev, pb)
      } catch (err) {
        alert('Invalid JSON file format.')
      }
    }
    reader.readAsText(file)
  }

  const [copied, setCopied] = useState(false)
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareLink())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='grid gap-8 lg:grid-cols-3 print:grid-cols-1'>
      {/* Schedule Planner Grid */}
      <div className='lg:col-span-2 space-y-6 print:w-full'>
        {/* Slot Controls Header */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4 print:hidden' ref={dropdownRef}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-lg font-bold text-slate-800'>Schedule an Ingredient</h2>
            <div className='flex gap-1.5'>
              {slots.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSlot(s.id)
                    setIsOpen(true)
                  }}
                  type='button'
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                    activeSlot === s.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.icon} Add to {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={`Search to add to ${activeSlot.charAt(0).toUpperCase() + activeSlot.slice(1)} schedule...`}
              className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none'
            />
            {isOpen && filteredSearchItems.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredSearchItems.map(item => (
                  <button
                    key={item.slug}
                    onClick={() => handleAddItem(item)}
                    type='button'
                    className='flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50'
                  >
                    <span>{item.name}</span>
                    <span className='rounded bg-slate-100 px-2 py-0.5 text-[9px] uppercase font-bold text-slate-500'>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Schedule Slots */}
        <div className='space-y-4 print:space-y-6'>
          {slots.map(slot => {
            const items = getSlotItems(slot.id)
            return (
              <div
                key={slot.id}
                className='rounded-3xl border border-brand-900/10 bg-white/95 p-5 shadow-sm space-y-3 print:border-slate-300 print:shadow-none'
              >
                <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>{slot.icon}</span>
                    <div>
                      <h3 className='text-sm font-bold text-slate-800'>{slot.label}</h3>
                      <span className='text-[10px] text-slate-400 font-semibold'>{slot.timeRange}</span>
                    </div>
                  </div>
                  <span className='rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500'>
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className='py-4 text-center text-xs text-slate-400 italic print:hidden'>
                    No supplements scheduled for this interval.
                  </p>
                ) : (
                  <div className='grid gap-3 sm:grid-cols-2 print:grid-cols-1'>
                    {items.map(item => (
                      <div
                        key={item.slug}
                        className='flex items-start justify-between gap-2 rounded-xl bg-slate-50/50 p-3.5 border border-slate-100/50 print:bg-white print:border-slate-200'
                      >
                        <div className='min-w-0'>
                          <Link
                            href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                            className='text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline block truncate print:no-underline'
                          >
                            {item.name}
                          </Link>
                          {item.dosage && (
                            <span className='text-[10px] text-slate-400 font-medium block mt-0.5'>
                              Standard dose: {item.dosage}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(slot.id, item.slug)}
                          className='text-slate-400 hover:text-rose-600 text-xs p-1 print:hidden'
                          type='button'
                          aria-label={`Remove ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Regimen Audit & Export Panel */}
      <div className='space-y-6 print:hidden'>
        {/* Cumulative Audit Report */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-lg font-bold text-slate-800'>Regimen Audit</h2>

          {morningItems.length + afternoonItems.length + eveningItems.length + prebedItems.length === 0 ? (
            <p className='py-6 text-center text-xs text-slate-400 italic'>
              Add ingredients to intervals to trigger cumulative warnings, caffeine limits, and sleep-loading checks.
            </p>
          ) : (
            <div className='space-y-4'>
              {/* Warnings List */}
              {regimenAnalysis.warnings.length === 0 ? (
                <div className='rounded-2xl bg-emerald-50/50 border border-emerald-200/40 p-4 text-xs text-emerald-900 leading-relaxed'>
                  <p className='font-bold'>✓ Synaptic Load is Balanced</p>
                  <p className='mt-1 opacity-90'>
                    Your schedule contains no severe late-day stimulants or caffeine overloads.
                  </p>
                </div>
              ) : (
                <div className='space-y-3.5'>
                  {regimenAnalysis.warnings.map((warning, idx) => (
                    <div key={idx} className='rounded-2xl bg-amber-50 border border-amber-200/40 p-4 text-xs text-amber-900 leading-relaxed'>
                      <p className='font-bold flex items-center gap-1.5'>⚠️ Schedule Caution</p>
                      <p className='mt-1 opacity-90'>{warning}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Statistics Grid */}
              <div className='border-t border-slate-100 pt-3.5 grid grid-cols-2 gap-2 text-center'>
                <div className='rounded-xl bg-slate-50 p-2.5 border border-slate-100'>
                  <p className='text-lg font-bold text-slate-800'>{regimenAnalysis.totalCaffeine} mg</p>
                  <p className='text-[8px] uppercase font-bold text-slate-400'>Daily Caffeine</p>
                </div>
                <div className='rounded-xl bg-slate-50 p-2.5 border border-slate-100'>
                  <p className='text-lg font-bold text-slate-800'>{regimenAnalysis.sedativeCount}</p>
                  <p className='text-[8px] uppercase font-bold text-slate-400'>Sedative Loading</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sharing and Export Controls */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h3 className='text-sm font-bold text-slate-800'>Regimen sharing & Backup</h3>
          
          <div className='grid gap-2.5'>
            {/* Share Link Button */}
            <button
              onClick={handleCopyLink}
              type='button'
              className='w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 transition-all text-center'
            >
              {copied ? '✓ Copied Shareable Link!' : '🔗 Copy Shareable Link'}
            </button>

            {/* Export JSON */}
            <button
              onClick={exportJson}
              type='button'
              className='w-full rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 transition-all text-center'
            >
              📥 Backup Regimen (JSON)
            </button>

            {/* Import JSON */}
            <label className='w-full rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 transition-all text-center cursor-pointer block'>
              📤 Restore Backup (JSON)
              <input
                type='file'
                accept='.json'
                onChange={importJson}
                className='hidden'
              />
            </label>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              type='button'
              className='w-full rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 transition-all text-center'
            >
              🖨️ Print Daily Schedule
            </button>
          </div>
        </div>

        <button
          onClick={handleClearAll}
          type='button'
          className='w-full rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/50 text-rose-700 font-bold text-xs py-3 px-4 transition-all text-center'
        >
          🗑️ Clear Schedule
        </button>
      </div>
    </div>
  )
}
