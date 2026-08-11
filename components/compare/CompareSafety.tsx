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
}: {
  items: string[] | undefined
  limit: number
}) {
  const visible = items?.slice(0, limit)
  if (!visible || visible.length === 0) {
    return (
      <p className="text-sm italic leading-relaxed text-muted">
        Not reported in the comparison source data. Missing data do not mean that no risk or interaction exists.
      </p>
    )
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
        <div>
          <p className="font-semibold text-ink">Potential Side Effects</p>
          <SafetyList items={item.sideEffects} limit={4} />
        </div>

        <div>
          <p className="font-semibold text-ink">Contraindications / Cautions</p>
          <SafetyList items={item.contraindications} limit={4} />
        </div>

        <div>
          <p className="font-semibold text-ink">Drug / Supplement Interactions</p>
          <SafetyList items={item.keyInteractions} limit={3} />
        </div>

        {safetyText ? (
          <div>
            <p className="font-semibold text-ink">Safety Notes</p>
            <p className="text-muted leading-relaxed mt-1">{safetyText}</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-ink">Safety Notes</p>
            <p className="mt-1 text-sm italic leading-relaxed text-muted">
              No separate safety summary is available in this comparison source record. Review the full ingredient profile and external clinical guidance where appropriate.
            </p>
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
          Cautions, Contraindications &amp; Data Gaps
        </h2>
        <p className="text-sm text-safety-info mt-2">
          Treat blank safety fields as unknown in this dataset, not as evidence of safety. Review medications, health conditions, pregnancy or breastfeeding status, and other supplements before use.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ItemSafetyCard item={item1} />
        <ItemSafetyCard item={item2} />
      </div>

      <div className="rounded-xl border border-yellow-200 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold text-safety-caution uppercase tracking-wider">
          Medical Disclaimer
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          This comparison is for informational and educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Supplements can have active physiological effects and can interact with other supplements or medicines. Consult a qualified healthcare professional before starting a new supplement when your medical context makes interaction risk important.
        </p>
      </div>
    </section>
  )
}
