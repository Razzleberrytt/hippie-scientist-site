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
  light: 'border-brand/15 bg-glass-light sm:backdrop-blur-md backdrop-blur-sm',
  standard: 'border-brand/20 bg-glass-standard sm:backdrop-blur-xl backdrop-blur-md',
  heavy: 'border-brand/25 bg-glass-heavy sm:backdrop-blur-2xl backdrop-blur-md shadow-glass',
  glow: 'border-brand/35 bg-glass-glow sm:backdrop-blur-xl backdrop-blur-md shadow-glow',
  frosted: 'border-white/15 bg-white/[0.045] sm:backdrop-blur-lg backdrop-blur-sm',
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
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ ...springConfig.card, delay }}
      className={`relative isolate overflow-hidden rounded-3xl border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {enableShine ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:animate-[shine_3.8s_linear_infinite]" />
        </span>
      ) : null}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
