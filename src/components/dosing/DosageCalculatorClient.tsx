'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { isRestrictedRecord } from '@/lib/restricted-ingredients'

interface DosageItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  dosage?: string
  dose?: string
  activeMarker?: string
  defaultPct?: number
  administration?: string
  cycling?: string
}

interface DosageCalculatorClientProps {
  herbs: any[]
  compounds: any[]
}

const EXTRACT_METADATA: Record<string, { activeMarker: string; defaultPct: number }> = {
  ashwagandha: { activeMarker: 'Withanolides', defaultPct: 5 },
  bacopa: { activeMarker: 'Bacosides', defaultPct: 45 },
  rhodiola: { activeMarker: 'Rosavins / Salidroside', defaultPct: 3 },
  lion: { activeMarker: 'Hericenones / Erinacines', defaultPct: 10 },
  ginseng: { activeMarker: 'Ginsenosides', defaultPct: 15 },
  kanna: { activeMarker: 'Mesembrine alkaloids', defaultPct: 0.5 },
  curcumin: { activeMarker: 'Curcuminoids', defaultPct: 95 },
  ginkgo: { activeMarker: 'Flavone Glycosides', defaultPct: 24 },
  green: { activeMarker: 'EGCG', defaultPct: 50 },
  cordyceps: { activeMarker: 'Cordycepin', defaultPct: 1 },
}

