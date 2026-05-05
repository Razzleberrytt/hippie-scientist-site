import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
}

export function Card({ children, eyebrow, title, description, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-card transition-shadow hover:shadow-lg sm:p-6 ${className}`}
      {...props}
    >
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p> : null}
      {title ? <h3 className="mt-2 text-xl font-bold tracking-tight text-neutral-950">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p> : null}
      <div className={eyebrow || title || description ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}

export function DetailCard({ children, eyebrow, title, description, className = '', ...props }: CardProps) {
  return (
    <section
      className={`rounded-[1.75rem] border border-neutral-200 bg-white/95 p-5 shadow-card sm:p-7 ${className}`}
      {...props}
    >
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p> : null}
      {title ? <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">{title}</h2> : null}
      {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">{description}</p> : null}
      <div className={eyebrow || title || description ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

export function EvidenceBadge({ value = 'Limited' }: { value?: string }) {
  const label = String(value || 'Limited')
  const normalized = label.toLowerCase()
  const tone = normalized.includes('likely') || normalized.includes('strong') || normalized.includes('high') || normalized.includes('effective')
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : normalized.includes('moderate') || normalized.includes('mixed') || normalized.includes('emerging')
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-neutral-200 bg-neutral-50 text-neutral-700'

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>{label}</span>
}

export function RoleBadge({ role = 'SUPPORT' }: { role?: string }) {
  const label = String(role || 'SUPPORT').replace(/[-_]/g, ' ').toUpperCase()
  const normalized = label.toLowerCase()
  const tone = normalized.includes('anchor')
    ? 'border-teal-200 bg-teal-50 text-teal-800'
    : normalized.includes('amplifier')
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-slate-200 bg-slate-50 text-slate-700'

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${tone}`}>{label}</span>
}
