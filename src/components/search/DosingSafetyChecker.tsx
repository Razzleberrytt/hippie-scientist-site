'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react'
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

  const selectableItems = useMemo(() => {
    return items
      .filter(item => item.name && item.slug && !isRestrictedRecord(item))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const selectedItem = useMemo(() => {
    return items.find(item => item.slug === selectedSlug)
  }, [selectedSlug, items])

  const avoidIfList = useMemo(() => {
    if (!selectedItem) return []
    return [
      ...(selectedItem.avoid_if || []),
      ...(selectedItem.contraindications || []),
      ...(selectedItem.interactions || []),
    ].filter(Boolean)
  }, [selectedItem])

  const profileHref = selectedItem
    ? selectedItem.type === 'Herb'
      ? `/herbs/${selectedItem.slug}`
      : `/compounds/${selectedItem.slug}`
    : null

  return (
    <section className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/15 p-4 shadow-sm sm:p-6" aria-labelledby="dosing-calculator-heading">
      <div className="space-y-2">
        <p className="eyebrow-label text-amber-800">Safety Reference</p>
        <h2 id="dosing-calculator-heading" className="compact-heading text-ink">Dose Context &amp; Safety Checker</h2>
        <p className="text-sm leading-6 text-muted">
          Select an herb or compound to inspect the dose text and safety constraints currently mapped to its profile. This checker does not calculate a personalized dose.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="substance-select" className="text-xs font-bold uppercase tracking-wider text-muted">Choose substance</label>
            <select
              id="substance-select"
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-700/30 focus:ring-2 focus:ring-brand-700/20"
            >
              <option value="">-- Select Substance --</option>
              {selectableItems.map(item => (
                <option key={`${item.type}:${item.slug}`} value={item.slug}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-brand-900/10 bg-white/70 p-3 text-xs leading-5 text-muted">
            <strong className="text-ink">No body-weight scaling.</strong> A dose from one study or monograph should not be multiplied up or down from body size unless that exact source establishes a weight-based regimen.
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-brand-900/10 md:block" />

        <div className="min-h-[14rem] rounded-xl border border-brand-900/5 bg-white/70 p-4">
          {!selectedItem ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted">
              <Info className="mb-2 h-8 w-8 text-brand-900/25" />
              <p className="text-sm">Select a substance to show recorded dose context and mapped safety information.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  selectedItem.type === 'Herb'
                    ? 'border-emerald-700/10 bg-emerald-50 text-emerald-800'
                    : 'border-blue-700/10 bg-blue-50 text-blue-800'
                }`}>
                  {selectedItem.type} Profile
                </span>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">{selectedItem.name}</h3>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Recorded dose context</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {selectedItem.typical_dosage || selectedItem.dosage || 'No dose context is mapped in this quick index.'}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Treat this as source context, not an instruction. Formulation, population, indication, duration, and study design determine whether a number is transferable.
                </p>
              </div>

              {selectedItem.safety ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Mapped safety summary</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{selectedItem.safety}</p>
                </div>
              ) : null}

              {avoidIfList.length > 0 ? (
                <div className="space-y-2 rounded-lg border border-amber-600/10 bg-amber-50/45 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                    <span>Mapped constraints &amp; interactions</span>
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-[11px] leading-relaxed text-amber-950/85">
                    {avoidIfList.slice(0, 3).map((item, index) => (
                      <li key={`${item}:${index}`}>{item}</li>
                    ))}
                    {avoidIfList.length > 3 ? (
                      <li className="mt-1 list-none text-[10px] italic text-muted">
                        + {avoidIfList.length - 3} more. Open the full profile for the complete mapped list.
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-slate-300/60 bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                  <span>No detailed constraints are mapped in this quick index. That is a missing-data state, not evidence that the substance is low risk.</span>
                </div>
              )}

              {profileHref ? (
                <Link href={profileHref} className="inline-flex text-xs font-bold text-emerald-700 hover:underline">
                  Open full evidence &amp; safety profile →
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2.5 rounded-lg border border-amber-200/50 bg-amber-50/30 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-[11px] leading-relaxed text-amber-900">
          <strong>Safety boundary:</strong> This quick checker can surface what is already mapped, but it cannot determine an appropriate personal dose, rule out interactions, or substitute for product-specific and person-specific medical guidance.
        </p>
      </div>
    </section>
  )
}
