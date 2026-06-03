'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type StickyChecklistBarProps = {
  storageKey?: string
}

export default function StickyChecklistBar({ storageKey = 'sticky-checklist-bar' }: StickyChecklistBarProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(storageKey) === '1') {
      setDismissed(true)
      return
    }

    const onScroll = () => {
      setVisible(window.scrollY > 280)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [storageKey])

  function dismiss() {
    setDismissed(true)
    setVisible(false)
    try {
      window.sessionStorage.setItem(storageKey, '1')
    } catch {
      // ignore
    }
  }

  if (dismissed || !visible) return null

  return (
    <div
      className='fixed bottom-[4.5rem] left-0 right-0 z-40 border-t border-emerald-800/15 bg-white/95 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm md:bottom-0'
      role='region'
      aria-label='Safety checklist reminder'
    >
      <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3'>
        <p className='text-sm font-semibold text-ink'>
          <span className='text-emerald-800'>Free checklist:</span> review meds, dose &amp; stack risk before you buy
        </p>
        <div className='flex items-center gap-2'>
          <Link
            href='/supplement-safety-checklist'
            className='inline-flex min-h-10 items-center justify-center rounded-full bg-brand-950 px-4 py-2 text-xs font-bold text-white hover:bg-brand-900 sm:text-sm'
          >
            Get checklist
          </Link>
          <button
            type='button'
            onClick={dismiss}
            className='rounded-full px-2 py-1 text-xs font-bold text-muted hover:bg-stone-100'
            aria-label='Dismiss'
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}