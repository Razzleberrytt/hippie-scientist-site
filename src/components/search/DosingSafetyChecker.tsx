'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Info, Weight, ShieldAlert } from 'lucide-react'
import { isRestrictedRecord } from '../../lib/restricted-ingredients'

type SubstanceItem = {
  slug: string
  name: string
  type: 'Herb' | 'Compound'
  dosage?: string
  safety?: string
  effects: string[]
  evidence: string
  typical_dosage?: string
  avoid_if?: string[]
  side_effects?: string[]
  contraindications?: string[]
  interactions?: string[]
}

type DosingSafetyCheckerProps = {
  items: SubstanceItem[]
}

export default function DosingSafetyChecker({ items }: DosingSafetyCheckerProps) {
  const [selectedSlug, setSelectedSlug] = useState('')
  const [weight, setWeight] = useState<number | ''>('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')

  // Filter list to only items that have name/slug; exclude restricted (no dosing UI for controlled/high-risk substances)
  const selectableItems = useMemo(() => {
    return items
      .filter(item => item.name && item.slug && !isRestrictedRecord(item))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const selectedItem = useMemo(() => {
    return items.find(item => item.slug === selectedSlug)
  }, [selectedSlug, items])

  const weightInKg = useMemo(() => {
    if (weight === '' || Number.isNaN(weight) || weight <= 0) return null
    return weightUnit === 'kg' ? weight : weight * 0.45359237
  }, [weight, weightUnit])

  // Weight-based dosing calculations for specific high-signal compounds
  const weightBasedDosing = useMemo(() => {
    if (!selectedItem || !weightInKg) return null

    const slug = selectedItem.slug.toLowerCase()

    if (slug === 'creatine') {
      const maintenanceMin = (weightInKg * 0.03).toFixed(1)
      const maintenanceMax = (weightInKg * 0.05).toFixed(1)
      const loading = (weightInKg * 0.3).toFixed(1)
      return {
        title: 'Creatine Monohydrate Weight-Scaled Guidance',
        calc: `Based on your weight (${weightInKg.toFixed(1)} kg):`,
        formulas: [
          { label: 'Maintenance Dose', value: `${maintenanceMin}g – ${maintenanceMax}g per day`, note: 'Standard daily support dose.' },
          { label: 'Loading Phase Dose', value: `${loading}g per day`, note: 'Optional. Split into 4 daily doses (e.g. 5g each) for 5–7 days.' }
        ]
      }
    }

    if (slug === 'theanine' || slug === 'l-theanine') {
      const theanineMin = (weightInKg * 1.5).toFixed(0)
      const theanineMax = (weightInKg * 3.0).toFixed(0)
      return {
        title: 'L-Theanine Weight-Scaled Guidance',
        calc: `Based on your weight (${weightInKg.toFixed(1)} kg):`,
        formulas: [
          { label: 'Calm Focus Dose', value: `${theanineMin}mg – ${theanineMax}mg`, note: 'Often paired with caffeine in a 2:1 ratio to balance jitters.' }
        ]
      }
    }

    if (slug === 'caffeine') {
      const caffeineMin = (weightInKg * 1.0).toFixed(0)
      const caffeineMax = (weightInKg * 3.0).toFixed(0)
      return {
        title: 'Caffeine Weight-Scaled Guidance',
        calc: `Based on your weight (${weightInKg.toFixed(1)} kg):`,
        formulas: [
          { label: 'Mild to Moderate Stimulation', value: `${caffeineMin}mg – ${caffeineMax}mg`, note: 'A standard single cup of coffee contains ~80–100mg caffeine.' }
        ]
      }
    }

    if (slug === 'ashwagandha') {
      const ashMin = (weightInKg * 4.0).toFixed(0)
      const ashMax = (weightInKg * 8.0).toFixed(0)
      return {
        title: 'Ashwagandha Standardized Extract Guidance',
        calc: `Based on your weight (${weightInKg.toFixed(1)} kg):`,
        formulas: [
          { label: 'Standardized Extract (KSM-66 style)', value: `${ashMin}mg – ${ashMax}mg per day`, note: 'Typically split into two daily doses. Review liver warnings.' }
        ]
      }
    }

    return null
  }, [selectedItem, weightInKg])

  const avoidIfList = useMemo(() => {
    if (!selectedItem) return []
    return [
      ...(selectedItem.avoid_if || []),
      ...(selectedItem.contraindications || []),
      ...(selectedItem.interactions || [])
    ].filter(Boolean)
  }, [selectedItem])

  return (
    <section className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/15 p-4 sm:p-6 shadow-sm" aria-labelledby="dosing-calculator-heading">
      <div className="space-y-2">
        <p className="eyebrow-label text-amber-800">Safety Reference</p>
        <h2 id="dosing-calculator-heading" className="compact-heading text-ink">Dosing & Safety Reference Checker</h2>
        <p className="text-sm leading-6 text-muted">
          Select an herb or compound to view monograph-derived typical dosages, safety alerts, and weight-scaled calculations.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Input Controls */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="substance-select" className="text-xs font-bold uppercase tracking-wider text-muted">Choose substance</label>
            <select
              id="substance-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-600/30 focus:ring-2 focus:ring-brand-500/15"
            >
              <option value="">-- Select Substance --</option>
              {selectableItems.map(item => (
                <option key={item.slug} value={item.slug}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="weight-input" className="text-xs font-bold uppercase tracking-wider text-muted">Your weight (Optional)</label>
            <div className="flex gap-2">
              <input
                id="weight-input"
                type="number"
                min="1"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="min-h-11 flex-1 rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-600/30 focus:ring-2 focus:ring-brand-500/15"
              />
              <button
                type="button"
                onClick={() => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg')}
                className="min-h-11 inline-flex items-center justify-center rounded-xl border border-brand-900/10 bg-white px-3 text-xs font-bold text-ink hover:bg-slate-50 transition"
              >
                <Weight className="mr-1 h-3.5 w-3.5 text-muted" />
                {weightUnit.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden md:block w-px bg-brand-900/10 self-stretch" />

        {/* Results Panel */}
        <div className="rounded-xl border border-brand-900/5 bg-white/70 p-4 min-h-[14rem]">
          {!selectedItem ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted p-4">
              <Info className="h-8 w-8 mb-2 text-brand-900/25" />
              <p className="text-sm">Select a substance on the left to show dosage guidelines and safety checks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  selectedItem.type === 'Herb'
                    ? 'border-emerald-700/10 bg-emerald-50 text-emerald-800'
                    : 'border-blue-700/10 bg-blue-50 text-blue-800'
                }`}>
                  {selectedItem.type} Monograph
                </span>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">{selectedItem.name}</h3>
              </div>

              {/* Monograph Dosage */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Typical Dosage Guideline</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {selectedItem.typical_dosage || selectedItem.dosage || 'Refer to detail page for specific preparation forms.'}
                </p>
              </div>

              {/* Weight-Scaled Custom Dosing */}
              {weightBasedDosing ? (
                <div className="rounded-lg border border-emerald-600/10 bg-emerald-50/30 p-3 space-y-2">
                  <p className="text-xs font-bold text-emerald-800">{weightBasedDosing.title}</p>
                  <p className="text-[10px] text-muted leading-none">{weightBasedDosing.calc}</p>
                  <div className="space-y-2">
                    {weightBasedDosing.formulas.map(f => (
                      <div key={f.label} className="text-xs">
                        <span className="font-semibold text-emerald-950">{f.label}: </span>
                        <span className="font-bold text-emerald-900 bg-emerald-100/50 px-1 rounded">{f.value}</span>
                        <p className="text-[10px] text-muted mt-0.5 leading-relaxed">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : weightInKg && (
                <div className="rounded-lg border border-brand-900/5 bg-slate-50/50 p-3">
                  <p className="text-xs text-muted leading-relaxed">
                    No weight-based formulas are clinically standardized for {selectedItem.name}. Standard dosing is independent of body weight; refer to typical guidelines.
                  </p>
                </div>
              )}

              {/* Safety Alerts */}
              {avoidIfList.length > 0 ? (
                <div className="rounded-lg border border-amber-600/10 bg-amber-50/45 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                    <span>Safety Constraints & Avoid If:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-amber-950/85">
                    {avoidIfList.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="truncate" title={item}>{item}</li>
                    ))}
                    {avoidIfList.length > 3 && (
                      <li className="list-none text-[10px] text-muted italic mt-1">
                        + {avoidIfList.length - 3} more. Check the full profile page.
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-600/10 bg-emerald-50/20 p-3 flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>No severe specific warnings mapped in quick index. Standard dietary supplement cautions apply.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200/50 bg-amber-50/30 p-3 flex gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-amber-900">
          <strong>Clinical Disclaimer:</strong> Personalized supplement dosing must take into account medical history, medications, pregnancy status, and product standardization targets. These calculations are strictly educational starting benchmarks. Never scale doses beyond standard manufacturer specifications without consulting a licensed physician.
        </p>
      </div>
    </section>
  )
}
