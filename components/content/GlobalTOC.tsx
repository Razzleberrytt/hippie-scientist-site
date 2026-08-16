'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

type Heading = {
  id: string
  text: string
  level: 2 | 3
}

export default function GlobalTOC() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const [visible, setVisible] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // This component lives in the persistent root layout, so re-scan the new
    // page's headings on every route change instead of only on first mount.
    setActiveId('')
    setMobileOpen(false)

    // Stand down whenever the page already owns a curated navigation surface.
    // The global TOC is a fallback, not a second competing "On this page" UI.
    const hasCuratedSectionNav = Boolean(document.querySelector('nav[aria-label="Page sections"]'))
    const hasCuratedToc = Array.from(
      document.querySelectorAll('nav[aria-label="Table of contents"], aside[aria-label="Page navigation"]'),
    ).some((element) => !element.closest('[data-global-toc]'))

    if (hasCuratedSectionNav || hasCuratedToc) {
      setVisible(false)
      return
    }

    // Find all h2/h3 with ids in the main content area.
    const selector = 'article h2[id], article h3[id], main h2[id], main h3[id], .content-prose h2[id], .content-prose h3[id], .article-body h2[id], .article-body h3[id]'
    const elements = document.querySelectorAll(selector)

    if (elements.length < 2) {
      setVisible(false)
      return
    }

    const detected: Heading[] = Array.from(elements)
      .map(el => ({
        id: el.id,
        text: el.textContent?.trim() ?? '',
        level: (el.tagName === 'H2' ? 2 : 3) as 2 | 3,
      }))
      .filter(h => h.id && h.text && h.text.length > 0)

    if (detected.length < 2) {
      setVisible(false)
      return
    }

    setHeadings(detected)
    setVisible(true)

    // Set up intersection observer for active heading tracking.
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    detected.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.current?.observe(el)
    })

    return () => observer.current?.disconnect()
  }, [pathname])

  if (!visible) return null

  return (
    <>
      {/* Inline accordion stays available until the XL margin rail takes over. */}
      <div
        data-global-toc
        className="mx-4 mb-7 mt-4 border-y border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface-2)] sm:mx-6 sm:rounded-xl sm:border lg:mx-auto lg:w-[calc(100%-3rem)] lg:max-w-6xl xl:hidden"
      >
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[color:var(--hs-ink)]"
        >
          <span>On this page <span className="font-normal text-[color:var(--hs-body)]">({headings.length} sections)</span></span>
          <svg
            className={`size-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {mobileOpen && (
          <nav aria-label="Table of contents" className="border-t border-[color:var(--hs-hairline)] px-4 py-3">
            <TOCLinks headings={headings} activeId={activeId} onClick={() => setMobileOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop fallback: editorial margin rail, not another floating card. */}
      <aside
        data-global-toc
        aria-label="Page contents"
        className="fixed right-4 top-24 z-30 hidden w-[210px] xl:block"
      >
        <div className="border-l border-[color:var(--hs-hairline-strong)] pl-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--hs-gold)]">
            On this page
          </p>
          <TOCLinks headings={headings} activeId={activeId} compact />
        </div>
      </aside>
    </>
  )
}

function TOCLinks({
  headings,
  activeId,
  onClick,
  compact,
}: {
  headings: Heading[]
  activeId: string
  onClick?: () => void
  compact?: boolean
}) {
  return (
    <ol className="space-y-0.5">
      {headings.map(h => (
        <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
          <a
            href={`#${h.id}`}
            onClick={onClick}
            className={[
              'block border-l-2 px-2.5 py-1.5 leading-snug transition-colors',
              compact ? 'text-[11px]' : h.level === 3 ? 'text-xs' : 'text-sm',
              activeId === h.id
                ? 'border-[color:var(--hs-gold)] bg-[color:color-mix(in_srgb,var(--tone)_10%,transparent)] font-semibold text-[color:var(--hs-ink)]'
                : 'border-transparent text-[color:var(--hs-body)] hover:border-[color:var(--hs-hairline-strong)] hover:bg-[color:color-mix(in_srgb,var(--tone)_7%,transparent)] hover:text-[color:var(--hs-ink)]',
            ].join(' ')}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  )
}
