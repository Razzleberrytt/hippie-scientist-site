'use client'

import { useEffect, useState } from 'react'

interface BackToTopProps {
  minScrollY?: number;
  minScrollableDistance?: number;
}

export default function BackToTop({
  minScrollY = 720,
  minScrollableDistance = 900,
}: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      const documentHeight = document.documentElement.scrollHeight
      const scrollableDistance = documentHeight - window.innerHeight
      setVisible(scrollableDistance >= minScrollableDistance && window.scrollY >= minScrollY)
    }

    updateVisibility()

    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [minScrollY, minScrollableDistance])

  if (!visible) return null

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-4 z-40 inline-flex size-11 items-center justify-center rounded-full border border-brand-900/10 bg-white/95 text-brand-800 shadow-lg shadow-brand-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 dark:border-brand-900/20 dark:bg-brand-950/90 dark:text-brand-100 dark:hover:bg-brand-900 sm:bottom-6 sm:right-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <path d="M10 16V4" strokeLinecap="round" />
        <path d="M5 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
