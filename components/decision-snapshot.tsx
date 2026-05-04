type DecisionSnapshotProps = {
  verdict?: string
  bestFor?: string
  safety?: string
  timeToEffect?: string
  evidence?: string
}

const clean = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim()

const evidencePercent = (value?: string): number => {
  const text = clean(value).toLowerCase()
  const numeric = Number(text.match(/\d+(\.\d+)?/)?.[0] ?? '')
  if (!Number.isNaN(numeric) && numeric > 0) return Math.max(8, Math.min(100, numeric <= 10 ? numeric * 10 : numeric))
  if (/high|strong|a\b/.test(text)) return 88
  if (/moderate|b\b/.test(text)) return 64
  if (/limited|low|c\b/.test(text)) return 38
  return 24
}

const verdictTone = (value?: string) => {
  const text = clean(value).toLowerCase()
  if (/no|avoid|high risk/.test(text)) return 'border-red-400/25 bg-red-500/10 text-red-100'
  if (/maybe|caution|review|limited/.test(text)) return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
  return 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
}

function SnapshotStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white sm:text-base">{value}</p>
    </div>
  )
}

export default function DecisionSnapshot({ verdict, bestFor, safety, timeToEffect, evidence }: DecisionSnapshotProps) {
  const percent = evidencePercent(evidence)
  const safeVerdict = clean(verdict) || 'Maybe'

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl shadow-black/25 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">Decision snapshot</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Should you consider it?</h2>
        </div>
        <span className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.16em] ${verdictTone(safeVerdict)}`}>{safeVerdict}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SnapshotStat label="Best For" value={clean(bestFor) || 'General support'} />
        <SnapshotStat label="Safety" value={clean(safety) || 'Review'} />
        <SnapshotStat label="Works In" value={clean(timeToEffect) || 'Varies'} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">Evidence</p>
          <p className="mt-2 text-sm font-black text-white sm:text-base">{clean(evidence) || 'Limited'}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
