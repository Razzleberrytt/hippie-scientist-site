'use client'

import { useEffect, useState, useRef } from 'react'

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

  useEffect(() => {
    // Find all h2/h3 with ids in the main content area
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

    // Set up intersection observer for active heading tracking
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
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Mobile: compact dropdown at top */}
      <div className="mb-6 rounded-xl border-2 border-brand-900/15 bg-white p-0 shadow-sm lg:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
        >
          On this page ({headings.length} sections)
          <svg
            className={`size-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {mobileOpen && (
          <nav aria-label="Table of contents" className="border-t border-brand-900/10 px-4 py-3">
            <TOCLinks headings={headings} activeId={activeId} onClick={() => setMobileOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop: fixed sidebar on the right */}
      <aside
        aria-label="Page contents"
        className="fixed right-4 top-24 z-30 hidden w-[200px] xl:block"
      >
        <div className="rounded-xl border-2 border-brand-900/15 bg-white p-3 shadow-md ring-1 ring-brand-900/5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
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
              'block rounded-lg px-2 py-1 leading-snug transition-colors',
              compact ? 'text-[11px]' : h.level === 3 ? 'text-xs' : 'text-sm',
              activeId === h.id
                ? 'bg-brand-50 font-semibold text-brand-800'
                : 'text-muted hover:bg-brand-50/60 hover:text-brand-800',
            ].join(' ')}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  )
}
