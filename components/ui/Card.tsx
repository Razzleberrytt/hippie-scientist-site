import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
}

export const Card = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <div className={`rounded-2xl bg-white border border-neutral-200 p-5 ${className}`} {...props}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{eyebrow}</p>}
      {title && <h3 className="mt-2 text-lg font-semibold text-black">{title}</h3>}
      {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}

export const DetailCard = ({ children, eyebrow, title, description, className = '', ...props }: CardProps) => {
  return (
    <section className={`rounded-2xl bg-white border border-neutral-200 p-5 ${className}`} {...props}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{eyebrow}</p>}
      {title && <h2 className="mt-2 text-lg font-semibold text-black">{title}</h2>}
      {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
      <div className={eyebrow || title || description ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}

export const EvidenceBadge = ({ value = 'Limited' }: { value?: string }) => {
  const label = String(value || 'Limited')
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800">
      {label}
    </span>
  )
}

export const RoleBadge = ({ role = 'SUPPORT' }: { role?: string }) => {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800">
      {role}
    </span>
  )
}
