export interface MechanismPoint {
  label: string
  description: string
}

interface Props {
  summary: string
  points?: MechanismPoint[]
}

export default function MechanismBox({ summary, points }: Props) {
  return (
    <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4">
      <p className="text-sm leading-7 text-muted">{summary}</p>
      {points && points.length > 0 && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {points.map((point, i) => (
            <div key={i} className="rounded-xl border border-brand-900/5 bg-brand-50/20 p-3">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                {point.label}
              </dt>
              <dd className="mt-1 text-xs leading-5 text-muted">{point.description}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
