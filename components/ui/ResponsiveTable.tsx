/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- horizontally scrollable table regions must be keyboard reachable. */
import type { ReactNode } from 'react'

type ResponsiveTableProps = {
  children: ReactNode
  label: string
  className?: string
}

export default function ResponsiveTable({
  children,
  label,
  className = '',
}: ResponsiveTableProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`overflow-x-auto rounded-xl border border-brand-900/10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card-strong)] ${className}`}
    >
      {children}
    </div>
  )
}
