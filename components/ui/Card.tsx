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
