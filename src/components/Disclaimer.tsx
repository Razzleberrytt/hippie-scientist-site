import { Link } from '../lib/router-compat'
import { DISCLAIMER_COPY, type DisclaimerVariant } from '../lib/disclaimer-copy'

type DisclaimerProps = {
  className?: string
  variant?: DisclaimerVariant
}

export default function Disclaimer({ className = '', variant = 'standard' }: DisclaimerProps) {
  const copy = DISCLAIMER_COPY[variant]
  const highRisk = variant === 'high-risk'

  return (
    <section
      className={`safety-disclaimer border-l-2 px-4 py-3 text-sm ${
        highRisk
          ? 'border-red-700/50 bg-red-50 text-red-950'
          : 'border-amber-600/50 bg-amber-50/70'
      } ${className}`.trim()}
      aria-label={copy.ariaLabel}
      role={highRisk ? 'note' : undefined}
    >
      <p className='font-semibold uppercase tracking-wide'>{copy.heading}</p>
      <p className='mt-2 opacity-90'>{copy.body}</p>
      {copy.showMethodologyLink ? (
        <p className='mt-2 opacity-90'>
          Learn how we evaluate confidence, safety, and intensity on the{' '}
          <Link to='/info/methodology' className='font-semibold underline decoration-dotted underline-offset-4'>
            methodology page
          </Link>
          .
        </p>
      ) : null}
    </section>
  )
}
