export const springConfig = {
  default: {
    type: 'spring',
    stiffness: 320,
    damping: 24,
    mass: 0.9,
    bounce: 0,
  } as const,

  card: {
    type: 'spring',
    stiffness: 320,
    damping: 24,
    mass: 0.9,
    bounce: 0,
  } as const,

  gentle: {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.95,
    bounce: 0,
  } as const,

  cta: {
    type: 'spring',
    stiffness: 400,
    damping: 22,
    mass: 0.8,
    bounce: 0,
  } as const,

  micro: {
    type: 'spring',
    stiffness: 500,
    damping: 28,
    mass: 0.7,
    bounce: 0,
  } as const,
} as const

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
} as const

export const listItem = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig.gentle,
  },
} as const
