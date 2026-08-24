'use client'

import { useRef, useState } from 'react'

type StudyClassOption = {
  value: string
  label: string
  count: number
}

export default function StudyClassFilterControls({
  total,
  classes,
}: {
  total: number
  classes: StudyClassOption[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeClass, setActiveClass] = useState('all')
  const [visibleCount, setVisibleCount] = useState(total)

  const applyFilter = (value: string) => {
    const root = containerRef.current?.closest<HTMLDetailsElement>('details[data-study-summaries-root]')
    if (!root) return

    const rows = Array.from(root.querySelectorAll<HTMLTableRowElement>('tr[data-study-class]'))
    let nextVisibleCount = 0
    for (const row of rows) {
      const matches = value === 'all' || row.dataset.studyClass === value
      row.hidden = !matches
      if (matches) nextVisibleCount += 1
    }

    const overflow = root.querySelector<HTMLDetailsElement>('details[data-study-overflow]')
    if (overflow) {
      const overflowRows = Array.from(overflow.querySelectorAll<HTMLTableRowElement>('tr[data-study-class]'))
      const overflowVisible = value === 'all'
        ? overflowRows.length
        : overflowRows.filter((row) => row.dataset.studyClass === value).length
      overflow.hidden = value !== 'all' && overflowVisible === 0
      if (value === 'all') overflow.open = false
      else if (overflowVisible > 0) overflow.open = true

      const overflowLabel = overflow.querySelector<HTMLElement>('[data-study-overflow-label]')
      if (overflowLabel) {
        overflowLabel.textContent = `Show ${overflowVisible} more ${overflowVisible === 1 ? 'study' : 'studies'}`
      }
    }

    setActiveClass(value)
    setVisibleCount(nextVisibleCount)
  }

  return (
    <div ref={containerRef}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Filter by study class</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter evidence by study class">
        <button
          type="button"
          aria-pressed={activeClass === 'all'}
          onClick={() => applyFilter('all')}
          className="rounded-full border border-brand-900/15 px-3 py-1 text-xs font-semibold text-ink aria-pressed:bg-brand-700 aria-pressed:text-white dark:border-white/15"
        >
          All ({total})
        </button>
        {classes.map((studyClass) => (
          <button
            key={studyClass.value}
            type="button"
            aria-pressed={activeClass === studyClass.value}
            onClick={() => applyFilter(studyClass.value)}
            className="rounded-full border border-brand-900/15 px-3 py-1 text-xs font-semibold text-ink aria-pressed:bg-brand-700 aria-pressed:text-white dark:border-white/15"
          >
            {studyClass.label} ({studyClass.count})
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted" aria-live="polite">
        Showing {visibleCount} of {total} studies.
      </p>
    </div>
  )
}
