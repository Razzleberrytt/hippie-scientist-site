/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Horizontally scrollable card rails must be keyboard reachable. */
import { Children, type ReactNode } from 'react'

type HorizontalCardRailProps = {
  children: ReactNode
  label: string
  className?: string
}

export default function HorizontalCardRail({
  children,
  label,
  className = '',
}: HorizontalCardRailProps) {
  const items = Children.toArray(children)

  if (items.length === 0) return null

  return (
    <div className={`mt-4 ${className}`}>
      {items.length > 1 ? (
        <p
          aria-hidden="true"
          className="mb-2 flex items-center justify-end gap-1 text-[0.68rem] font-semibold text-muted md:hidden"
        >
          Swipe to compare <span className="text-brand-700">→</span>
        </p>
      ) : null}

      <ul
        aria-label={label}
        tabIndex={0}
        className="flex list-none snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 md:focus-visible:ring-0"
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="flex w-[calc(100%-1rem)] min-w-0 max-w-[17rem] shrink-0 snap-start flex-col md:w-auto md:max-w-none"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
