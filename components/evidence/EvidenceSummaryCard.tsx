import EvidenceBadge from './EvidenceBadge'

interface EvidenceSummaryCardProps {
  title: string
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Traditional' | 'Theoretical'
  humanEvidence?: string
  mechanisticEvidence?: string
  safetyProfile?: string
}

export default function EvidenceSummaryCard({
  title,
  evidenceLevel,
  humanEvidence,
  mechanisticEvidence,
  safetyProfile,
}: EvidenceSummaryCardProps) {
  const rows = [
    humanEvidence ? { label: 'Human evidence', value: humanEvidence } : null,
    mechanisticEvidence ? { label: 'Research signal', value: mechanisticEvidence } : null,
    safetyProfile ? { label: 'Safety profile', value: safetyProfile } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row))

  return (
    <section className="border-y border-[color:var(--hs-hairline-strong)] py-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-label">Evidence Snapshot</p>
        <EvidenceBadge level={evidenceLevel} />
      </div>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--hs-ink)] sm:text-3xl">
        {title}
      </h2>

      {rows.length > 0 ? (
        <dl className="mt-4 grid border-y border-[color:var(--hs-hairline)] lg:grid-cols-3">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className="py-4 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 [&+div]:border-t [&+div]:border-[color:var(--hs-hairline)] lg:[&+div]:border-t-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xs tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--hs-body)]">
                  {row.label}
                </dt>
              </div>
              <dd className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
