'use client'

import { useEffect, useState } from 'react'
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
      className={`bounce fixed bottom-24 right-4 z-[85] rounded-full bg-[#1a2e1a] p-3 text-[#f5f0e8] shadow-lg transition-all hover:bg-[#243d24] motion-safe:hover:scale-105 md:bottom-8 md:right-6 md:z-[85] md:flex ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label="Scroll to top"
    >
      <ArrowUp />
    </button>
  )
}
