'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type LazySemanticSectionProps = {
  children: ReactNode
  fallback?: ReactNode
  minHeight?: number
  rootMargin?: string
}

export default function LazySemanticSection({
  children,
  fallback,
  minHeight = 320,
  rootMargin = '240px',
}: LazySemanticSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [rootMargin, visible])

  return (
    <div
      ref={ref}
      style={{ minHeight }}
      className="relative"
    >
      {visible ? children : fallback || (
        <div className="flex min-h-[inherit] items-center justify-center rounded-[1.8rem] border border-brand-900/10 bg-white/50 backdrop-blur-sm">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-brand-900/10 bg-brand-100" />
            <p className="text-sm text-[#64766b]">
              Preparing semantic visualization…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
