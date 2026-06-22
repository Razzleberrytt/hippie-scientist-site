import type { CompareItem } from '@/lib/compare'

interface CompareSafetyProps {
  item1: CompareItem
  item2: CompareItem
}

/** Truncate a string to at most `n` sentences. */
function firstNSentences(text: string, n: number): string {
  const matches = text.match(/[^.!?]+[.!?]+/g)
  if (!matches) return text
  return matches.slice(0, n).join(' ').trim()
}

function SafetyList({
  items,
  limit,
  fallback,
}: {
  items: string[] | undefined
  limit: number
  fallback: string
}) {
  const visible = items?.slice(0, limit)
  if (!visible || visible.length === 0) {
    return <p className="text-sm text-muted italic">{fallback}</p>
  }
  return (
    <ul className="list-disc pl-5 space-y-1 mt-1">
      {visible.map((item) => (
        <li key={item} className="text-sm text-muted leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  )
}

function ItemSafetyCard({ item }: { item: CompareItem }) {
  const safetyText = item.safety ? firstNSentences(item.safety, 2) : null

  return (
    <div className="card-premium p-6 space-y-4">
      <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
        {item.name}
      </h3>

      <div className="space-y-4 text-sm">
        {/* Side effects */}
        <div>
          <p className="font-semibold text-ink">Potential Side Effects</p>
          <SafetyList
            items={item.sideEffects}
            limit={4}
            fallback="None commonly reported."
          />
        </div>

        {/* Who should avoid */}
        <div>
          <p className="font-semibold text-ink">Who Should Avoid</p>
          <SafetyList
            items={item.contraindications}
            limit={4}
            fallback="No major contraindications documented."
          />
        </div>

        {/* Key interactions */}
        <div>
          <p className="font-semibold text-ink">Key Drug / Supplement Interactions</p>
          <SafetyList
            items={item.keyInteractions}
            limit={3}
            fallback="No major interactions documented."
          />
        </div>

        {/* Safety summary */}
        {safetyText && (
          <div>
            <p className="font-semibold text-ink">Safety Notes</p>
            <p className="text-muted leading-relaxed mt-1">{safetyText}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompareSafety({ item1, item2 }: CompareSafetyProps) {
  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Safety profile</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Cautions &amp; Contraindications
        </h2>
        <p className="text-sm text-safety-info mt-2">
          Always consult a healthcare provider before use, especially if pregnant, nursing, or taking medications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ItemSafetyCard item={item1} />
        <ItemSafetyCard item={item2} />
      </div>

      {/* Disclaimer banner */}
      <div className="rounded-xl border border-yellow-200 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold text-safety-caution uppercase tracking-wider">
          Medical Disclaimer
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          This comparison is for informational and educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Supplements can have active physiological effects. Consult a qualified healthcare professional before starting any new supplement, particularly if you are pregnant, nursing, taking prescription medications, or have an active medical condition.
        </p>
      </div>
    </section>
  )
}
