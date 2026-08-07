'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { trackCompareHubCategoryShown } from '@/lib/compareHubTracking'

export default function CompareHubCategoryTracker({ category, children }: { category: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      trackCompareHubCategoryShown(category)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) {
        trackCompareHubCategoryShown(category)
        observer.disconnect()
      }
    }, { threshold: [0.25] })

    observer.observe(node)
    return () => observer.disconnect()
  }, [category])

  return <div ref={ref}>{children}</div>
}
