'use client'

import { useEffect, useState } from 'react'

type Props = {
  brand?: string
  name?: string
  href: string
}

export default function ConversionStickyCTA({ brand, name, href }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const depth = max > 0 ? (window.scrollY / max) * 100 : 0
      setVisible(depth > 22)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {visible ? (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-40 hidden w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl bg-[#111a16] px-4 py-3 text-white shadow-2xl ring-1 ring-black/10 dark:bg-[#1a3028] dark:ring-white/10 md:block">
          <div className="pointer-events-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Popular choice</p>
              <p className="truncate text-sm font-bold">{brand}{name ? ` — ${name}` : ''}</p>
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="sticky-cta-btn shrink-0 rounded-xl bg-[#fffdf7] px-4 py-2 text-sm font-black text-[#111a16]">
              Check price
            </a>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 hidden border-t border-neutral-200 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-[var(--border-soft)] md:block">
        <div className="pointer-events-auto mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="font-bold text-ink">Top pick</p>
            <p className="truncate text-muted">{brand}{name ? ` — ${name}` : ''}</p>
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="sticky-cta-btn rounded-xl bg-[#111a16] px-4 py-2 text-sm font-black text-white">
            View top pick
          </a>
        </div>
      </div>
    </>
  )
}
