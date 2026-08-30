'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { LOCALIZED_CHROME, getLocaleFromPathname } from '@/lib/localized-chrome'

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

  const scrollToTop = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur()
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      /* Docked into the corner rather than floating over the reading column:
         a smaller footprint, quieter chrome styling, and a z-index below the
         consent banner and navigation so it never covers a blocking control. */
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+0.4rem)] right-1.5 z-[60] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--hs-hairline-strong)] bg-[var(--surface-card-strong)] p-1.5 text-[color:var(--tone-ink)] shadow-sm backdrop-blur transition-all motion-safe:hover:scale-105 md:bottom-8 md:right-6 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label={label}
      aria-hidden={!visible}
      lang={locale}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp aria-hidden="true" className="h-4 w-4" />
    </button>
  )
}
