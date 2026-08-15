type WhyWeBelieveThisProps = {
  evidenceSummary: string
  limitations?: string | null
  populationLimitations?: string | null
  sourceCount?: number
}

export default function WhyWeBelieveThis({
  evidenceSummary,
  limitations,
  populationLimitations,
  sourceCount = 0,
}: WhyWeBelieveThisProps) {
  return (
    <details open className="mt-4 rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
      <summary className="cursor-pointer font-semibold text-ink">
        Why we believe this
        {sourceCount > 0 ? (
          <span className="ml-2 text-xs font-normal text-muted">
            {sourceCount} cited source{sourceCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[#36483e] dark:text-[var(--text-muted)]">
        <p>{evidenceSummary}</p>
        {limitations ? (
          <p><strong className="text-ink">Limitations:</strong> {limitations}</p>
        ) : null}
        {populationLimitations ? (
          <p><strong className="text-ink">Population limits:</strong> {populationLimitations}</p>
        ) : null}
      </div>
    </details>
  )
}
