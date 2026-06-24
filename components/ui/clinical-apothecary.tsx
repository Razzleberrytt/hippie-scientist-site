import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleAlert,
  FlaskConical,
  Leaf,
  ShieldAlert,
  XCircle,
} from 'lucide-react'

type LinkTarget = {
  href: string
  label?: string
}

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  as?: 'h1' | 'h2' | 'h3'
  action?: LinkTarget
  className?: string
}

type EvidenceBadgeProps = {
  value?: string
  tone?: 'strong' | 'moderate' | 'limited' | 'theoretical'
  className?: string
}

type SafetyBadgeProps = {
  children?: ReactNode
  label?: string
  level?: 'ok' | 'caution' | 'avoid'
  className?: string
}

type CardBaseProps = {
  className?: string
  children?: ReactNode
}

type GoalCardProps = CardBaseProps & {
  href: string
  title: string
  description: string
  meta?: string
}

type BestFitCardProps = CardBaseProps & {
  title: string
  description?: string
  label?: string
}

type ComparisonCardProps = CardBaseProps & {
  href?: string
  title: string
  description?: string
  eyebrow?: string
}

type ProductPickCardProps = CardBaseProps & {
  href?: string
  title: string
  evidence?: string
  safety?: string
  bestFor?: string
  dose?: string
  mechanism?: string
}

type MethodologyStripProps = CardBaseProps & {
  title?: string
  description: ReactNode
  href?: string
  linkLabel?: string
}

type InternalLinkCardProps = CardBaseProps & {
  href: string
  title: string
  description?: string
}

const evidenceToneClasses: Record<NonNullable<EvidenceBadgeProps['tone']>, string> = {
  strong: 'border-emerald-800/15 bg-emerald-50/80 text-emerald-900',
  moderate: 'border-amber-700/20 bg-amber-50/80 text-amber-950',
  limited: 'border-slate-700/15 bg-white/75 text-slate-800',
  theoretical: 'border-brand-900/10 bg-sage-50/80 text-brand-800',
}

const safetyToneClasses: Record<NonNullable<SafetyBadgeProps['level']>, string> = {
  ok: 'border-emerald-800/15 bg-emerald-50/80 text-emerald-900',
  caution: 'border-amber-700/20 bg-amber-50/85 text-amber-950',
  avoid: 'border-red-800/20 bg-red-50/85 text-red-950',
}

