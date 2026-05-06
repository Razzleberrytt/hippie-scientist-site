import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
}

export const Card = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`card-premium card-spacing group ${className}`}
      {...props}
    >
      {eyebrow && <p className="eyebrow-label text-brand-700">{eyebrow}</p>}
      {title && <h3 className="mt-3 max-w-[20ch] font-sans text-xl font-semibold leading-snug tracking-tight text-ink">{title}</h3>}
      {description && <p className="mt-3 text-sm leading-7 text-[#46574d] sm:text-[0.96rem]">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-5' : ''}>{children}</div>
    </div>
  )
}

export const DetailCard = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <section
      className={`surface-depth card-spacing ${className}`}
      {...props}
    >
      {eyebrow && <p className="eyebrow-label text-brand-700">{eyebrow}</p>}
      {title && <h2 className="mt-3 max-w-[22ch] font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{title}</h2>}
      {description && <p className="mt-3 max-w-reading text-sm leading-7 text-[#46574d] sm:text-[0.98rem]">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-6' : ''}>{children}</div>
    </section>
  )
}

export const EvidenceBadge = ({ value = 'Limited' }: { value?: string }) => {
  const label = String(value || 'Limited')
  return (
    <span className="inline-flex items-center rounded-full border border-brand-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#33443a] shadow-sm">
      {label}
    </span>
  )
}

export const RoleBadge = ({ role = 'SUPPORT' }: { role?: string }) => {
  return (
    <span className="inline-flex items-center rounded-full border border-sage-700/15 bg-sage-100/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-800 shadow-sm">
      {role}
    </span>
  )
}
