'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

type SemanticVisibilityGateProps = {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  minHeight?: number
}

export default function SemanticVisibilityGate({
  children,
  fallback,
  rootMargin = '420px',
  minHeight = 260,
}: SemanticVisibilityGateProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return

    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [rootMargin, visible])

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible
        ? children
        : fallback || (
            <div className="compact-card animate-pulse">
              <p className="eyebrow-label">Loading semantic system</p>
              <div className="mt-4 h-4 w-2/3 rounded-full bg-brand-900/10" />
              <div className="mt-3 h-4 w-1/2 rounded-full bg-brand-900/10" />
            </div>
          )}
    </div>
  )
}
