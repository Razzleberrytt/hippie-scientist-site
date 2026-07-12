'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-[5.25rem] right-3 z-[85] min-h-10 min-w-10 rounded-full border border-brand-900/15 bg-[var(--surface-card-strong)] p-2 text-brand-800 shadow-sm backdrop-blur transition-all motion-safe:hover:scale-105 md:bottom-8 md:right-6 md:flex ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label='Scroll to top'
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  )
}
