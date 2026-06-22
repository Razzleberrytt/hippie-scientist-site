'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Heading } from './extractHeadings'

const MIN_TOC_HEADINGS = 3
const ACTIVE_OFFSET_PX = 112

interface Props {
  headings: Heading[];
  minHeadings?: number;
}

function getActiveHeadingId(headings: Heading[]): string {
  if (typeof window === 'undefined') return headings[0]?.id ?? ''

  const currentY = window.scrollY + ACTIVE_OFFSET_PX
  let activeId = headings[0]?.id ?? ''

  for (const heading of headings) {
    const element = document.getElementById(heading.id)
    if (!element) continue
    if (element.offsetTop <= currentY) activeId = heading.id
  }

  return activeId
}

export default function TableOfContents({ headings, minHeadings = MIN_TOC_HEADINGS }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const tocHeadings = useMemo(
    () => headings.filter((heading) => heading.id && heading.text && (heading.level === 2 || heading.level === 3)),
    [headings]
  )

  useEffect(() => {
    if (tocHeadings.length < minHeadings) return

    const updateActiveHeading = () => {
      setActiveId(getActiveHeadingId(tocHeadings))
    }

    updateActiveHeading()

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
          return
        }

        updateActiveHeading()
      },
      { rootMargin: '-96px 0px -62% 0px', threshold: 0 }
    )

    tocHeadings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    window.addEventListener('scroll', updateActiveHeading, { passive: true })
    window.addEventListener('resize', updateActiveHeading)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateActiveHeading)
      window.removeEventListener('resize', updateActiveHeading)
    }
  }, [tocHeadings, minHeadings])

  if (tocHeadings.length < minHeadings) return null

  const links = (
    <nav aria-label="Table of contents">
      <ol className="space-y-0.5">
        {tocHeadings.map((heading) => {
          const isActive = activeId === heading.id

          return (
            <li key={heading.id} className={heading.level === 3 ? 'pl-3' : ''}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setMobileOpen(false)}
                className={[
                  'block rounded-lg px-2.5 py-1.5 leading-snug transition-colors',
                  heading.level === 3 ? 'text-xs' : 'text-sm',
                  isActive
                    ? 'bg-brand-50 font-semibold text-brand-800 shadow-sm dark:bg-brand-900/35 dark:text-brand-100'
                    : 'text-muted hover:bg-brand-50/60 hover:text-brand-800 dark:hover:bg-brand-900/25 dark:hover:text-brand-100',
                ].join(' ')}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )

  return (
    <>
      <div className="rounded-xl border border-brand-900/10 bg-white/90 shadow-sm dark:border-brand-900/20 dark:bg-brand-950/60 lg:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
        >
          On this page
          <svg
            className={`size-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="border-t border-brand-900/10 px-4 py-3 dark:border-brand-900/20">
            {links}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">
          On this page
        </p>
        {links}
      </div>
    </>
  )
}
