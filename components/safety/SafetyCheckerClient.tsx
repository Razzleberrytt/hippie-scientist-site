'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '@/lib/growth'
import {
  MEDICATION_CLASSES,
  buildSafetyShareSearch,
  combinationAnalyticsKey,
  parseSafetyShareSearch,
  screenSafetySelection,
  type MedicationClass,
  type SafetyToolItem,
} from '@/lib/safety-checker-engine'

interface SafetyCheckerClientProps {
  herbs: SafetyToolItem[]
  compounds: SafetyToolItem[]
}

const evidenceLabels = {
  documented: 'Documented interaction evidence',
  'structured-signal': 'Structured safety signal',
  'theoretical-additive': 'Theoretical additive concern',
  unknown: 'Evidence not classified',
} as const

const mechanismLabels = {
  pharmacokinetic: 'Pharmacokinetic',
  pharmacodynamic: 'Pharmacodynamic',
  mixed: 'Mixed PK / PD',
  unclear: 'Mechanism unclear',
} as const

export default function SafetyCheckerClient({ herbs, compounds }: SafetyCheckerClientProps) {
  const allItems = useMemo(() => [...herbs, ...compounds], [herbs, compounds])
  const [query, setQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<SafetyToolItem[]>([])
  const [selectedMeds, setSelectedMeds] = useState<MedicationClass[]>([])
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const parsed = parseSafetyShareSearch(window.location.search)
    const itemByToken = new Map(allItems.map((item) => [`${item.type}:${item.slug}`, item]))
    setSelectedItems(parsed.items.flatMap((token) => itemByToken.get(token) ? [itemByToken.get(token)!] : []))
    setSelectedMeds(parsed.meds.flatMap((id) => {
      const medication = MEDICATION_CLASSES.find((item) => item.id === id)
      return medication ? [medication] : []
    }))
    setHydrated(true)
  }, [allItems])

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return allItems
      .filter((item) => !selectedItems.some((selected) => selected.type === item.type && selected.slug === item.slug))
      .filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(needle))
      .slice(0, 10)
  }, [allItems, selectedItems, query])

  const alerts = useMemo(() => screenSafetySelection(selectedItems, selectedMeds), [selectedItems, selectedMeds])
  const incompleteItems = selectedItems.filter((item) => item.incomplete_safety_data)
  const selectionCount = selectedItems.length + selectedMeds.length
  const shareSearch = useMemo(() => buildSafetyShareSearch(selectedItems, selectedMeds), [selectedItems, selectedMeds])
  const analyticsKey = useMemo(() => combinationAnalyticsKey(selectedItems, selectedMeds), [selectedItems, selectedMeds])

  useEffect(() => {
    if (!hydrated || selectionCount < 2 || !analyticsKey) return
    const timer = window.setTimeout(() => {
      trackEvent('search_used', {
        kind: 'safety-checker',
        query: analyticsKey,
        selected_count: selectionCount,
        alert_count: alerts.length,
      })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [hydrated, analyticsKey, selectionCount, alerts.length])

  const addItem = (item: SafetyToolItem) => {
    setSelectedItems((current) => [...current, item].slice(0, 8))
    setQuery('')
  }

  const toggleMedication = (medication: MedicationClass) => {
    setSelectedMeds((current) => current.some((item) => item.id === medication.id)
      ? current.filter((item) => item.id !== medication.id)
      : [...current, medication].slice(0, 6))
  }

  const clear = () => {
    setSelectedItems([])
    setSelectedMeds([])
    setQuery('')
    if (typeof window !== 'undefined') window.history.replaceState(null, '', window.location.pathname)
  }

  const copyShareUrl = async () => {
    const url = `${window.location.origin}${window.location.pathname}${shareSearch}`
    try {
      await navigator.clipboard.writeText(url)
      window.history.replaceState(null, '', `${window.location.pathname}${shareSearch}`)
      setShareStatus('copied')
    } catch {
      setShareStatus('failed')
    }
    window.setTimeout(() => setShareStatus('idle'), 1800)
  }

  return (
    <section className='space-y-6' aria-label='Safety interaction checker'>
      <div className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
        <div className='grid gap-5 lg:grid-cols-[1.1fr_0.9fr]'>
          <div>
            <label htmlFor='safety-checker-search' className='text-sm font-bold text-ink'>Add an herb, supplement, or compound</label>
            <p className='mt-1 text-xs leading-5 text-muted'>Search uses public ingredient names only. The checker does not ask for a diagnosis, dose, age, pregnancy status, or other personal health information.</p>
            <input id='safety-checker-search' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Try ashwagandha, melatonin, caffeine…' className='mt-3 w-full rounded-xl border border-brand-900/15 bg-white px-4 py-3 text-sm text-ink' autoComplete='off' />
            {searchResults.length ? (
              <div className='mt-2 overflow-hidden rounded-xl border border-brand-900/10 bg-white shadow-sm' role='listbox' aria-label='Ingredient search results'>
                {searchResults.map((item) => <button key={`${item.type}:${item.slug}`} type='button' onClick={() => addItem(item)} className='flex w-full items-center justify-between border-b border-brand-900/5 px-4 py-3 text-left last:border-b-0 hover:bg-brand-50'><span><strong className='text-ink'>{item.name}</strong><span className='ml-2 text-xs uppercase tracking-wide text-muted'>{item.type}</span></span><span aria-hidden='true' className='text-indigo-800'>Add +</span></button>)}
              </div>
            ) : null}
          </div>

          <div>
            <p className='text-sm font-bold text-ink'>Optional medication classes</p>
            <p className='mt-1 text-xs leading-5 text-muted'>These are broad education categories, not a medication-specific interaction database. Use the exact medicine name with a pharmacist or medication interaction resource.</p>
            <div className='mt-3 grid gap-2 sm:grid-cols-2'>
              {MEDICATION_CLASSES.map((medication) => {
                const active = selectedMeds.some((item) => item.id === medication.id)
                return <button key={medication.id} type='button' aria-pressed={active} onClick={() => toggleMedication(medication)} className={`rounded-xl border p-3 text-left text-sm ${active ? 'border-indigo-900 bg-indigo-50' : 'border-brand-900/10 bg-white hover:bg-brand-50'}`}><strong className='block text-ink'>{medication.name}</strong><span className='mt-1 block text-xs leading-5 text-muted'>{medication.description}</span></button>
              })}
            </div>
          </div>
        </div>
      </div>

      {selectionCount ? (
        <div className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div><p className='eyebrow-label'>Current screen</p><h2 className='mt-1 text-xl font-bold text-ink'>{selectionCount} selected item{selectionCount === 1 ? '' : 's'}</h2></div>
            <div className='flex flex-wrap gap-3 text-sm'><button type='button' onClick={copyShareUrl} className='font-bold text-indigo-800 hover:underline'>{shareStatus === 'copied' ? 'Share link copied ✓' : shareStatus === 'failed' ? 'Could not copy link' : 'Copy shareable result link'}</button><button type='button' onClick={clear} className='font-bold text-muted hover:text-ink'>Clear all</button></div>
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            {selectedItems.map((item) => <button key={`${item.type}:${item.slug}`} type='button' onClick={() => setSelectedItems((current) => current.filter((selected) => !(selected.type === item.type && selected.slug === item.slug)))} className='rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-ink' aria-label={`Remove ${item.name}`}>{item.name} ×</button>)}
            {selectedMeds.map((medication) => <button key={medication.id} type='button' onClick={() => toggleMedication(medication)} className='rounded-full border border-indigo-900/15 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-950' aria-label={`Remove ${medication.name}`}>{medication.name} ×</button>)}
          </div>
          <p className='mt-3 text-xs leading-5 text-muted'>The share URL contains only public ingredient slugs and medication-class IDs. It does not encode free text or personal health details.</p>
        </div>
      ) : null}

      {incompleteItems.length ? <div className='rounded-2xl border border-amber-900/20 bg-amber-50 p-5 text-sm leading-6 text-amber-950'><strong>Incomplete safety data:</strong> {incompleteItems.map((item) => item.name).join(', ')} {incompleteItems.length === 1 ? 'has' : 'have'} limited structured safety metadata in this dataset. That is not evidence of safety and lowers what this checker can conclude.</div> : null}

      {selectionCount >= 2 ? (
        <section className='space-y-4' aria-live='polite'>
          <div><p className='eyebrow-label'>Screening result</p><h2 className='mt-1 text-2xl font-bold text-ink'>{alerts.length ? `${alerts.length} overlap${alerts.length === 1 ? '' : 's'} to review` : 'No documented overlap found in our dataset'}</h2><p className='mt-2 max-w-4xl text-sm leading-6 text-muted'>{alerts.length ? 'Each card explains why it was flagged, how the interaction is classified, how certain the data is, and what remains unknown.' : 'This does not mean “no interaction.” It means this rule set did not find a qualifying overlap in the structured fields available for the selected items.'}</p></div>
          {!alerts.length ? <div className='rounded-2xl border border-sky-900/15 bg-sky-50 p-5 text-sm leading-6 text-sky-950'><strong>No documented interaction in our dataset.</strong> Evidence may be absent, incomplete, newly published, dose-specific, product-specific, or outside the categories this checker models. Do not interpret this result as clearance to combine the selected items.</div> : null}
          <div className='grid gap-4'>
            {alerts.map((alert) => <article key={alert.id} className={`rounded-2xl border p-5 shadow-sm ${alert.severity === 'higher-review' ? 'border-rose-900/20 bg-rose-50/70' : 'border-amber-900/15 bg-amber-50/60'}`}>
              <div className='flex flex-wrap items-start justify-between gap-3'><div><p className='text-xs font-bold uppercase tracking-wide text-muted'>{alert.signal}</p><h3 className='mt-1 text-lg font-bold text-ink'>{alert.title}</h3></div><span className='rounded-full border border-brand-900/10 bg-white px-2.5 py-1 text-xs font-bold text-ink'>{evidenceLabels[alert.evidenceClass]}</span></div>
              <div className='mt-4 grid gap-4 md:grid-cols-3'><div><p className='text-xs font-bold uppercase tracking-wide text-muted'>Why this was flagged</p><p className='mt-1 text-sm leading-6 text-ink'>{alert.whyFlagged}</p></div><div><p className='text-xs font-bold uppercase tracking-wide text-muted'>Interaction mechanism</p><p className='mt-1 text-sm font-semibold text-ink'>{mechanismLabels[alert.mechanismClass]}</p><p className='mt-1 text-xs text-muted'>Confidence: {alert.confidence}</p></div><div><p className='text-xs font-bold uppercase tracking-wide text-muted'>Uncertainty</p><p className='mt-1 text-sm leading-6 text-muted'>{alert.uncertainty}</p></div></div>
              {alert.sources.length ? <div className='mt-4'><p className='text-xs font-bold uppercase tracking-wide text-muted'>Source identifiers / links carried by the record</p><ul className='mt-2 space-y-1 text-xs text-muted'>{alert.sources.map((source) => <li key={source} className='break-all'>{/^https?:\/\//i.test(source) ? <a href={source} target='_blank' rel='noreferrer' className='font-semibold text-indigo-800 underline'>Open source</a> : source}</li>)}</ul></div> : <p className='mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs text-muted'>No interaction-specific source link is attached to this structured warning yet. Treat the evidence classification conservatively and open the ingredient profiles for their full references.</p>}
            </article>)}
          </div>
        </section>
      ) : <div className='rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm leading-6 text-muted'>Add at least two ingredients/classes to screen for overlapping signals. You can also open a single ingredient’s profile below to inspect its complete safety section.</div>}

      {selectedItems.length ? <section className='space-y-3'><div><p className='eyebrow-label'>Full safety profiles</p><h2 className='mt-1 text-xl font-bold text-ink'>Trace each flag to the ingredient record</h2></div><div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>{selectedItems.map((item) => <Link key={`${item.type}:${item.slug}`} href={item.type === 'herb' ? `/herbs/${item.slug}/` : `/compounds/${item.slug}/`} className='rounded-xl border border-brand-900/10 bg-white p-4 shadow-sm hover:border-indigo-900/20'><strong className='text-ink'>{item.name}</strong><span className='mt-1 block text-sm font-semibold text-indigo-800'>Open full safety profile →</span></Link>)}</div></section> : null}
    </section>
  )
}
