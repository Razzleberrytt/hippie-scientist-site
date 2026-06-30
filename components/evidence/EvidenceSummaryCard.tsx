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
  return (
    <section className="card-premium p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-label">Evidence Snapshot</p>

        <EvidenceBadge level={evidenceLevel} />
      </div>

      <h2 className="text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {humanEvidence ? (
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
              Human evidence
            </p>

            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {humanEvidence}
            </p>
          </div>
        ) : null}

        {mechanisticEvidence ? (
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
              Research signal
            </p>

            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {mechanisticEvidence}
            </p>
          </div>
        ) : null}

        {safetyProfile ? (
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-4 space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
              Safety profile
            </p>

            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {safetyProfile}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
