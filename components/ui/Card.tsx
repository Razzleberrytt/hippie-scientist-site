import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
}

export const Card = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <div className={`rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 motion-safe:hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] ${className}`} {...props}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>}
      {title && <h3 className="mt-2 text-xl font-bold tracking-tight text-ink">{title}</h3>}
      {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}

export const DetailCard = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <section className={`rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 motion-safe:hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:p-7 ${className}`} {...props}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>}
      {title && <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>}
      {description && <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

export const EvidenceBadge = ({ value = 'Limited' }: { value?: string }) => {
  const label = String(value || 'Limited').replace(/[-_]/g, ' ')
  const normalized = label.toLowerCase()

  const tone = normalized.includes('likely') || normalized.includes('strong') || normalized.includes('high') || normalized.includes('effective')
    ? 'border-emerald-200/70 bg-emerald-50 text-emerald-700'
    : normalized.includes('moderate') || normalized.includes('mixed') || normalized.includes('emerging')
      ? 'border-amber-200/70 bg-amber-50 text-amber-700'
      : 'border-neutral-200 bg-neutral-50 text-neutral-700'

  const mapped = normalized.includes('likely') || normalized.includes('strong') || normalized.includes('high') || normalized.includes('effective') ? 'Likely Effective' : (normalized.includes('moderate') || normalized.includes('mixed') ? 'Moderate Evidence' : 'Limited Evidence')

  return <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{mapped}</span>
}

export const RoleBadge = ({ role = 'SUPPORT' }: { role?: string }) => {
  const label = String(role || 'SUPPORT').replace(/[-_]/g, ' ').toUpperCase()
  const normalized = label.toLowerCase()

  const tone = normalized.includes('anchor')
    ? 'border-teal-200 bg-teal-50 text-teal-800'
    : normalized.includes('amplifier')
      ? 'border-emerald-200/70 bg-emerald-50 text-emerald-700'
      : 'border-slate-200 bg-slate-50 text-slate-700'

  return <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${tone}`}>{label}</span>
}
