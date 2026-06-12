'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StickyFooterCTA() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (window.sessionStorage.getItem('phase3b-sticky-footer-cta') === '1') {
      setDismissed(true)
      return
    }

    const onScroll = () => setVisible(window.scrollY > 420)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function dismiss() {
    setDismissed(true)
    window.sessionStorage.setItem('phase3b-sticky-footer-cta', '1')
  }

  if (dismissed || !visible) return null

  return (
    <div className='fixed inset-x-0 bottom-[4.6rem] z-[80] border-t border-emerald-800/15 bg-white/95 px-4 py-3 shadow-[0_-8px_26px_rgba(0,0,0,0.1)] backdrop-blur md:bottom-0'>
      <div className='mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm font-semibold text-ink'>
          <span className='text-emerald-800'>Join 1,000+ readers</span> getting weekly supplement evidence updates and the free safety checklist.
        </p>
        <div className='flex items-center gap-2'>
          <Link
            href='/supplement-safety-checklist'
            className='inline-flex min-h-10 items-center justify-center rounded-full bg-brand-950 px-4 py-2 text-xs font-bold text-white hover:bg-brand-900 sm:text-sm'
          >
            Get the Safety Checklist
          </Link>
          <button
            type='button'
            onClick={dismiss}
            className='rounded-full px-2 py-1 text-xs font-bold text-muted hover:bg-stone-100'
            aria-label='Dismiss sticky signup'
          >
            x
          </button>
        </div>
      </div>
    </div>
  )
}
