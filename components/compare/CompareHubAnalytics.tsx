'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackCompareHubCategoryShown, trackCompareHubClick, type CompareHubClickSource } from '@/lib/compareHubTracking'

export default function CompareHubAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/guides/compare' && pathname !== '/guides/compare/') return

    const featured = document.querySelector('#featured-comparisons')
    const categoryNodes = featured
      ? Array.from(featured.querySelectorAll<HTMLElement>('h3')).map((heading) => {
        const node = heading.parentElement?.parentElement as HTMLElement | null
        const category = heading.textContent?.replace(/\s+/g, ' ').trim()
        if (node && category) node.dataset.compareCategory = category
        return node
      }).filter((node): node is HTMLElement => Boolean(node?.dataset.compareCategory))
      : []

    const observers: IntersectionObserver[] = []
    categoryNodes.forEach((node) => {
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
      const category = categoryNode?.dataset.compareCategory
      let source: CompareHubClickSource = 'featured_entry'
      if (category) source = 'featured_category'
      else if (inGoalStarter) source = 'goal_starter'
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
  }, [pathname])

  return null
}
