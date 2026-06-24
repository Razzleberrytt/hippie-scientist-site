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
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-32 right-4 z-[85] rounded-full border border-white/20 bg-violet-500/90 p-2.5 text-white shadow-lg backdrop-blur transition-all motion-safe:hover:scale-105 md:bottom-8 md:right-6 md:flex ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label='Scroll to top'
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
