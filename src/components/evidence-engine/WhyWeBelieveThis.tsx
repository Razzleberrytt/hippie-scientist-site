type WhyWeBelieveThisProps = {
  evidenceSummary: string
  limitations?: string | null
  populationLimitations?: string | null
  conclusionChangeTrigger?: string | null
  sourceCount?: number
}

export default function WhyWeBelieveThis({
  evidenceSummary,
  limitations,
  populationLimitations,
  conclusionChangeTrigger,
  sourceCount = 0,
}: WhyWeBelieveThisProps) {
  return (
    <details
      open
      className="group mt-4 border-y border-[color:var(--hs-hairline-strong)] !bg-transparent !shadow-none"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-1 py-3 text-left [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--tone-ink)]">
            Why we believe this
          </span>
          {sourceCount > 0 ? (
            <span className="text-xs font-normal text-[color:var(--hs-body)]">
              {sourceCount} cited source{sourceCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </span>
        <svg
          className="size-4 shrink-0 text-[color:var(--hs-body)] transition-transform group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="border-t border-[color:var(--hs-hairline)] px-1 pb-5 pt-4 text-sm leading-7 text-[color:var(--hs-body)]">
        <p className="max-w-3xl text-[color:var(--hs-body)]">{evidenceSummary}</p>

        {(limitations || populationLimitations) ? (
          <dl className="mt-4 divide-y divide-[color:var(--hs-hairline)] border-y border-[color:var(--hs-hairline)]">
            {limitations ? (
              <div className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-ink)]">Limitations</dt>
                <dd>{limitations}</dd>
              </div>
            ) : null}
            {populationLimitations ? (
              <div className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-ink)]">Population limits</dt>
                <dd>{populationLimitations}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {conclusionChangeTrigger ? (
          <div className="relative mt-4 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[color:var(--hs-gold)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--hs-ink)]">What would change our conclusion?</p>
            <p className="mt-1 max-w-3xl">{conclusionChangeTrigger}</p>
          </div>
        ) : null}
      </div>
    </details>
  )
}
