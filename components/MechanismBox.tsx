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
    <section className="border-y border-[color:var(--hs-hairline-strong)] py-5">
      <p className="max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">{summary}</p>

      {points && points.length > 0 ? (
        <dl className="mt-4 divide-y divide-[color:var(--hs-hairline)] border-t border-[color:var(--hs-hairline)]">
          {points.map((point, index) => (
            <div
              key={`${point.label}-${index}`}
              className="grid gap-1 py-3.5 sm:grid-cols-[2.75rem_10rem_minmax(0,1fr)] sm:items-start sm:gap-4"
            >
              <span className="hidden font-display text-sm tabular-nums text-[color:var(--hs-gold)] sm:block" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--tone-ink)]">
                {point.label}
              </dt>
              <dd className="text-sm leading-6 text-[color:var(--hs-body)]">{point.description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
