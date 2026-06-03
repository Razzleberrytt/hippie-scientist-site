type AffiliateDisclosureProps = {
  variant?: 'compact' | 'full'
  className?: string
}

export default function AffiliateDisclosure({ variant = 'full', className = '' }: AffiliateDisclosureProps) {
  if (variant === 'compact') {
    return (
      <p className={`text-xs italic leading-6 text-muted ${className}`}>
        Affiliate disclosure: we may earn a commission from qualifying links at no extra cost to you.
      </p>
    )
  }

  return (
    <section className={`rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950 ${className}`}>
      <h2 className='text-base font-semibold text-amber-950'>Affiliate disclosure</h2>
      <p className='mt-2'>
        Some pages may include affiliate links. If you buy through those links, The Hippie Scientist may earn a commission at no additional cost to you. Affiliate relationships do not change evidence ratings, safety warnings, product-quality criteria, or editorial conclusions.
      </p>
    </section>
  )
}
