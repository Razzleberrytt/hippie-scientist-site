'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

interface SafetyItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
}

interface SafetyCheckerClientProps {
  herbs: any[]
  compounds: any[]
}

export default function SafetyCheckerClient({ herbs, compounds }: SafetyCheckerClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<SafetyItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Merge datasets
  const allItems = [
    ...herbs.map(item => ({ ...item, type: 'herb' as const })),
    ...compounds.map(item => ({ ...item, type: 'compound' as const })),
  ] as SafetyItem[]

  // Filter items for search
  const filteredItems = searchQuery
    ? allItems.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const notSelected = !selectedItems.some(selected => selected.slug === item.slug)
        return matchesName && notSelected
      }).slice(0, 8)
    : []

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddItem = (item: SafetyItem) => {
    if (!selectedItems.some(i => i.slug === item.slug)) {
      setSelectedItems([...selectedItems, item])
    }
    setSearchQuery('')
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const handleRemoveItem = (slug: string) => {
    setSelectedItems(selectedItems.filter(item => item.slug !== slug))
  }

  const handleClearAll = () => {
    setSelectedItems([])
  }

  // Analyze interaction warnings
  const analysis = useMemo(() => {
    const alerts: { type: 'danger' | 'warning' | 'info'; title: string; desc: string }[] = []
    
    if (selectedItems.length === 0) return { alerts, riskLevel: 'low' as const }

    let sedativeCount = 0
    let stimulantCount = 0
    let serotonergicCount = 0
    let maoiCount = 0
    let bleedingCount = 0

    const sedativeList: string[] = []
    const stimulantList: string[] = []
    const serotonergicList: string[] = []
    const maoiList: string[] = []
    const bleedingList: string[] = []

    selectedItems.forEach(item => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase() + ' ' + (item.mechanisms || []).join(' ').toLowerCase()

      // 1. Sedatives (GABA/CNS Depressants)
      const isSedative = safetyText.includes('sedative') || safetyText.includes('depressant') || safetyText.includes('drowsiness') ||
                        mechText.includes('gaba-a') || mechText.includes('gabaergic') || mechText.includes('valerian') || mechText.includes('kava')

      if (isSedative) {
        sedativeCount++
        sedativeList.push(item.name)
      }

      // 2. Stimulants
      const isStimulant = safetyText.includes('stimulant') || safetyText.includes('insomnia') || safetyText.includes('hypertension') ||
                          mechText.includes('stimulant') || mechText.includes('caffeine') || mechText.includes('ephedrine') || mechText.includes('yohimbine')

      if (isStimulant) {
        stimulantCount++
        stimulantList.push(item.name)
      }

      // 3. Serotonergic
      const isSerotonergic = safetyText.includes('serotonin syndrome') || safetyText.includes('ssri') || safetyText.includes('maoi') ||
                             mechText.includes('serotonin reuptake') || mechText.includes('5-ht') || mechText.includes('serotonergic') || mechText.includes('kanna')

      if (isSerotonergic) {
        serotonergicCount++
        serotonergicList.push(item.name)
      }

      // 4. MAOI
      const isMaoi = safetyText.includes('maoi') || safetyText.includes('monoamine oxidase') || 
                      mechText.includes('mao inhibitor') || mechText.includes('maoi')

      if (isMaoi) {
        maoiCount++
        maoiList.push(item.name)
      }

      // 5. Anticoagulants (bleeding risk)
      const isAnticoagulant = safetyText.includes('bleeding') || safetyText.includes('anticoagulant') || safetyText.includes('blood thinner') || safetyText.includes('surgery') ||
                              mechText.includes('antiplatelet') || mechText.includes('antithrombotic')

      if (isAnticoagulant) {
        bleedingCount++
        bleedingList.push(item.name)
      }
    })

    // Generate alerts
    if (sedativeCount >= 2) {
      alerts.push({
        type: 'warning',
        title: 'CNS Depressant / GABAergic Overlap',
        desc: `You have selected multiple ingredients with sedative or GABAergic mechanisms (${sedativeList.join(', ')}). Combining them can significantly compound drowsiness, motor impairment, and cognitive slowing.`
      })
    }

    if (serotonergicCount >= 2) {
      alerts.push({
        type: 'danger',
        title: 'Serotonin Toxicity (Serotonin Syndrome) Risk',
        desc: `Multiple selected ingredients modulate serotonin levels or pathways (${serotonergicList.join(', ')}). Combining them increases the risk of Serotonin Syndrome, which presents as high body temperature, agitation, tremor, and rapid heart rate.`
      })
    }

    if (stimulantCount >= 2) {
      alerts.push({
        type: 'warning',
        title: 'Cardiovascular Overstimulation Stack',
        desc: `Combining multiple stimulants (${stimulantList.join(', ')}) can compound heart rate, blood pressure spikes, palpitations, and severe psychological anxiety or restlessness.`
      })
    }

    if (maoiCount > 0 && (serotonergicCount > maoiCount || stimulantCount > 0)) {
      alerts.push({
        type: 'danger',
        title: 'Severe MAOI Contraindication Detected',
        desc: `You have stacked a Monoamine Oxidase Inhibitor (MAOI) mechanism (${maoiList.join(', ')}) with other serotonergics or stimulants. This combination is highly contraindicated and can lead to acute hypertensive crises or severe serotonin toxicity.`
      })
    }

    if (bleedingCount >= 2) {
      alerts.push({
        type: 'warning',
        title: 'Elevated Bleeding Risk (Anticoagulant Effect)',
        desc: `Multiple ingredients (${bleedingList.join(', ')}) possess blood-thinning or antiplatelet activities. Combining them increases systemic bleeding risk, particularly prior to surgery or in individuals taking pharmaceutical anticoagulants (e.g. Warfarin, Aspirin).`
      })
    }

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (alerts.some(a => a.type === 'danger')) {
      riskLevel = 'high'
    } else if (alerts.some(a => a.type === 'warning')) {
      riskLevel = 'medium'
    }

    return { alerts, riskLevel }
  }, [selectedItems])

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

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Selection Column */}
      <div className='lg:col-span-1 space-y-6'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4' ref={dropdownRef}>
          <h2 className='text-lg font-bold text-slate-800'>Search Ingredients</h2>
          <p className='text-xs text-slate-500'>
            Add multiple herbs or compounds to evaluate contraindications, drug interactions, and physiological loading overlaps.
          </p>

          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
                setFocusedIndex(-1)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder='Type herb or compound...'
              className='w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none'
            />
            {isOpen && filteredItems.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.slug}
                    onClick={() => handleAddItem(item)}
                    type='button'
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                      idx === focusedIndex ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'
                    }`}
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

        {/* Selected List */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-bold text-slate-800'>Selected List ({selectedItems.length})</h3>
            {selectedItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className='text-xs font-semibold text-rose-600 hover:underline'
                type='button'
              >
                Clear All
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <p className='py-8 text-center text-xs text-slate-400'>
              No items selected. Search above to check interactions.
            </p>
          ) : (
            <div className='space-y-2'>
              {selectedItems.map(item => (
                <div
                  key={item.slug}
                  className='flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100'
                >
                  <div className='min-w-0'>
                    <Link
                      href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                      className='text-xs font-bold text-slate-800 hover:underline block truncate hover:text-emerald-700'
                    >
                      {item.name}
                    </Link>
                    <span className='text-[8px] uppercase font-bold text-slate-400'>{item.type}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.slug)}
                    className='text-slate-400 hover:text-rose-600 text-xs p-1'
                    type='button'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interaction Reports */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          <div className='border-b border-slate-100 pb-4 flex items-center justify-between'>
            <h2 className='text-xl font-bold text-slate-800'>Interactive Safety Audit</h2>
            {selectedItems.length > 0 && (
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                analysis.riskLevel === 'high'
                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                  : analysis.riskLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                Risk Level: {analysis.riskLevel}
              </span>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className='py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl'>
              Add two or more items from the search bar to evaluate safety overlaps and contraindications.
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Warnings and Contraindications alerts */}
              {analysis.alerts.length === 0 ? (
                <div className='rounded-2xl bg-emerald-50/50 border border-emerald-200/40 p-5 text-sm text-emerald-900 leading-relaxed'>
                  <p className='font-bold'>✓ No Severe Interactions Detected</p>
                  <p className='mt-1 text-xs text-emerald-800'>
                    The selected combination does not report immediate chemical contraindications or receptor loading overlaps in our database. Ensure you check individual extract quality guidelines before purchasing.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {analysis.alerts.map((alert: any, idx: number) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-5 border text-sm leading-relaxed ${
                        alert.type === 'danger'
                          ? 'bg-rose-50 border-rose-200/50 text-rose-900'
                          : 'bg-amber-50 border-amber-200/50 text-amber-900'
                      }`}
                    >
                      <h4 className='font-bold flex items-center gap-2'>
                        {alert.type === 'danger' ? '⚠️ Contraindication Alert:' : '⚠️ Caution Warning:'}{' '}
                        {alert.title}
                      </h4>
                      <p className='mt-1.5 text-xs opacity-90'>{alert.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Individual Safety Notes Detail */}
              <div className='space-y-3 pt-2'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                  Individual Safety Profiles
                </h3>
                <div className='space-y-3'>
                  {selectedItems.map(item => (
                    <div
                      key={item.slug}
                      className='rounded-xl border border-slate-100 p-4 bg-slate-50/30'
                    >
                      <h4 className='text-xs font-bold text-slate-800'>{item.name}</h4>
                      <p className='mt-1 text-xs text-slate-600 leading-relaxed'>
                        {item.safety || 'Generally safe and well-tolerated. Avoid combining with heavy CNS depressants or prescription drugs without medical advice.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
