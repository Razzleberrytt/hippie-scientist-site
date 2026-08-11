import type { CompareItem } from '@/lib/compare'

interface CompareMechanismsProps {
  item1: CompareItem
  item2: CompareItem
}

const MAX_MECHANISMS = 4
const MAX_CANONICAL = 3

function ItemMechanismCard({ item }: { item: CompareItem }) {
  const mechanisms = item.mechanisms.slice(0, MAX_MECHANISMS)
  const canonical = item.canonicalMechanisms.slice(0, MAX_CANONICAL)
  const typeLabel = item.type === 'herb' ? 'Herb' : 'Compound'

  return (
    <div className="card-premium p-5 space-y-4 sm:p-6">
      <div className="border-b border-brand-900/10 pb-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-700">
          {typeLabel}
          {item.scientificName ? ` · ${item.scientificName}` : ''}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-snug text-ink sm:text-xl">
          Mechanism signals for {item.name}
        </h3>
      </div>

      <div>
        <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-700">
          Reported / proposed mechanisms
        </p>
        {mechanisms.length > 0 ? (
          <ul className="space-y-1.5">
            {mechanisms.map((mech) => (
              <li key={mech} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                {mech}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No mechanism field is surfaced in this comparison record.</p>
        )}
      </div>

      {canonical.length > 0 && (
        <div>
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-700">
            Normalized mechanism labels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {canonical.map((mech) => (
              <span key={mech} className="chip-readable">
                {mech}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="rounded-lg border border-brand-900/10 bg-paper-50 px-3 py-2 text-xs leading-relaxed text-muted">
        Mechanism fields can help explain biological plausibility, but they do not by themselves prove a clinical benefit, effect size, safety, or superiority over the other option.
      </p>
    </div>
  )
}

export default function CompareMechanisms({ item1, item2 }: CompareMechanismsProps) {
  return (
    <section aria-labelledby="mechanisms-heading">
      <div className="mb-5 max-w-3xl">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-700">
          Mechanism context
        </p>
        <h2 id="mechanisms-heading" className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Proposed Mechanisms Side by Side
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These labels summarize mechanistic information in the profile data. They are context for interpreting evidence, not a causal map from pathway to outcome.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ItemMechanismCard item={item1} />
        <ItemMechanismCard item={item2} />
      </div>
    </section>
  )
}
