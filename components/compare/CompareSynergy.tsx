import type { CompareItem } from '@/lib/compare'

interface CompareSynergyProps {
  item1: CompareItem
  item2: CompareItem
}

function timingContext(item: CompareItem): string | null {
  const timing = item.bestTiming?.trim()
  return timing || null
}

function safetySignals(item: CompareItem): string[] {
  return [
    ...(item.keyInteractions ?? []).map((value) => `${item.name}: interaction — ${value}`),
    ...(item.contraindications ?? []).map((value) => `${item.name}: avoid/caution — ${value}`),
  ].slice(0, 6)
}

export default function CompareSynergy({ item1, item2 }: CompareSynergyProps) {
  const timing1 = timingContext(item1)
  const timing2 = timingContext(item2)
  const safetyItems = [...safetySignals(item1), ...safetySignals(item2)].slice(0, 8)

  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Combination guide</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          What to consider before combining {item1.name} and {item2.name}
        </h2>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-50/60 px-4 py-2 text-sm font-semibold text-safety-caution">
        <span aria-hidden="true">⚠️</span>
        EVIDENCE CHECK — Compatibility not established here
      </div>

      <p className="max-w-prose text-sm leading-relaxed text-muted">
        Shared or different mechanisms can help explain why two ingredients might affect similar outcomes, but mechanism matching alone cannot establish that a combination is safe, beneficial, or appropriately dosed. Review the known interaction and contraindication information for each ingredient before considering a stack.
      </p>

      {safetyItems.length > 0 ? (
        <div className="card-premium p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Safety signals to review</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {safetyItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-safety-caution">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-subtle)] p-4">
          <p className="text-sm leading-6 text-muted">
            No specific interaction signal is surfaced in this comparison dataset. That is not evidence that the combination is interaction-free; interaction data for supplements are often incomplete.
          </p>
        </div>
      )}

      {timing1 || timing2 ? (
        <div className="card-premium space-y-4 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Existing timing context</p>
          <p className="text-xs leading-5 text-muted">
            These are ingredient-specific timing notes already present in the source data, not a combined dosing protocol.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {timing1 ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">{item1.name}</p>
                <p className="text-xs leading-relaxed text-muted">{timing1}</p>
              </div>
            ) : null}
            {timing2 ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">{item2.name}</p>
                <p className="text-xs leading-relaxed text-muted">{timing2}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-yellow-200 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-safety-caution">
          Check the full combination, not just the mechanism
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Supplements can interact with other supplements, prescription or over-the-counter medicines, and health conditions. If you use medications, have a chronic condition, are pregnant or breastfeeding, or are considering multiple active products, review the combination with a pharmacist or other qualified health professional.
        </p>
      </div>
    </section>
  )
}
