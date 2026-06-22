import type { CompareItem } from '@/lib/compare'

interface CompareMechanismsProps {
  item1: CompareItem
  item2: CompareItem
}

const MAX_MECHANISMS = 4
const MAX_CANONICAL = 3

function buildPathwayLine(item: CompareItem): string | null {
  const mechanism = item.mechanisms[0]
  const benefit = item.primaryBenefits[0]
  if (!mechanism && !benefit) return null
  if (mechanism && benefit) return `${mechanism} → ${benefit}`
  return mechanism ?? benefit ?? null
}

function ItemMechanismCard({ item }: { item: CompareItem }) {
  const mechanisms = item.mechanisms.slice(0, MAX_MECHANISMS)
  const canonical = item.canonicalMechanisms.slice(0, MAX_CANONICAL)
  const pathwayLine = buildPathwayLine(item)
  const typeLabel = item.type === 'herb' ? 'Herb' : 'Compound'

  return (
    <div className="card-premium p-5 space-y-4 sm:p-6">
      <div className="border-b border-brand-900/10 pb-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-700">
          {typeLabel}
          {item.scientificName ? ` · ${item.scientificName}` : ''}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-snug text-ink sm:text-xl">
          How {item.name} Works
        </h3>
      </div>

      <div>
        <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-700">
          Primary mechanisms
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
          <p className="text-sm text-muted">Mechanisms not yet catalogued.</p>
        )}
      </div>

      {canonical.length > 0 && (
        <div>
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-700">
            Canonical mechanisms
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

      {pathwayLine && (
        <div className="rounded-lg border border-brand-900/10 bg-paper-50 px-3 py-2">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.11em] text-brand-700 mb-1">
            Pathway
          </p>
          <p className="text-xs leading-relaxed text-muted font-mono">
            → {pathwayLine}
          </p>
        </div>
      )}
    </div>
  )
}

export default function CompareMechanisms({ item1, item2 }: CompareMechanismsProps) {
  return (
    <section aria-labelledby="mechanisms-heading">
      <div className="mb-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-700">
          Mechanism of action
        </p>
        <h2 id="mechanisms-heading" className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          How They Work
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ItemMechanismCard item={item1} />
        <ItemMechanismCard item={item2} />
      </div>
    </section>
  )
}
