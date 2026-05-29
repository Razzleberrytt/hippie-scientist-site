interface MisconceptionCalloutProps {
  myth: string
  reality: string
}

export default function MisconceptionCallout({
  myth,
  reality,
}: MisconceptionCalloutProps) {
  return (
    <section className="rounded-3xl border border-[#d8d3c4] bg-[#faf8f3] p-6 space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">Common Misconception</p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {myth}
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-5 space-y-3 border border-[#e6e1d4]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6b63]">
          Evidence-informed interpretation
        </p>

        <p className="text-sm leading-7 text-[#46574d]">
          {reality}
        </p>
      </div>
    </section>
  )
}
