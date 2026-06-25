import type { ReactNode } from 'react'
import Link from 'next/link'

type PremiumAction = {
  href: string
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

type PremiumHeroProps = {
  eyebrow: string
  title: string
  description?: string
  actions?: PremiumAction[]
  children?: ReactNode
  className?: string
}

type PremiumSectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

type PremiumCardProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
}

type PremiumLinkCardProps = {
  href: string
  eyebrow?: string
  title: string
  description?: string
  meta?: string
  tone?: 'default' | 'safety'
  className?: string
}

type PremiumCalloutProps = {
  children: ReactNode
  tone?: 'default' | 'caution' | 'safety'
  className?: string
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function actionClass(variant: PremiumAction['variant'] = 'primary') {
  if (variant === 'secondary') {
    return 'inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/15 bg-white/75 px-5 py-2.5 text-sm font-bold text-ink shadow-sm backdrop-blur transition hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-brand-50 dark:hover:bg-white/10'
  }

  if (variant === 'ghost') {
    return 'inline-flex min-h-11 items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-sm font-bold text-brand-800 transition hover:border-brand-900/10 hover:bg-white/55 dark:text-brand-100 dark:hover:border-white/10 dark:hover:bg-white/5'
  }

  return 'inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-brand-900 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100'
}

export function PremiumHero({ eyebrow, title, description, actions = [], children, className }: PremiumHeroProps) {
  return (
    <section className={cx('hero-shell rounded-[1.25rem] border border-brand-900/10 p-5 shadow-card sm:rounded-[2rem] sm:p-8 dark:border-white/10', className)}>
      <p className="eyebrow-label">{eyebrow}</p>
      <h1 className="heading-premium mt-3 text-ink">{title}</h1>
      {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">{description}</p> : null}
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={`${action.href}-${action.label}`} href={action.href} className={actionClass(action.variant)}>
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  )
}

export function PremiumSectionHeader({ eyebrow, title, description, className }: PremiumSectionHeaderProps) {
  return (
    <div className={cx('library-section-header max-w-3xl', className)}>
      {eyebrow ? <p className="eyebrow-label">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
    </div>
  )
}

export function PremiumCard({ children, className, as = 'div' }: PremiumCardProps) {
  const Tag = as
  return <Tag className={cx('card-premium p-5 sm:p-6', className)}>{children}</Tag>
}

export function PremiumLinkCard({ href, eyebrow, title, description, meta, tone = 'default', className }: PremiumLinkCardProps) {
  const safetyClass = tone === 'safety'
    ? 'border-rose-700/15 bg-rose-50/70 hover:border-rose-700/25 hover:bg-rose-50 dark:border-rose-200/20 dark:bg-rose-950/25 dark:hover:bg-rose-950/35'
    : 'library-content-card card-premium hover:border-brand-700/20'

  return (
    <Link href={href} className={cx('block rounded-2xl p-5 transition', safetyClass, className)}>
      {eyebrow ? <p className={cx('text-[10px] font-bold uppercase tracking-[0.16em]', tone === 'safety' ? 'text-rose-800 dark:text-rose-200' : 'text-brand-700 dark:text-brand-200')}>{eyebrow}</p> : null}
      <h3 className={cx('mt-2 text-base font-semibold tracking-tight', tone === 'safety' ? 'text-rose-950 dark:text-rose-50' : 'text-ink')}>{title}</h3>
      {description ? <p className={cx('mt-2 text-sm leading-6', tone === 'safety' ? 'text-rose-900 dark:text-rose-100/85' : 'text-muted')}>{description}</p> : null}
      {meta ? <p className="mt-3 text-xs font-semibold text-muted">{meta}</p> : null}
    </Link>
  )
}

export function PremiumCallout({ children, tone = 'default', className }: PremiumCalloutProps) {
  const toneClass = tone === 'caution'
    ? 'border-amber-600/25 bg-amber-50/80 text-amber-950 dark:border-amber-200/25 dark:bg-amber-300/10 dark:text-amber-50'
    : tone === 'safety'
      ? 'border-rose-700/15 bg-rose-50/70 text-rose-950 dark:border-rose-200/20 dark:bg-rose-950/25 dark:text-rose-50'
      : 'border-brand-900/10 bg-brand-50/70 text-muted dark:border-white/10 dark:bg-white/5'

  return (
    <section className={cx('rounded-2xl border p-5 text-sm leading-7 shadow-sm', toneClass, className)}>
      {children}
    </section>
  )
}
