'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'

interface ComparisonItem {
  slug: string
  name: string
  displayName?: string
  type: 'herb' | 'compound'
  summary?: string
  description?: string
  evidence_tier?: string
  evidenceLevel?: string
  confidence?: string
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
  pathways?: string[]
  onset?: string
  time_to_effect?: string
  duration?: string
  dosage?: string
  dose?: string
  preparation?: string
  preparations?: string
  best_for?: string | string[]
  bestFor?: string | string[]
}

interface DynamicComparerClientProps {
  herbs: any[]
  compounds: any[]
}

export default function DynamicComparerClient({ herbs, compounds }: DynamicComparerClientProps) {
  // Combine all items
  const allItems = useMemo(() => {
    return [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ].map(item => ({
      ...item,
      normalizedName: item.displayName || item.name || item.slug
    })) as ComparisonItem[]
  }, [herbs, compounds])

  // Selected items state (by slug)
  const [selectedSlugA, setSelectedSlugA] = useState<string>('')
  const [selectedSlugB, setSelectedSlugB] = useState<string>('')

  // Search queries for autocomplete inputs
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')

  // Dropdown open states
  const [openA, setOpenA] = useState(false)
  const [openB, setOpenB] = useState(false)

  // Refs for closing dropdowns on click outside
  const refA = useRef<HTMLDivElement>(null)
  const refB = useRef<HTMLDivElement>(null)

  // Set default initial selection
  useEffect(() => {
    const rhodiola = allItems.find(i => i.slug.includes('rhodiola')) || allItems[0]
    const ashwagandha = allItems.find(i => i.slug.includes('ashwagandha')) || allItems[1]

    if (rhodiola) {
      setSelectedSlugA(rhodiola.slug)
      setSearchA(rhodiola.name)
    }
    if (ashwagandha) {
      setSelectedSlugB(ashwagandha.slug)
      setSearchB(ashwagandha.name)
    }
  }, [allItems])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (refA.current && !refA.current.contains(event.target as Node)) {
        setOpenA(false)
      }
      if (refB.current && !refB.current.contains(event.target as Node)) {
        setOpenB(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered lists for inputs
  const filteredA = useMemo(() => {
    if (!searchA) return []
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(searchA.toLowerCase()) && 
        item.slug !== selectedSlugB
      )
      .slice(0, 6)
  }, [searchA, allItems, selectedSlugB])

  const filteredB = useMemo(() => {
    if (!searchB) return []
    return allItems
      .filter(item => 
        item.name.toLowerCase().includes(searchB.toLowerCase()) && 
        item.slug !== selectedSlugA
      )
      .slice(0, 6)
  }, [searchB, allItems, selectedSlugA])

  // Get full objects for selected items
  const itemA = useMemo(() => allItems.find(i => i.slug === selectedSlugA), [selectedSlugA, allItems])
  const itemB = useMemo(() => allItems.find(i => i.slug === selectedSlugB), [selectedSlugB, allItems])

  // Helpers to safely resolve record details
  const getEvidenceTier = (item?: ComparisonItem) => {
    if (!item) return 'N/A'
    const tier = item.evidence_tier || item.evidenceLevel || item.confidence || 'C'
    return String(tier).toUpperCase()
  }

  const getSafetyString = (item?: ComparisonItem) => {
    if (!item) return 'N/A'
    const safety = item.safety || (Array.isArray(item.safety_flags) ? item.safety_flags.join(', ') : '')
    return safety || 'Generally well-tolerated. Check for contraindications if on medications.'
  }

  const getMechanismString = (item?: ComparisonItem) => {
    if (!item) return 'N/A'
    const mech = item.mechanism || (Array.isArray(item.mechanisms) ? item.mechanisms.join(', ') : '')
    return mech || 'Not fully documented'
  }

  const getOnsetDuration = (item?: ComparisonItem) => {
    if (!item) return 'N/A'
    const onset = item.onset || item.time_to_effect || 'Acute/Cumulative (see profile)'
    const dur = item.duration || 'Variable'
    return `${onset} / ${dur}`
  }

  const getDosagePrep = (item?: ComparisonItem) => {
    if (!item) return 'N/A'
    const dosage = item.dosage || item.dose || 'See monograph dosing section'
    const prep = item.preparation || item.preparations || 'Capsule / Standardized Extract'
    return `${prep} (${dosage})`
  }

  return (
    <div className='space-y-8'>
      {/* Dynamic Selection Controls */}
      <div className='grid gap-4 sm:grid-cols-2 rounded-[2rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
        {/* Selection Input A */}
        <div className='relative space-y-2' ref={refA}>
          <label className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Compare Ingredient A
          </label>
          <div className='relative'>
            <input
              type='text'
              value={searchA}
              onChange={e => {
                setSearchA(e.target.value)
                setOpenA(true)
              }}
              onFocus={() => setOpenA(true)}
              placeholder='Type to search A...'
              className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none'
            />
            {openA && filteredA.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredA.map(item => (
                  <button
                    key={item.slug}
                    onClick={() => {
                      setSelectedSlugA(item.slug)
                      setSearchA(item.name)
                      setOpenA(false)
                    }}
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

        {/* Selection Input B */}
        <div className='relative space-y-2' ref={refB}>
          <label className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Compare Ingredient B
          </label>
          <div className='relative'>
            <input
              type='text'
              value={searchB}
              onChange={e => {
                setSearchB(e.target.value)
                setOpenB(true)
              }}
              onFocus={() => setOpenB(true)}
              placeholder='Type to search B...'
              className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none'
            />
            {openB && filteredB.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredB.map(item => (
                  <button
                    key={item.slug}
                    onClick={() => {
                      setSelectedSlugB(item.slug)
                      setSearchB(item.name)
                      setOpenB(false)
                    }}
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
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {(!itemA || !itemB) ? (
        <div className='rounded-[2rem] border border-dashed border-slate-200 bg-white/50 py-16 text-center text-slate-400 text-sm'>
          Select two active ingredients from the inputs above to generate a side-by-side comparison.
        </div>
      ) : (
        <div className='overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/90 shadow-sm'>
          <div className='grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100'>
            {/* Left Label Column (Visible on Desktop) */}
            <div className='hidden md:flex flex-col bg-slate-50/50'>
              <div className='p-6 h-[88px] flex items-end border-b border-slate-100'>
                <span className='text-xs font-bold uppercase tracking-wider text-slate-400'>Tradeoff Comparison Matrix</span>
              </div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Category Type
              </div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Primary Intent / Description
              </div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Scientific Evidence
              </div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Target Receptor Mechanisms
              </div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Onset / Duration
              </div>
              <div className='p-6 min-h-[120px] flex items-center border-b border-slate-100 font-bold text-sm text-slate-700'>
                Standard Dosage & Prep
              </div>
              <div className='p-6 min-h-[140px] flex items-center font-bold text-sm text-slate-700'>
                Safety Cautions & Warnings
              </div>
            </div>

            {/* Column A */}
            <div className='flex flex-col'>
              <div className='p-6 h-[88px] flex flex-col justify-between border-b border-slate-100 bg-emerald-50/10'>
                <div>
                  <span className='text-[10px] font-bold uppercase text-slate-400'>Ingredient A</span>
                  <h3 className='text-lg font-bold text-slate-800 leading-snug'>{itemA.name}</h3>
                </div>
              </div>

              {/* Mobile Category Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Category Type</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm text-slate-700'>
                <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600'>
                  {itemA.type}
                </span>
              </div>

              {/* Mobile Intent Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Primary Intent</div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed'>
                {itemA.summary || itemA.description || 'No direct summary found.'}
              </div>

              {/* Mobile Evidence Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Evidence Tier</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm'>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  getEvidenceTier(itemA) === 'A'
                    ? 'bg-emerald-100 text-emerald-800'
                    : getEvidenceTier(itemA) === 'B'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {getEvidenceTier(itemA)} Evidence Tier
                </span>
              </div>

              {/* Mobile Mechanisms Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Mechanisms</div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed font-mono text-xs'>
                {getMechanismString(itemA)}
              </div>

              {/* Mobile Onset Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Onset / Duration</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm text-slate-700'>
                {getOnsetDuration(itemA)}
              </div>

              {/* Mobile Dosage Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Dosage & Prep</div>
              <div className='p-6 min-h-[120px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed'>
                {getDosagePrep(itemA)}
              </div>

              {/* Mobile Safety Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Safety Cautions</div>
              <div className='p-6 min-h-[140px] flex items-center text-sm text-slate-600 leading-relaxed'>
                <div className='rounded-xl bg-amber-50/40 p-3.5 border border-amber-250/20 text-xs text-amber-900'>
                  {getSafetyString(itemA)}
                </div>
              </div>

              {/* Deep Link Action A */}
              <div className='p-6 border-t border-slate-100 bg-slate-50/20 flex justify-end'>
                <Link
                  href={itemA.type === 'herb' ? `/herbs/${itemA.slug}` : `/compounds/${itemA.slug}`}
                  className='rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition'
                >
                  View Full Profile →
                </Link>
              </div>
            </div>

            {/* Column B */}
            <div className='flex flex-col'>
              <div className='p-6 h-[88px] flex flex-col justify-between border-b border-slate-100 bg-emerald-50/10'>
                <div>
                  <span className='text-[10px] font-bold uppercase text-slate-400'>Ingredient B</span>
                  <h3 className='text-lg font-bold text-slate-800 leading-snug'>{itemB.name}</h3>
                </div>
              </div>

              {/* Mobile Category Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Category Type</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm text-slate-700'>
                <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600'>
                  {itemB.type}
                </span>
              </div>

              {/* Mobile Intent Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Primary Intent</div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed'>
                {itemB.summary || itemB.description || 'No direct summary found.'}
              </div>

              {/* Mobile Evidence Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Evidence Tier</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm'>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  getEvidenceTier(itemB) === 'A'
                    ? 'bg-emerald-100 text-emerald-800'
                    : getEvidenceTier(itemB) === 'B'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {getEvidenceTier(itemB)} Evidence Tier
                </span>
              </div>

              {/* Mobile Mechanisms Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Mechanisms</div>
              <div className='p-6 min-h-[140px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed font-mono text-xs'>
                {getMechanismString(itemB)}
              </div>

              {/* Mobile Onset Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Onset / Duration</div>
              <div className='p-6 min-h-[92px] flex items-center border-b border-slate-100 text-sm text-slate-700'>
                {getOnsetDuration(itemB)}
              </div>

              {/* Mobile Dosage Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Dosage & Prep</div>
              <div className='p-6 min-h-[120px] flex items-center border-b border-slate-100 text-sm text-slate-600 leading-relaxed'>
                {getDosagePrep(itemB)}
              </div>

              {/* Mobile Safety Label */}
              <div className='md:hidden px-6 pt-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-50'>Safety Cautions</div>
              <div className='p-6 min-h-[140px] flex items-center text-sm text-slate-600 leading-relaxed'>
                <div className='rounded-xl bg-amber-50/40 p-3.5 border border-amber-250/20 text-xs text-amber-900'>
                  {getSafetyString(itemB)}
                </div>
              </div>

              {/* Deep Link Action B */}
              <div className='p-6 border-t border-slate-100 bg-slate-50/20 flex justify-end'>
                <Link
                  href={itemB.type === 'herb' ? `/herbs/${itemB.slug}` : `/compounds/${itemB.slug}`}
                  className='rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition'
                >
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
