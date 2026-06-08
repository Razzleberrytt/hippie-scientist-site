export default function ResearchLimitations({
  limitations,
}: {
  limitations: string[]
}) {
  return (
    <section className="card-premium p-6 space-y-5">
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
            className="rounded-2xl bg-[#f5f3ec] px-4 py-3 text-sm leading-7 text-[#46574d]"
          >
            {limitation}
          </li>
        ))}
      </ul>
    </section>
  )
}
