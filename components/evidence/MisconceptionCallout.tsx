interface MisconceptionCalloutProps {
  myth: string
  reality: string
}

export default function MisconceptionCallout({
  myth,
  reality,
}: MisconceptionCalloutProps) {
  return (
    <section className="space-y-5 rounded-3xl border border-brand-900/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="space-y-2">
        <p className="eyebrow-label">Common Misconception</p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {myth}
        </h2>
      </div>

      <div className="space-y-3 rounded-2xl border border-brand-900/10 bg-brand-50/70 p-5 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-100">
          Evidence-informed interpretation
        </p>

        <p className="text-sm leading-7 text-muted sm:text-base">
          {reality}
        </p>
      </div>
    </section>
  )
}
