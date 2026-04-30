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
  eyebrow = 'Best overall',
  title,
  description,
  href,
  cta = 'View top-rated options →',
  secondaryHref,
  secondaryCta = 'Learn more →',
}: AffiliateConversionCardProps) {
  return (
    <section className='rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-5 shadow-xl shadow-emerald-950/10'>
      <p className='text-xs font-black uppercase tracking-[0.22em] text-emerald-100/75'>{eyebrow}</p>
      <h2 className='mt-2 text-2xl font-black text-white'>{title}</h2>
      <p className='mt-2 text-sm leading-6 text-white/70'>{description}</p>
      <div className='mt-4 flex flex-wrap gap-2'>
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer sponsored'
          className='rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200'
        >
          {cta}
        </a>
        {secondaryHref ? (
          <a
            href={secondaryHref}
            className='rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'
          >
            {secondaryCta}
          </a>
        ) : null}
      </div>
      <p className='mt-3 text-xs leading-5 text-white/45'>Amazon affiliate link • No extra cost to you • Educational content, not medical advice.</p>
    </section>
  )
}
