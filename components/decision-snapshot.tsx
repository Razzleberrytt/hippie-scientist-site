type DecisionSnapshotProps = {
  verdict?: string
  bestFor?: string
  safety?: string
  timeToEffect?: string
  evidence?: string
}

const clean = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim()

const evidenceScore = (value?: string): number => {
  const t = clean(value).toLowerCase()
  const n = Number(t.match(/\d+(\.\d+)?/)?.[0] ?? '')
  if (!Number.isNaN(n) && n > 0) return n <= 10 ? n : n / 10
  if (/high|strong/.test(t)) return 8
  if (/moderate/.test(t)) return 6
  if (/low|limited/.test(t)) return 3
  return 4
}

const safetyScore = (value?: string): number => {
  const t = clean(value).toLowerCase()
  if (/avoid|contraindicat|danger/.test(t)) return 2
  if (/caution|interact/.test(t)) return 5
  return 8
}

const deriveVerdict = (e?: string, s?: string): string => {
  const ev = evidenceScore(e)
  const sa = safetyScore(s)

  if (ev >= 7 && sa >= 7) return 'YES'
  if (ev >= 5 && sa >= 4) return 'MAYBE'
  return 'NO'
}

const evidencePercent = (value?: string): number => {
  const base = evidenceScore(value)
  return Math.max(8, Math.min(100, base * 10))
}

const verdictTone = (value?: string) => {
  const text = clean(value).toLowerCase()
  if (/no/.test(text)) return 'border-red-400/25 bg-red-500/10 text-red-100'
  if (/maybe/.test(text)) return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
  return 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
}

function SnapshotStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  )
}

export default function DecisionSnapshot({ verdict, bestFor, safety, timeToEffect, evidence }: DecisionSnapshotProps) {
  const computed = deriveVerdict(evidence, safety)
  const providedVerdict = clean(verdict)
  const finalVerdict = providedVerdict && providedVerdict.length < 10 ? providedVerdict : computed
  const percent = evidencePercent(evidence)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black">Decision</h2>
        <span className={`rounded-full px-4 py-1 text-sm font-black ${verdictTone(finalVerdict)}`}>{finalVerdict}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {clean(bestFor) ? <SnapshotStat label="Best For" value={clean(bestFor)} /> : null}
        <SnapshotStat label="Safety" value={clean(safety) || 'Review'} />
        <SnapshotStat label="Works In" value={clean(timeToEffect) || 'See profile'} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <p className="text-[11px] text-white/50">Evidence</p>
          <p className="font-bold">{clean(evidence) || 'Limited'}</p>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
