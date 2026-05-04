import Link from 'next/link'

type CardProps = {
  title: string
  subtitle?: string
  description?: string
  href: string
  badge?: string
  bestFor?: string
  evidence?: string
  safety?: string
  timeToEffect?: string
}

const clean = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim()

export default function Card({
  title,
  subtitle,
  description,
  href,
  badge,
  bestFor,
  evidence,
  safety,
  timeToEffect,
}: CardProps) {
  const stats = [
    evidence ? { label: 'Evidence', value: evidence } : null,
    safety ? { label: 'Safety', value: safety } : null,
    timeToEffect ? { label: 'Works In', value: timeToEffect } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <Link
      href={href}
      className="card-unified group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {subtitle ? <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/70">{subtitle}</p> : null}
          <h3 className="mt-1 line-clamp-2 text-lg font-black text-slate-950 group-hover:text-emerald-700">{title}</h3>
        </div>
        {badge ? <span className="badge shrink-0">{badge}</span> : null}
      </div>

      {description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p> : null}

      {bestFor ? (
        <div className="mt-3 text-sm text-slate-600">
          Best for: <span className="font-bold text-slate-950">{bestFor}</span>
        </div>
      ) : null}

      {stats.length ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.slice(0, 3).map(stat => (
            <div key={stat.label} className="rounded-2xl border border-slate-900/10 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
              <p className="mt-1 truncate text-xs font-black tabular-nums text-slate-950">{clean(stat.value)}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-xs font-black text-slate-500">Decision profile</span>
        <span className="text-sm font-black text-emerald-700 transition group-hover:translate-x-1">Open →</span>
      </div>
    </Link>
  )
}
