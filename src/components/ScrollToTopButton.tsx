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
      className={`bounce fixed bottom-6 right-6 z-40 rounded-full bg-violet-500 p-3 text-white shadow-lg transition-all motion-safe:hover:scale-105 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-label='Scroll to top'
    >
      <ArrowUp />
    </button>
  )
}
