export interface MechanismPoint {
  label: string
  description: string
}

interface Props {
  summary: string
  points?: MechanismPoint[]
  diagramPlaceholder?: boolean
}

export default function MechanismBox({ summary, points, diagramPlaceholder }: Props) {
  return (
    <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4">
      <p className="text-sm leading-7 text-muted">{summary}</p>
      {diagramPlaceholder && (
        <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-brand-900/10 bg-brand-50/30">
          <span className="text-xs font-medium text-muted">Mechanism diagram — coming soon</span>
        </div>
      )}
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
