import type { CompareItem } from '@/lib/compare'

interface CompareMechanismsProps {
  item1: CompareItem
  item2: CompareItem
}

function MechanismCard({ item }: { item: CompareItem }) {
  if (item.mechanisms.length === 0) return null

  return (
    <article className="card-premium p-6">
      <h3 className="border-b border-brand-900/10 pb-2 text-xl font-semibold text-ink">
        How {item.name} may work
      </h3>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
        {item.mechanisms.map((mechanism) => (
          <li key={mechanism}>
            <span className="font-semibold text-ink">{mechanism}</span>
            <span> is listed in the source mechanism fields for this profile.</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function CompareMechanisms({ item1, item2 }: CompareMechanismsProps) {
  if (item1.mechanisms.length === 0 && item2.mechanisms.length === 0) return null

  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Mechanisms</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">How they may work</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These are source-derived mechanism labels, not a full molecular pathway map.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MechanismCard item={item1} />
        <MechanismCard item={item2} />
      </div>
    </section>
  )
}
