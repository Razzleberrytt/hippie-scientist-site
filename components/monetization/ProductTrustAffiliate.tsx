import Link from 'next/link'

type ProductTrustAffiliateProps = {
  productName: string
  brand?: string
  href: string
  rationale: string
  slotLabel?: string
  compact?: boolean
  suppressMonetization?: boolean
}

export default function ProductTrustAffiliate({
  productName,
  brand,
  href,
  rationale,
  slotLabel,
  compact = false,
  suppressMonetization = false,
}: ProductTrustAffiliateProps) {
  if (suppressMonetization) return null

  const displayTitle = brand ? `${brand} — ${productName}` : productName

  if (compact) {
    return (
      <div className='mt-4 space-y-3 border-t border-brand-900/10 pt-4 dark:border-white/10'>
        <p className='text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-brand-200'>
          Why we link this {slotLabel ? `(${slotLabel})` : ''}
        </p>
        <p className='text-xs leading-relaxed text-muted'>{rationale}</p>
        <p className='text-[10px] leading-relaxed text-muted'>
          Third-party testing, labeled standardization, and clear serving size weighed more than lowest price.
        </p>
        <a
          href={href}
          target='_blank'
          rel='nofollow sponsored noopener noreferrer'
          className='inline-flex min-h-10 w-full items-center justify-center rounded-full bg-brand-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-900 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100'
        >
          Review on Amazon →
        </a>
      </div>
    )
  }

  return (
    <article className='rounded-2xl border border-brand-900/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5'>
      {slotLabel ? (
        <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-brand-200'>{slotLabel}</p>
      ) : null}
      <h3 className='mt-1 text-base font-semibold text-ink'>{displayTitle}</h3>
      <p className='mt-2 text-sm leading-6 text-muted'>
        <strong className='font-semibold text-ink'>Why we recommend it:</strong> {rationale}
      </p>
      <ul className='mt-3 space-y-1.5 text-xs leading-relaxed text-muted'>
        <li>• Prefer third-party tested brands (USP, NSF, ConsumerLab, or published COA)</li>
        <li>• Standardized actives on the label — not proprietary blends only</li>
        <li>• Value = dose transparency + quality markers, not hype or lowest unit price alone</li>
      </ul>
      <a
        href={href}
        target='_blank'
        rel='nofollow sponsored noopener noreferrer'
        className='mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100'
      >
        Check {productName} sourcing on Amazon →
      </a>
      <p className='mt-2 text-[10px] text-muted'>
        Affiliate link.{' '}
        <Link href='/affiliate-disclosure' className='font-semibold text-emerald-800 hover:underline dark:text-brand-100'>
          Disclosure
        </Link>
      </p>
    </article>
  )
}
