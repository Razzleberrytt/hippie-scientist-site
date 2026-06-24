import { editorialUseCaseLabel, formatDisplayLabel, isClean } from '@/lib/display-utils'

function cleanLabel(value: string) {
  return formatDisplayLabel(value)
}

export default function DecisionCard({
  bestFor = [],
  avoid = [],
  time = '',
  evidence = ''
}: {
  bestFor?: unknown[]
  avoid?: unknown[]
  time?: string
  evidence?: string
}) {
  const cleanedBestFor = bestFor
    .filter(isClean)
    .map((item: unknown) => editorialUseCaseLabel(item as string))
    .filter(isClean)
    .slice(0, 3)

  const cleanedAvoid = avoid
    .filter(isClean)
    .map((item: unknown) => cleanLabel(String(item)))
    .filter(isClean)

  return (
    <div className="surface-depth card-spacing section-spacing">

      <div className="grid gap-6 md:grid-cols-2">

        {cleanedBestFor.length > 0 ? (
          <div className="space-y-3">
            <p className="eyebrow-label">Commonly explored for</p>

            <ul className="space-y-3 text-sm leading-7 text-muted">
              {cleanedBestFor.map((b: string, i: number)=>(
                <li key={i} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700 dark:bg-brand-200" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="eyebrow-label">Safety context</p>

          {cleanedAvoid.length > 0 ? (
            <ul className="space-y-3 text-sm leading-7 text-muted">
              {cleanedAvoid.map((a: string, i: number)=>(
                <li key={i} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-300" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-muted">
              No major cautions surfaced in the current profile.
            </p>
          )}
        </div>

      </div>

      <div className="flex flex-wrap gap-3 border-t border-brand-900/10 pt-2 text-xs font-medium dark:border-white/10">
        <span className="chip-readable">⏱ {time || 'Varies by dosage and context'}</span>
        {evidence ? (
          <span className="chip-readable">📊 {cleanLabel(evidence)}</span>
        ) : null}
      </div>

    </div>
  )
}
