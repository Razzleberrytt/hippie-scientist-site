'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  trackCompareHubCategoryShown,
  trackCompareHubClick,
  trackComparisonOutcome,
  trackComparisonPageViewed,
  type CompareHubClickSource,
  type ComparisonOutcomeType,
} from '@/lib/compareHubTracking'

function comparisonPageSlug(pathname: string) {
  const match = pathname.match(/^\/guides\/compare\/([^/]+)\/?$/)
  if (!match || match[1] === 'dynamic') return undefined
  return match[1]
}

function classifyOutcome(anchor: HTMLAnchorElement): ComparisonOutcomeType | undefined {
  const href = anchor.getAttribute('href') || ''
  if (href === '/guides/compare/' || href === '/guides/compare') return 'compare_hub'
  if (href.startsWith('/herbs/')) return 'herb_profile'
  if (href.startsWith('/compounds/')) return 'compound_profile'
  if (href.startsWith('/safety-checker')) return 'safety_checker'
  if (href.startsWith('/guides/compare/')) return 'another_comparison'
  if (href.startsWith('#references') || anchor.closest('#references')) return 'reference'
  if (/pubmed\.ncbi\.nlm\.nih\.gov|doi\.org/i.test(href)) return 'reference'
  return undefined
}

export default function CompareHubAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    const isHub = pathname === '/guides/compare' || pathname === '/guides/compare/'
    const pageSlug = comparisonPageSlug(pathname)

    if (!isHub && pageSlug) {
      trackComparisonPageViewed(pageSlug)
      const onOutcomeClick = (event: MouseEvent) => {
        const target = event.target instanceof Element ? event.target : null
        const anchor = target?.closest<HTMLAnchorElement>('a[href]')
        if (!anchor) return
        const outcome = classifyOutcome(anchor)
        if (!outcome) return
        trackComparisonOutcome({
          pageSlug,
          outcome,
          href: anchor.getAttribute('href') || '',
          label: anchor.textContent?.replace(/\s+/g, ' ').trim(),
        })
      }
      document.addEventListener('click', onOutcomeClick, true)
      return () => document.removeEventListener('click', onOutcomeClick, true)
    }

    if (!isHub) return

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
