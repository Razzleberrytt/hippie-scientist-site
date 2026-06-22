import type { CompareItem } from '@/lib/compare'

interface CompareDosingProps {
  item1: CompareItem
  item2: CompareItem
}

function DosingCard({ item }: { item: CompareItem }) {
  const rows = [
    { label: 'Typical dose', value: item.typicalDose },
    { label: 'Best timing', value: item.bestTiming },
    { label: 'Onset', value: item.onsetTime },
  ].filter((row) => row.value)

  if (rows.length === 0) return null

  return (
    <article className="card-premium p-6">
      <h3 className="border-b border-brand-900/10 pb-2 text-xl font-semibold text-ink">{item.name}</h3>
      <dl className="mt-4 space-y-4 text-sm">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="font-bold text-ink">{row.label}</dt>
            <dd className="mt-1 leading-6 text-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

export default function CompareDosing({ item1, item2 }: CompareDosingProps) {
  const hasDosing = Boolean(item1.typicalDose || item1.bestTiming || item1.onsetTime || item2.typicalDose || item2.bestTiming || item2.onsetTime)
  if (!hasDosing) return null

  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Dosing</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Dose and timing</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Timing, onset, and extract-form details are shown only when they exist in the source mapping.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DosingCard item={item1} />
        <DosingCard item={item2} />
      </div>
    </section>
  )
}
