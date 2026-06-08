type AffiliateConversionCardProps = {
  eyebrow?: string
  title: string
  description: string
  href: string
  cta?: string
  secondaryHref?: string
  secondaryCta?: string
}

export function AffiliateConversionCard({
  eyebrow = 'Featured Pick',
  title,
  description,
  href,
  cta = 'Compare products →',
  secondaryHref,
  secondaryCta = 'Compare alternatives →',
}: AffiliateConversionCardProps) {
  return (
    <section className='rounded-3xl border border-emerald-900/10 bg-emerald-50/50 p-6 shadow-sm'>
      <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>{eyebrow}</p>
      <h2 className='mt-2 text-2xl font-semibold text-ink'>{title}</h2>
      <p className='mt-2 text-sm leading-6 text-muted'>{description}</p>
      <div className='mt-4 flex flex-wrap gap-2'>
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer sponsored'
          className='rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'
        >
          {cta}
        </a>
        {secondaryHref ? (
          <a
            href={secondaryHref}
            className='rounded-2xl border border-stone-200 bg-white/50 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            {secondaryCta}
          </a>
        ) : null}
      </div>
      <p className='mt-3 text-xs leading-5 text-stone-500'>Amazon affiliate link • No extra cost to you • Educational content, not medical advice.</p>
    </section>
  )
}

