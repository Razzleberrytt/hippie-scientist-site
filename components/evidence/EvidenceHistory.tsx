import {
  buildAnnualEvidenceHistory,
  evidenceChangedBadge,
  type EvidenceVersionSnapshot,
} from '@/lib/evidence/claim-freshness'

export type EvidenceHistoryProps = {
  snapshots: EvidenceVersionSnapshot[]
  compact?: boolean
}

function readableDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function EvidenceHistory({ snapshots, compact = false }: EvidenceHistoryProps) {
  const ordered = [...snapshots].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  )
  const latest = ordered.at(-1)
  const previous = ordered.at(-2) ?? null
  const badge = latest ? evidenceChangedBadge(previous, latest) : null
  const annual = buildAnnualEvidenceHistory(ordered)

  if (!latest) return null

  return (
    <section aria-label="Evidence grade history" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Current evidence grade: {latest.grade}</span>
        {badge ? (
          <span
            className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
            title={`Changed from ${badge.previousGrade} to ${badge.currentGrade} on ${readableDate(badge.changedAt)}`}
          >
            Evidence changed
          </span>
        ) : null}
      </div>

      {!compact ? (
        <details>
          <summary className="cursor-pointer text-sm font-medium">View evidence grade history</summary>
          <div className="mt-3 space-y-4">
            {annual.map(({ year, snapshots: yearSnapshots }) => (
              <div key={year}>
                <h3 className="text-sm font-semibold">{year}</h3>
                <ol className="mt-1 space-y-2">
                  {yearSnapshots.map((snapshot) => (
                    <li key={snapshot.versionId} className="text-sm">
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <strong>Grade {snapshot.grade}</strong>
                        <time dateTime={snapshot.createdAt}>{readableDate(snapshot.createdAt)}</time>
                        <span>Method {snapshot.gradingVersion}</span>
                      </div>
                      {snapshot.changeReason ? <p className="mt-1 text-sm opacity-80">{snapshot.changeReason}</p> : null}
                      {snapshot.triggeredByStudyIds.length ? (
                        <p className="mt-1 text-xs opacity-70">
                          Triggering studies: {snapshot.triggeredByStudyIds.join(', ')}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  )
}
