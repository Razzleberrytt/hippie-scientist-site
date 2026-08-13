'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { isRestrictedRecord } from '../../lib/restricted-ingredients'

interface DosageItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  dosage?: string
  dose?: string
}

interface DosageCalculatorClientProps {
  herbs: any[]
  compounds: any[]
}

type ParsedDose = {
  minMg: number
  maxMg: number
  isRange: boolean
}

function parseRecordedDose(value?: string): ParsedDose | null {
  const source = String(value || '').trim()
  if (!source) return null

  const lower = source.toLowerCase()
  const hasMg = /\bmg\b/.test(lower)
  const hasGram = /\bg\b|grams?/.test(lower)

  // Mixed-unit strings need source-specific interpretation. Do not guess.
  if (hasMg && hasGram) return null
  if (!hasMg && !hasGram) return null

  const matches = source.match(/\d+(?:\.\d+)?/g)
  if (!matches?.length) return null

  const values = matches.slice(0, 2).map(Number)
  if (values.some(value => !Number.isFinite(value) || value < 0)) return null

  const multiplier = hasGram ? 1000 : 1
  const first = values[0] * multiplier
  const second = (values[1] ?? values[0]) * multiplier

  return {
    minMg: Math.min(first, second),
    maxMg: Math.max(first, second),
    isRange: values.length > 1,
  }
}

function formatMg(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
}

export default function DosageCalculatorClient({ herbs, compounds }: DosageCalculatorClientProps) {
  const allItems = useMemo(() => {
    return [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ]
      .filter(item => !isRestrictedRecord(item))
      .map(item => ({
        slug: item.slug,
        name: item.displayName || item.name || item.slug,
        type: item.type,
        dosage: item.dosage || item.dose,
      }) as DosageItem)
  }, [herbs, compounds])

  const [selectedSlug, setSelectedSlug] = useState<string>(allItems[0]?.slug || '')
  const [extractPct, setExtractPct] = useState<number>(0)

  const selectedItem = useMemo(() => {
    return allItems.find(item => item.slug === selectedSlug) || allItems[0]
  }, [selectedSlug, allItems])

  useEffect(() => {
    setExtractPct(0)
  }, [selectedSlug])

  const parsedDose = useMemo(
    () => parseRecordedDose(selectedItem?.dosage || selectedItem?.dose),
    [selectedItem],
  )

  const activeYield = useMemo(() => {
    if (!parsedDose || extractPct <= 0) return null
    return {
      min: parsedDose.minMg * (extractPct / 100),
      max: parsedDose.maxMg * (extractPct / 100),
    }
  }, [parsedDose, extractPct])

  if (!selectedItem) {
    return (
      <div className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 text-sm text-muted'>
        No published ingredient records are available for this tool yet.
      </div>
    )
  }

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      <div className='space-y-6 lg:col-span-1'>
        <div className='space-y-4 rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
          <h2 className='text-lg font-bold text-slate-800'>Dose-math inputs</h2>

          <div className='space-y-1.5'>
            <label htmlFor='ingredient-select' className='text-xs font-bold uppercase tracking-wider text-slate-400'>
              Select ingredient
            </label>
            <select
              id='ingredient-select'
              value={selectedSlug}
              onChange={event => setSelectedSlug(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none'
            >
              {allItems.map(item => (
                <option key={`${item.type}:${item.slug}`} value={item.slug}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between gap-3'>
              <label htmlFor='active-marker-percent' className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                Active marker on your label (%)
              </label>
              <span className='text-xs font-bold text-slate-500'>{extractPct}%</span>
            </div>
            <input
              id='active-marker-percent'
              type='range'
              min='0'
              max='100'
              step='0.1'
              value={extractPct}
              onChange={event => setExtractPct(Number(event.target.value))}
              className='w-full accent-emerald-600'
            />
            <p className='text-xs leading-5 text-slate-500'>
              Enter the percentage printed on the specific product label. The tool does not assume a standardization for you.
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-6 lg:col-span-2'>
        <div className='space-y-6 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
          <div className='border-b border-slate-100 pb-5'>
            <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700'>
              Study / monograph context only
            </span>
            <h2 className='mt-2 text-2xl font-bold text-slate-800 sm:text-3xl'>{selectedItem.name} dose math</h2>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              This tool does not calculate a personalized dose. It only translates a recorded amount into milligrams and, when you provide a label percentage, estimates the corresponding active-marker amount.
            </p>
          </div>

          <div className='rounded-2xl border border-slate-100 bg-slate-50/60 p-6'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Recorded source context</p>
            {selectedItem.dosage ? (
              <p className='mt-2 text-xl font-bold text-slate-800'>{selectedItem.dosage}</p>
            ) : (
              <p className='mt-2 text-sm font-semibold text-slate-600'>No dose range is recorded for this profile.</p>
            )}
            <p className='mt-2 text-xs leading-5 text-slate-500'>
              Population, formulation, extract, indication, and study design can make one published amount inappropriate to generalize to another person or product.
            </p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='space-y-2.5 rounded-2xl border border-slate-100 bg-white p-5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Parsed amount</h3>
              {parsedDose ? (
                <p className='text-xl font-bold text-slate-800'>
                  {formatMg(parsedDose.minMg)}{parsedDose.isRange ? ` – ${formatMg(parsedDose.maxMg)}` : ''} mg
                </p>
              ) : (
                <p className='text-sm font-semibold text-slate-600'>No safe automatic conversion available.</p>
              )}
              <p className='text-xs leading-relaxed text-slate-500'>
                Automatic conversion is limited to simple all-mg or all-gram source strings. Mixed or ambiguous units are left uninterpreted rather than guessed.
              </p>
            </div>

            <div className='space-y-2.5 rounded-2xl border border-slate-100 bg-white p-5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Active-marker arithmetic</h3>
              {activeYield ? (
                <p className='text-xl font-bold text-slate-800'>
                  {formatMg(activeYield.min)}{parsedDose?.isRange ? ` – ${formatMg(activeYield.max)}` : ''} mg
                </p>
              ) : (
                <p className='text-sm font-semibold text-slate-600'>Set the label percentage to calculate.</p>
              )}
              <p className='text-xs leading-relaxed text-slate-500'>
                This is multiplication only: recorded amount × the percentage you entered. It is not a potency, efficacy, or safety recommendation.
              </p>
            </div>
          </div>

          <div className='rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-sm leading-6 text-amber-950'>
            <p className='font-bold'>Do not scale this number by body weight.</p>
            <p className='mt-1'>
              Unless the underlying source explicitly studied weight-based dosing, body size alone is not a valid reason to multiply a supplement amount up or down. Check the full profile for formulation, interactions, population, and safety context.
            </p>
          </div>

          <div className='flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-xs'>
            <span className='text-slate-400'>Need the evidence and safety context behind the record?</span>
            <Link
              href={selectedItem.type === 'herb' ? `/herbs/${selectedItem.slug}` : `/compounds/${selectedItem.slug}`}
              className='font-bold text-emerald-700 hover:underline'
            >
              Open full profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
