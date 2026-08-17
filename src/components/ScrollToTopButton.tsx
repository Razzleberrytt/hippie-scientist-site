'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { LOCALIZED_CHROME, getLocaleFromPathname } from '@/src/lib/localized-chrome'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const label = LOCALIZED_CHROME[locale].scrollTopLabel

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-3 z-[85] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-900/15 bg-[var(--surface-card-strong)] p-2 text-brand-800 shadow-sm backdrop-blur transition-all motion-safe:hover:scale-105 md:bottom-8 md:right-6 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label={label}
      lang={locale}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  )
}
