'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { HTMLMotionProps, motion, useInView, useReducedMotion } from 'framer-motion'
import { springConfig } from '@/utils/springConfig'

type GlassVariant = 'light' | 'standard' | 'heavy' | 'glow' | 'frosted'

type GlassCardProps = HTMLMotionProps<'div'> & {
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
  delay = 0,
  className = '',
  ...props
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-48px' })
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={reduceMotion || inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ ...springConfig.card, delay }}
      className={`relative isolate overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 motion-safe:hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {enableShine ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] bg-gradient-to-r from-transparent via-brand-100/40 to-transparent" />
        </span>
      ) : null}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
