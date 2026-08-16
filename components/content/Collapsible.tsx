import type { ReactNode } from 'react'

type CollapsibleProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export default function Collapsible({ title, children, defaultOpen = false, className = '' }: CollapsibleProps) {
  return (
    <details
      open={defaultOpen}
      className={`group border-y border-[color:var(--hs-hairline-strong)] bg-transparent ${className}`}
    >
      <summary className="flex min-h-12 cursor-pointer select-none items-center justify-between gap-3 px-1 py-3.5 font-semibold text-[color:var(--hs-ink)] transition hover:text-[color:var(--tone-ink)]">
        <span>{title}</span>
        <svg
          className="size-4 shrink-0 text-[color:var(--hs-body)] transition-transform group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-[color:var(--hs-hairline)] px-1 pb-5 pt-4 text-sm leading-7 text-[color:var(--hs-body)]">
        {children}
      </div>
    </details>
  )
}
