'use client'

import { useState, useEffect } from 'react'

type TocItem = { id: string; label: string }

export default function ProfileTOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  return (
    <nav aria-label="Page sections" className="hidden lg:block sticky top-20 self-start w-48 shrink-0">
      <p className="eyebrow-label mb-3">On this page</p>
      <ol className="space-y-1">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                activeId === id
                  ? 'bg-brand-50 font-semibold text-brand-800'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
