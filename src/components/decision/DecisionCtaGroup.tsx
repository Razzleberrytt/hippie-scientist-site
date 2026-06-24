import Link from 'next/link'

interface CtaItem {
  label: string
  href: string
  /** 'primary' renders solid emerald button, 'secondary' renders outlined, 'ghost' renders text link */
  variant?: 'primary' | 'secondary' | 'ghost'
}

interface DecisionCtaGroupProps {
  ctas: [CtaItem, ...CtaItem[]] // at least one required
  className?: string
  /** When true, forces a single column even on wider screens */
  stacked?: boolean
}

const VARIANT_CLASS: Record<NonNullable<CtaItem['variant']>, string> = {
  primary: [
    'rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white',
    'shadow-[var(--shadow-button-primary)]',
    'transition-all duration-200 hover:bg-brand-600 hover:-translate-y-px active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-4',
  ].join(' '),
  secondary: [
    'rounded-full border border-brand-900/15 bg-white px-6 py-3 text-sm font-semibold text-ink',
    'shadow-[var(--shadow-button-secondary)]',
    'transition-all duration-200 hover:border-brand-700/30 hover:bg-surface hover:-translate-y-px active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-4',
  ].join(' '),
  ghost: [
    'rounded-full px-4 py-2 text-sm font-medium text-brand-700',
    'transition-colors duration-200 hover:text-brand-600 hover:underline underline-offset-4',
    'focus-visible:outline-2 focus-visible:outline-offset-4',
  ].join(' '),
}

export default function DecisionCtaGroup({ ctas, className = '', stacked = false }: DecisionCtaGroupProps) {
  // Clamp to max 3 CTAs to avoid dense grids
  const visible = ctas.slice(0, 3)

  return (
    <div
      className={[
        'flex gap-3',
        stacked ? 'flex-col' : 'flex-col sm:flex-row sm:flex-wrap',
        className,
      ].join(' ')}
    >
      {visible.map((cta, i) => {
        const variant = cta.variant ?? (i === 0 ? 'primary' : i === 1 ? 'secondary' : 'ghost')
        return (
          <Link
            key={cta.href}
            href={cta.href}
            className={[VARIANT_CLASS[variant], stacked || 'sm:w-auto w-full text-center'].join(' ')}
          >
            {cta.label}
          </Link>
        )
      })}
    </div>
  )
}
