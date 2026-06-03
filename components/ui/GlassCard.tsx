'use client'

import type { ReactNode, HTMLAttributes } from 'react'

type GlassVariant = 'light' | 'standard' | 'heavy' | 'glow' | 'frosted'

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  variant?: GlassVariant
  enableShine?: boolean
  delay?: number
}

const variantClasses: Record<GlassVariant, string> = {
  light: 'border-neutral-200/60 bg-white',
  standard: 'border-neutral-200/60 bg-white',
  heavy: 'border-neutral-200/60 bg-white',
  glow: 'border-neutral-200/60 bg-white',
  frosted: 'border-neutral-200/60 bg-white',
}

export function GlassCard({
  children,
  variant = 'standard',
  enableShine = true,
  delay: _delay = 0, // delay no longer used without framer
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 motion-safe:hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {enableShine ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] bg-gradient-to-r from-transparent via-brand-100/40 to-transparent" />
        </span>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
