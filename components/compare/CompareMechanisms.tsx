import type { CompareItem } from '@/lib/compare'

interface CompareMechanismsProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareMechanisms({ item1, item2 }: CompareMechanismsProps) {
  // Description mapper for standard canonical mechanisms to keep it cautious and source-aligned
  const getMechanismExplanation = (mechanism: string): string => {
    const term = mechanism.toLowerCase()
    if (term.includes('hpa-axis') || term.includes('stress response')) {
      return 'Regulates the hypothalamic-pituitary-adrenal axis to modulate the body\'s physiological stress response and cortisol release.'
    }
    if (term.includes('anti-inflammatory') || term.includes('inflammatory')) {
      return 'Modulates inflammatory signaling pathways (such as cytokine levels) during periods of physical stress.'
    }
    if (term.includes('hormonal')) {
      return 'Interacts with neuroendocrine systems to support hormone balance under chronic stress.'
    }
    if (term.includes('ampk')) {
      return 'Activates adenosine monophosphate-activated protein kinase (AMPK), a master regulator of cellular energy homeostasis.'
    }
    if (term.includes('neurotransmitter')) {
      return 'Modulates activity of brain neurotransmitters (such as GABA, dopamine, or serotonin).'
    }
    return 'Observed in laboratory models to support cellular resilience and stress adaptability.'
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Mechanism of Action</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          How They Work
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item 1 Mechanisms */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
            {item1.name} Mechanisms
          </h3>
          {item1.mechanisms.length > 0 ? (
            <ul className="space-y-3">
              {item1.mechanisms.map((mech) => (
                <li key={mech} className="text-sm">
                  <strong className="text-ink block">{mech}</strong>
                  <span className="text-muted leading-relaxed mt-1 block">
                    {getMechanismExplanation(mech)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No specific canonical mechanisms registered in current database.</p>
          )}
        </div>

        {/* Item 2 Mechanisms */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
            {item2.name} Mechanisms
          </h3>
          {item2.mechanisms.length > 0 ? (
            <ul className="space-y-3">
              {item2.mechanisms.map((mech) => (
                <li key={mech} className="text-sm">
                  <strong className="text-ink block">{mech}</strong>
                  <span className="text-muted leading-relaxed mt-1 block">
                    {getMechanismExplanation(mech)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No specific canonical mechanisms registered in current database.</p>
          )}
        </div>
      </div>
    </section>
  )
}
