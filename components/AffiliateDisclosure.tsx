import Link from 'next/link'

type AffiliateDisclosureProps = {
  variant?: 'compact' | 'full'
  className?: string
}

export default function AffiliateDisclosure({ variant = 'full', className = '' }: AffiliateDisclosureProps) {
  if (variant === 'compact') {
    return (
      <p className={`text-xs italic leading-6 text-muted ${className}`}>
        Affiliate disclosure: we may earn a commission from qualifying links at no extra cost to you.{' '}
        <Link
          className='font-medium not-italic text-brand-700 underline decoration-brand-700/35 underline-offset-2 hover:decoration-brand-700'
          href='/info/affiliate-disclosure/'
        >
          How we stay independent
        </Link>
        .
      </p>
    )
  }

  return (
    <section className={`rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-amber-100 ${className}`}>
      <h2 className='text-base font-semibold text-amber-950 dark:text-amber-100'>Affiliate disclosure</h2>
      <p className='mt-2'>
        Some pages may include affiliate links. If you buy through those links, The Hippie Scientist may earn a commission at no additional cost to you. Affiliate relationships do not change evidence ratings, safety warnings, product-quality criteria, or editorial conclusions.
      </p>
      <Link
        className='mt-3 inline-flex font-semibold text-amber-950 underline decoration-amber-900/30 underline-offset-4 hover:decoration-amber-900/70 dark:text-amber-100 dark:decoration-amber-200/35 dark:hover:decoration-amber-200/70'
        href='/info/affiliate-disclosure/'
      >
        Read our affiliate and editorial policy
      </Link>
    </section>
  )
}
