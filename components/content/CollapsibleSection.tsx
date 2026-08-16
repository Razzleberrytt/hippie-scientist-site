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
    warning: 'rounded-xl border border-amber-500/35 bg-amber-50/80 shadow-sm dark:border-amber-500/25 dark:bg-amber-950/25',
    info: 'border-y border-[color:color-mix(in_srgb,var(--tone)_26%,transparent)] bg-[color:color-mix(in_srgb,var(--tone)_7%,transparent)]',
    section: 'border-y border-[color:var(--hs-hairline-strong)] bg-transparent',
  }

  const headerVariants = {
    warning: 'text-amber-900 dark:text-amber-200 hover:bg-amber-100/45 dark:hover:bg-amber-900/20',
    info: 'text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]',
    section: 'text-[color:var(--hs-ink)] hover:text-[color:var(--tone-ink)]',
  }

  const iconMap = {
    warning: '⚠️',
    info: 'ℹ️',
    section: '',
  }

  const contentBorder = variant === 'warning'
    ? 'border-amber-500/20'
    : 'border-[color:var(--hs-hairline)]'

  return (
    <div className={`my-5 overflow-hidden ${variants[variant]} ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold transition-colors sm:px-5 ${headerVariants[variant]}`}
      >
        <span className="flex items-center gap-2">
          {iconMap[variant] && <span aria-hidden="true">{iconMap[variant]}</span>}
          {title}
        </span>
        <svg
          className={`size-4 shrink-0 text-[color:var(--hs-body)] transition-transform ${open ? 'rotate-180' : ''}`}
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
        <div className={`border-t ${contentBorder} px-4 pb-5 pt-4 text-sm leading-7 text-[color:var(--hs-body)] sm:px-5`}>
          {children}
        </div>
      )}
    </div>
  )
}

/** Pre-configured safety warning — collapsed by default, amber styling. */
export function CollapsibleWarning({ title = 'Important Safety Information', children }: Omit<Props, 'variant' | 'defaultOpen'>) {
  return (
    <CollapsibleSection title={title} variant="warning" defaultOpen={false}>
      {children}
    </CollapsibleSection>
  )
}

/** Pre-configured for collapsible content sections — collapsed by default. */
export function CollapsibleDetails({ title = 'Details', children, defaultOpen = false }: Omit<Props, 'variant'>) {
  return (
    <CollapsibleSection title={title} variant="section" defaultOpen={defaultOpen}>
      {children}
    </CollapsibleSection>
  )
}
