type TrustMethodologyCalloutProps = {
  title?: string
  className?: string
}

export function TrustMethodologyCallout({
  title = 'How these rankings are weighed',
  className = '',
}: TrustMethodologyCalloutProps) {
  return (
    <section className={`rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5 shadow-sm ${className}`}>
      <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Evidence-aware methodology</p>
      <h2 className='mt-2 text-xl font-semibold text-ink'>{title}</h2>
      <p className='mt-3 text-sm leading-7 text-muted'>
        Rankings weigh human evidence, safety context, practical usefulness, and uncertainty. The goal is transparent decision support, not medical advice or a promise that a supplement will work for every reader.
      </p>
    </section>
  )
}
