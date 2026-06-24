export default function ResearchLimitations({
  limitations,
}: {
  limitations: string[]
}) {
  return (
    <section className="card-premium space-y-5 p-6">
      <div className="space-y-2">
        <p className="eyebrow-label">Evidence Interpretation</p>

        <h2 className="text-3xl font-semibold tracking-tight text-ink">
          Research limitations
        </h2>
      </div>

      <ul className="space-y-3">
        {limitations.map((limitation) => (
          <li
            key={limitation}
            className="rounded-2xl border border-brand-900/10 bg-brand-50/70 px-4 py-3 text-sm leading-7 text-muted dark:border-white/10 dark:bg-white/5"
          >
            {limitation}
          </li>
        ))}
      </ul>
    </section>
  )
}
