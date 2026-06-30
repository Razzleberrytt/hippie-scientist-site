'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      const current = window.scrollY
      const value = total > 0 ? (current / total) * 100 : 0
      setProgress(value)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] bg-transparent z-[60]">
      <div
        className="h-full bg-brand-700 transition-all duration-150 dark:bg-[var(--accent-teal)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