const clinicalCard =
  'rounded-lg border border-brand-900/10 bg-[rgba(247,250,242,0.78)] shadow-[0_1px_2px_rgba(16,32,24,0.045)] dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)]'

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  as: HeadingTag = 'h2',
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={joinClasses('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow ? <p className="eyebrow-label text-brand-700">{eyebrow}</p> : null}
        <HeadingTag className="mt-2 max-w-[24ch] font-display text-2xl font-semibold leading-tight tracking-normal text-ink sm:text-3xl">
          {title}
        </HeadingTag>
        {subtitle ? <p className="mt-3 max-w-reading text-sm leading-7 text-muted sm:text-base">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
          {action.label ?? 'View more'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}

export function EvidenceBadge({ value = 'Evidence review', tone = 'moderate', className }: EvidenceBadgeProps) {
  return (
    <span className={joinClasses('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none', evidenceToneClasses[tone], className)}>
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      {value}
    </span>
  )
}

export function SafetyBadge({ children, label = 'Safety review', level = 'caution', className }: SafetyBadgeProps) {
  const Icon = level === 'avoid' ? ShieldAlert : CircleAlert
  return (
    <span className={joinClasses('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none', safetyToneClasses[level], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children ?? label}
    </span>
  )
}

export function GoalCard({ href, title, description, meta, className, children }: GoalCardProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        clinicalCard,
        'group flex min-h-44 flex-col justify-between p-5 transition hover:border-brand-700/25 hover:bg-white/90 hover:text-ink dark:hover:bg-[var(--surface-card-strong)]',
        className
      )}
    >
      <div>
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-brand-900/10 bg-white/80 text-brand-800 dark:bg-[var(--surface-subtle)]">
          <Leaf className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        {meta ? <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">{meta}</p> : null}
        <h3 className="mt-2 text-xl font-semibold tracking-normal text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-900">
        Start here
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
      {children}
    </Link>
  )
}

export function BestForCard({ title, description, label = 'Best for', className, children }: BestFitCardProps) {
  return (
    <div className={joinClasses(clinicalCard, 'border-l-4 border-l-emerald-700/45 p-5', className)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {label}
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-normal text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      {children}
    </div>
  )
}

export function NotBestForCard({ title, description, label = 'Use caution', className, children }: BestFitCardProps) {
  return (
    <div className={joinClasses('rounded-lg border border-red-800/15 bg-red-50/70 p-5 dark:bg-[var(--surface-danger)]', className)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-950 dark:text-red-200">
        <XCircle className="h-4 w-4" aria-hidden="true" />
        {label}
      </p>
      <h3 className="mt-2 text-base font-semibold tracking-normal text-red-950 dark:text-[var(--text-primary)]">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-red-900/85 dark:text-red-100">{description}</p> : null}
      {children}
    </div>
  )
}

export function ComparisonCard({ href, title, description, eyebrow, className, children }: ComparisonCardProps) {
  const content = (
    <>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">{eyebrow}</p> : null}
      <h3 className="mt-2 text-base font-semibold tracking-normal text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      {children}
      {href ? (
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
          Compare
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={joinClasses(clinicalCard, 'block p-5 hover:border-brand-700/25 hover:bg-white/90 dark:hover:bg-[var(--surface-card-strong)]', className)}>
        {content}
      </Link>
    )
  }

  return <div className={joinClasses(clinicalCard, 'p-5', className)}>{content}</div>
}

export function ProductPickCard({
  href,
  title,
  evidence,
  safety,
  bestFor,
  dose,
  mechanism,
  className,
  children,
}: ProductPickCardProps) {
  return (
    <article className={joinClasses(clinicalCard, 'p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {href ? (
          <Link href={href} className="text-xl font-semibold tracking-normal text-brand-800 hover:text-brand-900">
            {title}
          </Link>
        ) : (
          <span className="text-xl font-semibold tracking-normal text-ink">{title}</span>
        )}
        {evidence ? <EvidenceBadge value={evidence} /> : null}
      </div>
      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        {mechanism ? (
          <div>
            <p className="font-semibold text-ink">Mechanism</p>
            <p className="mt-1 leading-6 text-muted">{mechanism}</p>
          </div>
        ) : null}
        {bestFor ? (
          <div>
            <p className="font-semibold text-ink">Best for</p>
            <p className="mt-1 leading-6 text-muted">{bestFor}</p>
          </div>
        ) : null}
        {dose ? (
          <div>
            <p className="font-semibold text-ink">Typical dose</p>
            <p className="mt-1 leading-6 text-muted">{dose}</p>
          </div>
        ) : null}
        {safety ? (
          <div>
            <p className="font-semibold text-ink">Safety</p>
            <p className="mt-1 leading-6 text-muted">{safety}</p>
          </div>
        ) : null}
      </div>
      {children}
      {href ? (
        <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
          Full profile
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  )
}

export function MethodologyStrip({
  title = 'Evidence approach',
  description,
  href = '/methodology',
  linkLabel = 'Read methodology',
  className,
  children,
}: MethodologyStripProps) {
  return (
    <aside className={joinClasses('rounded-lg border border-amber-700/20 bg-amber-50/80 p-4 text-sm text-amber-950 dark:bg-[var(--surface-warning)]', className)}>
      <div className="flex gap-3">
        <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-800 dark:text-[var(--accent-warning)]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <div className="mt-1 leading-6 text-amber-950 dark:text-[var(--text-secondary)]">{description}</div>
          {children}
          {href ? (
            <Link href={href} className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-800 hover:text-brand-900">
              {linkLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

export function InternalLinkCard({ href, title, description, className, children }: InternalLinkCardProps) {
  return (
    <Link href={href} className={joinClasses(clinicalCard, 'block p-4 hover:border-brand-700/25 hover:bg-white/90 dark:hover:bg-[var(--surface-card-strong)]', className)}>
      <h3 className="text-sm font-semibold tracking-normal text-ink">{title}</h3>
      {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
      {children}
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        Open
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  )
}
