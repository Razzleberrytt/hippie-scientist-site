'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

type Props = {
  title?: string
  children: ReactNode
  defaultOpen?: boolean
  variant?: 'warning' | 'info' | 'section'
  className?: string
}

export default function CollapsibleSection({
  title = 'Details',
  children,
  defaultOpen = false,
  variant = 'section',
  className = '',
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const variants = {
    warning: 'border-2 border-amber-500/40 bg-amber-50 shadow-sm ring-1 ring-amber-500/10 dark:border-amber-500/25 dark:bg-amber-950/30',
    info: 'border-2 border-brand-600/30 bg-brand-50 shadow-sm ring-1 ring-brand-600/10 dark:border-brand-500/25 dark:bg-brand-950/30',
    section: 'border-2 border-brand-900/15 bg-white shadow-sm ring-1 ring-brand-900/5 dark:border-white/15 dark:bg-white/5',
  }

  const headerVariants = {
    warning: 'text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/30',
    info: 'text-brand-900 dark:text-brand-200 hover:bg-brand-100/40 dark:hover:bg-brand-900/30',
    section: 'text-ink hover:bg-brand-50/40 dark:hover:bg-white/10',
  }

  const iconMap = {
    warning: '⚠️',
    info: 'ℹ️',
    section: '',
  }

  return (
    <div className={`my-5 overflow-hidden rounded-xl border ${variants[variant]} ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left font-semibold transition-colors ${
          headerVariants[variant]
        } ${open ? 'rounded-none' : 'rounded-xl'}`}
      >
        <span className="flex items-center gap-2">
          {iconMap[variant] && <span aria-hidden="true">{iconMap[variant]}</span>}
          {title}
        </span>
        <svg
          className={`size-4 flex-shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-brand-900/10 px-5 pb-4 pt-3 text-sm leading-7 text-muted dark:border-white/10">
          {children}
        </div>
      )}
    </div>
  )
}

/** Pre-configured safety warning — collapsed by default, amber styling */
export function CollapsibleWarning({ title = 'Important Safety Information', children }: Omit<Props, 'variant' | 'defaultOpen'>) {
  return (
    <CollapsibleSection title={title} variant="warning" defaultOpen={false}>
      {children}
    </CollapsibleSection>
  )
}

/** Pre-configured for collapsible content sections — open by default */
export function CollapsibleDetails({ title = 'Details', children, defaultOpen = false }: Omit<Props, 'variant'>) {
  return (
    <CollapsibleSection title={title} variant="section" defaultOpen={defaultOpen}>
      {children}
    </CollapsibleSection>
  )
}
