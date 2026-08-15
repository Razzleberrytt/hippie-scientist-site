'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  normalizeResearchSearchItem,
  parseComparisonKey,
  type ResearchSearchItem,
} from '@/lib/search/search-experience'
import { isRestrictedRecord } from '@/src/lib/restricted-ingredients'
import { publicSafetyLabel } from '@/lib/decision-primitives'

type LoadState = 'loading' | 'ready' | 'invalid' | 'missing'

function ComparisonColumn({ item }: { item: ResearchSearchItem }) {
  return (
    <article className='rounded-[1.5rem] border border-brand-900/10 bg-white/95 p-5 shadow-sm sm:p-7'>
      <p className='eyebrow-label'>{item.type}</p>
      <h2 className='mt-2 text-3xl font-bold tracking-tight text-ink'>{item.name}</h2>
      {item.scientificNames[0] ? <p className='mt-1 text-sm italic text-muted'>{item.scientificNames[0]}</p> : null}
      <p className='mt-4 text-sm leading-7 text-muted'>{item.summary}</p>

      <dl className='mt-6 space-y-4'>
        <div className='rounded-xl border border-brand-900/10 bg-brand-50/45 p-4'>
          <dt className='text-xs font-bold uppercase tracking-[0.14em] text-brand-800'>Evidence</dt>
          <dd className='mt-1 text-sm font-semibold text-ink'>{item.evidence}</dd>
        </div>
        <div className='rounded-xl border border-brand-900/10 bg-brand-50/45 p-4'>
          <dt className='text-xs font-bold uppercase tracking-[0.14em] text-brand-800'>Safety</dt>
          <dd className='mt-1 text-sm font-semibold text-ink'>{publicSafetyLabel(item.safety)}</dd>
        </div>
        <div className='rounded-xl border border-brand-900/10 bg-brand-50/45 p-4'>
          <dt className='text-xs font-bold uppercase tracking-[0.14em] text-brand-800'>Studied dose / preparation context</dt>
          <dd className='mt-1 text-sm leading-6 text-ink'>{item.typicalDosage || 'No sufficiently specific dose summary is available in this comparison dataset.'}</dd>
        </div>
      </dl>

      {item.outcomes.length > 0 || item.conditions.length > 0 ? (
        <section className='mt-6'>
          <h3 className='text-sm font-bold uppercase tracking-[0.14em] text-ink'>Outcome / condition context</h3>
          <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
            {[...item.outcomes, ...item.conditions].slice(0, 6).map((value) => <li key={value}>• {value}</li>)}
          </ul>
        </section>
      ) : null}

      {item.mechanisms.length > 0 ? (
        <section className='mt-6'>
          <h3 className='text-sm font-bold uppercase tracking-[0.14em] text-ink'>Mechanisms / pathways</h3>
          <p className='mt-1 text-xs leading-5 text-muted'>Mechanistic overlap is research context, not proof of the same clinical effect.</p>
          <div className='mt-3 flex flex-wrap gap-2'>
            {item.mechanisms.slice(0, 6).map((value) => <span key={value} className='rounded-full border border-brand-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-muted'>{value}</span>)}
          </div>
        </section>
      ) : null}

      <Link href={item.href} className='mt-7 inline-flex min-h-11 items-center rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900'>Open full profile →</Link>
    </article>
  )
}

export default function OnDemandComparisonClient() {
  const [items, setItems] = useState<ResearchSearchItem[]>([])
  const [state, setState] = useState<LoadState>('loading')

  const requested = useMemo(() => {
    if (typeof window === 'undefined') return []
    const params = new URLSearchParams(window.location.search)
    return [params.get('left') || '', params.get('right') || ''].map(parseComparisonKey)
  }, [])

  useEffect(() => {
    if (requested.length !== 2 || requested.some((entry) => !entry)) {
      setState('invalid')
      return
    }

    let active = true
    Promise.all([
      fetch('/data/herbs-summary.json').then((response) => response.json()),
      fetch('/data/compounds-summary.json').then((response) => response.json()),
    ]).then(([herbData, compoundData]) => {
      if (!active) return
      const sources = {
        Herb: Array.isArray(herbData) ? herbData as Record<string, unknown>[] : [],
        Compound: Array.isArray(compoundData) ? compoundData as Record<string, unknown>[] : [],
      }

      const resolved = requested.map((request) => {
        if (!request) return null
        const record = sources[request.type].find((candidate) => {
          const raw = String(candidate.slug || candidate.id || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          return raw === request.slug
        })
        if (!record || isRestrictedRecord(record)) return null
        return normalizeResearchSearchItem(record, request.type)
      }).filter((item): item is ResearchSearchItem => Boolean(item))

      if (resolved.length !== 2) {
        setState('missing')
        return
      }
      setItems(resolved)
      setState('ready')
    }).catch(() => setState('missing'))

    return () => { active = false }
  }, [requested])

  if (state === 'loading') return <div className='container-page py-12 text-sm text-muted'>Loading comparison…</div>

  if (state !== 'ready') {
    return (
      <main className='container-page mx-auto max-w-3xl py-12'>
        <div className='rounded-[1.5rem] border border-brand-900/10 bg-white p-7 shadow-sm'>
          <h1 className='text-3xl font-bold text-ink'>Choose two valid ingredients to compare.</h1>
          <p className='mt-3 text-sm leading-7 text-muted'>This on-demand tool only compares canonical public ingredient profiles. Return to search and select two profiles.</p>
          <Link href='/search/' className='mt-5 inline-flex rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white'>Return to search</Link>
        </div>
      </main>
    )
  }

  return (
    <main className='container-page mx-auto max-w-6xl space-y-7 py-10 sm:py-14'>
      <header className='rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-sm sm:p-9'>
        <p className='eyebrow-label'>On-demand comparison</p>
        <h1 className='mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>{items[0].name} vs {items[1].name}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted'>
          This is a dynamically assembled research view, not an editorially approved comparison article. It stays <strong>noindex</strong> and presents the canonical structured fields side by side without declaring a universal winner.
        </p>
      </header>
      <div className='grid gap-5 lg:grid-cols-2'>
        {items.map((item) => <ComparisonColumn key={`${item.type}:${item.slug}`} item={item} />)}
      </div>
      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/60 p-5 text-sm leading-7 text-amber-950'>
        <strong>Interpretation limit:</strong> differences in mechanisms, evidence labels, or safety notes do not establish which option is appropriate for an individual. Use the full profiles and source citations for deeper review.
      </section>
    </main>
  )
}
