'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type ScrollEngagementPromptProps = {
  storageKey: string
  headline?: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
}

export default function ScrollEngagementPrompt({
  storageKey,
  headline = 'Free supplement safety checklist',
  description = 'Evidence-based steps to review medications, dose, form, and stacking risk before you buy.',
  ctaHref = '/supplement-safety-checklist',
  ctaLabel = 'Get the checklist',
}: ScrollEngagementPromptProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(storageKey) === '1') {
      setDismissed(true)
      return
    }

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const ratio = window.scrollY / scrollable
      if (ratio >= 0.65) setVisible(true)
    }

    const onMouseLeave = (event: MouseEvent) => {
      if (window.innerWidth < 768) return
      if (event.clientY <= 0) setVisible(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [storageKey])

  function dismiss() {
    setDismissed(true)
    setVisible(false)
    try {
      window.sessionStorage.setItem(storageKey, '1')
    } catch {
      // ignore quota errors
    }
  }

  if (dismissed || !visible) return null

  return (
    <div
      className='fixed bottom-20 left-4 right-4 z-[85] mx-auto max-w-md motion-safe:animate-[slide-up_0.2s_ease-out] md:bottom-8 md:left-auto md:right-6'
      role='dialog'
      aria-modal='true'
      aria-live='polite'
      aria-label='Safety checklist and newsletter offer'
    >
      <div className='rounded-2xl border border-brand-900/15 bg-white p-4 shadow-lg'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700'>
              Free resource
            </p>
            <p className='mt-1 text-sm font-semibold text-ink'>{headline}</p>
            <p className='mt-1 text-xs leading-5 text-muted'>{description}</p>
          </div>
          <button
            type='button'
            onClick={dismiss}
            className='shrink-0 rounded-full px-2 py-1 text-xs font-bold text-muted hover:bg-stone-100'
            aria-label='Dismiss'
          >
            ✕
          </button>
        </div>
        <Link
          href={ctaHref}
          onClick={dismiss}
          className='mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-900'
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}