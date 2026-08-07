'use client'

import { useEffect } from 'react'
import { trackCompareHubCategoryShown, trackCompareHubClick, type CompareHubClickSource } from '@/lib/compareHubTracking'

export default function CompareHubAnalytics() {
  useEffect(() => {
    const categories = Array.from(document.querySelectorAll<HTMLElement>('[data-compare-category]'))
    const observers: IntersectionObserver[] = []

    categories.forEach((node) => {
      const category = node.dataset.compareCategory
      if (!category) return
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
      observers.push(observer)
    })

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href.startsWith('/guides/compare/')) return

      const categoryNode = anchor.closest<HTMLElement>('[data-compare-category]')
      const inGoalStarter = Boolean(anchor.closest('#start-by-goal'))
      const inFeaturedEntry = Boolean(anchor.closest('[data-compare-featured-entry-list]'))
      const category = categoryNode?.dataset.compareCategory
      let source: CompareHubClickSource = 'featured_entry'
      if (category) source = 'featured_category'
      else if (inGoalStarter) source = 'goal_starter'
      else if (inFeaturedEntry) source = 'featured_entry'
      else if (href.includes('/dynamic/')) source = 'dynamic_matrix'

      trackCompareHubClick({
        source,
        href,
        label: anchor.textContent?.replace(/\s+/g, ' ').trim() || href,
        category,
      })
    }

    document.addEventListener('click', onClick, true)
    return () => {
      observers.forEach((observer) => observer.disconnect())
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
