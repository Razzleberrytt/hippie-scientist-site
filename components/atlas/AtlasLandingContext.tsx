'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getAtlasLandingSource, type AtlasLandingSource } from '@/lib/botanicalAtlasTracking'
import { parseAtlasUrlState } from '@/lib/botanical-atlas-url-state'

type LandingCopy = {
  eyebrow: string
  title: string
  description: string
  nextStep: string
  backHref: string
  backLabel: string
}

const LANDING_COPY: Partial<Record<AtlasLandingSource, LandingCopy>> = {
  anxiety_hub: {
    eyebrow: 'You came from Anxiety & Stress',
    title: 'Compare calming options without treating them as interchangeable',
    description:
      'This view is narrowed toward calming botanicals. Start with evidence strength, then check noticeability and safety signals before opening a full profile.',
    nextStep: 'Best next step: compare the first three results, then open the profile with the clearest evidence and safest fit.',
    backHref: '/guides/anxiety/',
    backLabel: 'Back to Anxiety & Stress guides',
  },
  sleep_hub: {
    eyebrow: 'You came from Sleep',
    title: 'Separate sleep-oriented effects from general calming claims',
    description:
      'This view emphasizes sedating and sleep-related botanicals. Compare evidence first, then timing, noticeability, and interaction risks before considering combinations.',
    nextStep: 'Best next step: check timing and safety signals before opening a profile—especially if you already use sedating medication or supplements.',
    backHref: '/guides/sleep/',
    backLabel: 'Back to Sleep guides',
  },
  focus_hub: {
    eyebrow: 'You came from Focus & Cognition',
    title: 'Compare focus botanicals by evidence—not hype',
    description:
      'This view highlights cognition and focus categories, including clearly labeled pathway-derived effects. Use the explicit-effects filter for the strictest comparison.',
    nextStep: 'Best next step: switch to “Explicit effects only,” compare evidence strength, then open the strongest profile for mechanism and safety context.',
    backHref: '/guides/focus/',
    backLabel: 'Back to Focus & Cognition guides',
  },
}

export function getAtlasLandingCopy(source: AtlasLandingSource): LandingCopy | null {
  return LANDING_COPY[source] ?? null
}

function describeActiveState(search: string) {
  const state = parseAtlasUrlState(search)
  const parts = [
    state.effect !== 'all' ? `Effect: ${state.effect}` : '',
    state.effectSource === 'explicit' ? 'Explicit effects only' : '',
    state.evidence !== 'all' ? `Evidence: ${state.evidence}` : '',
    state.intensity !== 'all' ? `Noticeability: ${state.intensity}` : '',
    state.compoundClass !== 'all' ? `Chemistry: ${state.compoundClass}` : '',
    state.safety !== 'all' ? `Safety: ${state.safety}` : '',
    state.sort !== 'name' ? `Sorted by ${state.sort === 'evidence' ? 'strongest evidence' : 'noticeability'}` : '',
  ].filter(Boolean)

  return parts
}

export default function AtlasLandingContext() {
  const [source, setSource] = useState<AtlasLandingSource | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSource(getAtlasLandingSource())
    setSearch(window.location.search)
  }, [])

  const copy = source ? getAtlasLandingCopy(source) : null
  const activeState = useMemo(() => describeActiveState(search), [search])

  if (!copy) return null

  return (
    <aside className='rounded-2xl border border-emerald-800/20 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-200/15 dark:bg-emerald-950/20 sm:p-6'>
      <p className='text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200'>{copy.eyebrow}</p>
      <h2 className='mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl'>{copy.title}</h2>
      <p className='mt-3 max-w-4xl text-sm leading-7 text-muted'>{copy.description}</p>

      {activeState.length ? (
        <div className='mt-4 flex flex-wrap gap-2' aria-label='Prefiltered atlas state'>
          {activeState.map((item) => (
            <span key={item} className='rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-950 dark:border-white/10 dark:bg-white/10 dark:text-emerald-100'>
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <p className='mt-4 text-sm font-semibold leading-6 text-ink'>{copy.nextStep}</p>
      <Link href={copy.backHref} className='mt-4 inline-flex min-h-[44px] items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-200'>
        {copy.backLabel} →
      </Link>
    </aside>
  )
}
