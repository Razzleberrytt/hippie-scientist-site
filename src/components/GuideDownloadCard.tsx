import type { ReactNode } from 'react'

type GuideDownloadCardProps = {
  title: string
  description: string
  buttonText: string
  fileUrl: string
  eyebrow?: string
  className?: string
  footer?: ReactNode
}

export default function GuideDownloadCard({
  title,
  description,
  buttonText,
  fileUrl,
  eyebrow,
  className = '',
  footer,
}: GuideDownloadCardProps) {
  return (
    <section
      className={`ds-card-lg border border-white/14 bg-gradient-to-br from-slate-950/90 via-slate-900/84 to-slate-950/92 ${className}`.trim()}
    >
      {eyebrow && (
        <p className='text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80'>
          {eyebrow}
        </p>
      )}
      <h2 className='mt-2 text-2xl font-semibold text-white sm:text-3xl'>{title}</h2>
      <p className='mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base'>
        {description}
      </p>
      <div className='mt-5 flex flex-wrap items-center gap-3'>
        <a
          href={fileUrl}
          download
          className='btn-primary inline-flex items-center justify-center'
          aria-label={`${buttonText} (PDF)`}
        >
          {buttonText}
        </a>
      </div>
      {footer && <div className='mt-4 text-sm text-white/70'>{footer}</div>}
    </section>
  )
}
