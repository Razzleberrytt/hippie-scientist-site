/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- WCAG 2.1.1: horizontally scrollable table regions must be keyboard reachable. */
import type { ReactNode } from 'react'

type ResponsiveTableProps = {
  children: ReactNode
  label: string
  className?: string
  hint?: string
}

function slugifyLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'table'
}

export default function ResponsiveTable({
  children,
  label,
  className = '',
  hint = 'This table scrolls horizontally on small screens. Use Tab to focus the table region, then scroll with arrow keys or touch.',
}: ResponsiveTableProps) {
  const hintId = `${slugifyLabel(label)}-scroll-hint`

  return (
    <div
      role="region"
      aria-label={label}
      aria-describedby={hintId}
      tabIndex={0}
      className={`accessible-table-region overflow-x-auto rounded-xl border border-brand-900/10 bg-white shadow-sm dark:border-[var(--border-soft)] dark:bg-[var(--surface-card-strong)] ${className}`}
    >
      <p id={hintId} className="sr-only">
        {hint}
      </p>
      {children}
    </div>
  )
}
