import type { CompareItem } from '@/lib/compare'

interface CompareSafetyProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareSafety({ item1, item2 }: CompareSafetyProps) {
  const formatList = (arr?: string[]) => {
    if (!arr || arr.length === 0) return null
    return (
      <ul className="list-disc pl-5 space-y-1 mt-1 text-muted">
        {arr.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  const hasSafetyData = (item: CompareItem) => {
    return (
      (item.sideEffects && item.sideEffects.length > 0) ||
      (item.contraindications && item.contraindications.length > 0) ||
      (item.keyInteractions && item.keyInteractions.length > 0)
    )
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Safety Profile</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Cautions & Contraindications
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item 1 Safety */}
        {hasSafetyData(item1) && (
          <div className="card-premium p-6 space-y-4">
            <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
              {item1.name} Safety
            </h3>
            <div className="space-y-3 text-sm">
              {item1.safetyGrade && (
                <div>
                  <p className="font-bold text-ink">Safety Grade</p>
                  <p className="text-muted mt-0.5">{item1.safetyGrade}</p>
                </div>
              )}
              {item1.contraindications && item1.contraindications.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Contraindications & Cautions</p>
                  {formatList(item1.contraindications)}
                </div>
              )}
              {item1.keyInteractions && item1.keyInteractions.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Known Interactions</p>
                  {formatList(item1.keyInteractions)}
                </div>
              )}
              {item1.sideEffects && item1.sideEffects.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Potential Side Effects</p>
                  {formatList(item1.sideEffects)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Item 2 Safety */}
        {hasSafetyData(item2) && (
          <div className="card-premium p-6 space-y-4">
            <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
              {item2.name} Safety
            </h3>
            <div className="space-y-3 text-sm">
              {item2.safetyGrade && (
                <div>
                  <p className="font-bold text-ink">Safety Grade</p>
                  <p className="text-muted mt-0.5">{item2.safetyGrade}</p>
                </div>
              )}
              {item2.contraindications && item2.contraindications.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Contraindications & Cautions</p>
                  {formatList(item2.contraindications)}
                </div>
              )}
              {item2.keyInteractions && item2.keyInteractions.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Known Interactions</p>
                  {formatList(item2.keyInteractions)}
                </div>
              )}
              {item2.sideEffects && item2.sideEffects.length > 0 && (
                <div>
                  <p className="font-bold text-ink">Potential Side Effects</p>
                  {formatList(item2.sideEffects)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Safety Warning Banner */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-4">
        <p className="text-xs font-semibold text-yellow-900 uppercase tracking-wider">Medical Disclaimer</p>
        <p className="mt-1 text-xs leading-relaxed text-yellow-900/80">
          This comparison is for informational and educational purposes only and is not intended to replace professional medical advice, diagnosis, or treatment. Adaptogens have active physiological effects. Consult with a qualified healthcare professional before beginning any new supplement, particularly if you are pregnant, nursing, taking medications, or have an active medical condition.
        </p>
      </div>
    </section>
  )
}