export default function DosageCalculatorClient({ herbs, compounds }: DosageCalculatorClientProps) {
  // Combine items
  const allItems = useMemo(() => {
    const combined = [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ].filter(item => !isRestrictedRecord(item))

    return combined.map(item => {
      // Check if we have pre-defined extract markers
      let activeMarker = 'Active molecules'
      let defaultPct = 10
      const matchedKey = Object.keys(EXTRACT_METADATA).find(key => item.slug.toLowerCase().includes(key))
      if (matchedKey) {
        activeMarker = EXTRACT_METADATA[matchedKey].activeMarker
        defaultPct = EXTRACT_METADATA[matchedKey].defaultPct
      }

      return {
        slug: item.slug,
        name: item.displayName || item.name || item.slug,
        type: item.type,
        dosage: item.dosage || item.dose || '300 - 600 mg',
        activeMarker,
        defaultPct,
        administration: item.administration || item.time_of_day || 'Take with food/water',
        cycling: item.cycling || item.cycling_notes || 'No cycle required, but periodic breaks are healthy.'
      } as DosageItem
    })
  }, [herbs, compounds])

  const [selectedSlug, setSelectedSlug] = useState<string>(allItems[0]?.slug || '')
  const [weight, setWeight] = useState<number>(150)
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const [extractPct, setExtractPct] = useState<number>(0)

  // Find selected item details
  const selectedItem = useMemo(() => {
    return allItems.find(i => i.slug === selectedSlug) || allItems[0]
  }, [selectedSlug, allItems])

  // Sync extract percentage when item changes
  useEffect(() => {
    if (selectedItem) {
      setExtractPct(selectedItem.defaultPct || 10)
    }
  }, [selectedItem])

  // Set default extract percent when item changes
  const handleItemChange = (slug: string) => {
    setSelectedSlug(slug)
    const item = allItems.find(i => i.slug === slug)
    if (item) {
      setExtractPct(item.defaultPct || 10)
    }
  }

  // Parse dosage string to extract base bounds
  const baseRange = useMemo(() => {
    if (!selectedItem) return { min: 100, max: 500 }
    
    const doseStr = selectedItem.dosage || selectedItem.dose || ''
    // Regex to match numbers in strings (e.g. "300 - 600", "500mg", "1.5g")
    const matches = doseStr.match(/(\d+(?:\.\d+)?)/g)
    
    if (matches && matches.length >= 2) {
      let min = parseFloat(matches[0])
      let max = parseFloat(matches[1])
      // Handle gram scaling
      if (doseStr.toLowerCase().includes('g') && !doseStr.toLowerCase().includes('mg') && min < 10) {
        min *= 1000
        max *= 1000
      }
      return { min, max }
    } else if (matches && matches.length === 1) {
      let val = parseFloat(matches[0])
      if (doseStr.toLowerCase().includes('g') && !doseStr.toLowerCase().includes('mg') && val < 10) {
        val *= 1000
      }
      return { min: val * 0.8, max: val * 1.2 }
    }
    
    return { min: 300, max: 600 }
  }, [selectedItem])

  // Calculate customized dosage
  const calculatedDosage = useMemo(() => {
    // Weight factor (standardized around 150 lbs / 68 kg)
    const weightInLbs = weightUnit === 'lbs' ? weight : weight * 2.20462
    let weightFactor = 1.0

    if (weightInLbs < 120) {
      weightFactor = 0.8
    } else if (weightInLbs > 190) {
      weightFactor = 1.2
    }

    const minDose = Math.round(baseRange.min * weightFactor)
    const maxDose = Math.round(baseRange.max * weightFactor)

    // active yield based on extract percentage
    const minYield = Math.round(minDose * (extractPct / 100))
    const maxYield = Math.round(maxDose * (extractPct / 100))

    return {
      minDose,
      maxDose,
      minYield,
      maxYield
    }
  }, [baseRange, weight, weightUnit, extractPct])

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Parameter Settings Card */}
      <div className='lg:col-span-1 space-y-6'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-lg font-bold text-slate-800'>Dosing Parameters</h2>

          {/* Ingredient Selector */}
          <div className='space-y-1.5'>
            <label htmlFor="ingredient-select" className='text-xs font-bold uppercase tracking-wider text-slate-400'>
              Select Ingredient
            </label>
            <select
              id="ingredient-select"
              value={selectedSlug}
              onChange={e => handleItemChange(e.target.value)}
              className='w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white'
            >
              {allItems.map(item => (
                <option key={item.slug} value={item.slug}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
          </div>

          {/* Weight Input */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label htmlFor="body-weight-input" className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                Body Weight
              </label>
              <div className='flex rounded-lg overflow-hidden border border-slate-200 text-xs'>
                <button
                  onClick={() => setWeightUnit('lbs')}
                  type='button'
                  className={`px-2 py-0.5 font-bold ${weightUnit === 'lbs' ? 'bg-slate-200 text-slate-700' : 'text-slate-400'}`}
                >
                  LBS
                </button>
                <button
                  onClick={() => setWeightUnit('kg')}
                  type='button'
                  className={`px-2 py-0.5 font-bold ${weightUnit === 'kg' ? 'bg-slate-200 text-slate-700' : 'text-slate-400'}`}
                >
                  KG
                </button>
              </div>
            </div>
            <input
              id="body-weight-input"
              type='number'
              value={weight}
              onChange={e => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
              className='w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none'
            />
          </div>

          {/* Extract Percentage */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                Extract Active Concentration (%)
              </label>
              <span className='text-xs font-bold text-slate-500'>{extractPct}%</span>
            </div>
            <input
              type='range'
              min='0.1'
              max='98'
              step='0.1'
              value={extractPct}
              onChange={e => setExtractPct(parseFloat(e.target.value))}
              className='w-full accent-emerald-600'
            />
          </div>
        </div>
      </div>

      {/* Calculated Output Card */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          {/* Header */}
          <div className='border-b border-slate-100 pb-5'>
            <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800'>
              Customized Dosage Guide
            </span>
            <h2 className='mt-2 text-2xl font-bold text-slate-800 sm:text-3xl'>{selectedItem.name} Guide</h2>
            <p className='text-xs text-slate-400 mt-1'>
              Standard reference dose: <span className='font-semibold'>{selectedItem.dosage}</span>
            </p>
          </div>

          {/* Big Output Dosage Display */}
          <div className='rounded-2xl bg-slate-50/60 border border-slate-100 p-6 flex flex-col items-center justify-center text-center space-y-2'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
              Your Customized Educational Dose Range
            </span>
            <p className='text-3xl font-black text-emerald-800 sm:text-4xl'>
              {calculatedDosage.minDose} – {calculatedDosage.maxDose} mg
            </p>
            <p className='text-xs text-slate-500'>
              Scale factor applied: Weight ({weight} {weightUnit})
            </p>
          </div>

          {/* Molecular Active Yield */}
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='rounded-2xl border border-slate-100 bg-white p-5 space-y-2.5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                {selectedItem.activeMarker} Yield
              </h3>
              <p className='text-xl font-bold text-slate-800'>
                {calculatedDosage.minYield} – {calculatedDosage.maxYield} mg
              </p>
              <p className='text-xs text-slate-500 leading-relaxed'>
                Based on your {extractPct}% active chemical marker extract input, taking this range yields these actual active molecules.
              </p>
            </div>

            {/* Cycling notes */}
            <div className='rounded-2xl border border-slate-100 bg-white p-5 space-y-2.5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                Cycling Recommendations
              </h3>
              <p className='text-xs leading-relaxed text-slate-700 font-medium'>
                {selectedItem.cycling}
              </p>
              <p className='text-[10px] text-slate-400 leading-normal'>
                Periodic breaks prevent receptor down-regulation or adaptation.
              </p>
            </div>
          </div>

          {/* Administration instructions */}
          <div className='rounded-2xl bg-emerald-50/20 border border-emerald-100/50 p-5 space-y-2 text-sm text-slate-700'>
            <h3 className='font-bold text-emerald-800 text-xs uppercase tracking-wider'>
              Administration & Bioavailability
            </h3>
            <p className='text-xs leading-relaxed opacity-95'>
              {selectedItem.administration}
            </p>
          </div>

          {/* Internal Navigation links */}
          <div className='pt-3 flex items-center justify-between border-t border-slate-100 text-xs'>
            <span className='text-slate-400'>Need detailed safety warning context?</span>
            <Link
              href={selectedItem.type === 'herb' ? `/herbs/${selectedItem.slug}` : `/compounds/${selectedItem.slug}`}
              className='text-emerald-700 hover:underline font-bold'
            >
              Open Full Monograph Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
