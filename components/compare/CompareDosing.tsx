import type { CompareItem } from '@/lib/compare'

interface CompareDosingProps {
  item1: CompareItem
  item2: CompareItem
}

function deriveFormNote(item: CompareItem): string {
  if (item.type === 'herb') {
    return `Available as capsules, powder, tincture, or tea. Look for standardised root or aerial-part extracts with clearly labelled active constituents and third-party testing.`
  }
  return `Typically available as capsules or powder. Look for products with third-party purity verification and clearly labelled active constituent percentages.`
}

function DosingCard({ item }: { item: CompareItem }) {
  const dose = item.typicalDose || '—'
  const timing = item.bestTiming || 'With or without food'
  const onset = item.onsetTime || 'Varies — often 2–4 weeks for adaptogens'
  const formNote = deriveFormNote(item)

  return (
    <div className="card-premium p-6 space-y-4">
      <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
        {item.name}
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-ink">Effective Dose</p>
          <p className="text-muted leading-relaxed mt-0.5">{dose}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Form / Extract</p>
          <p className="text-muted leading-relaxed mt-0.5">{formNote}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Best Timing</p>
          <p className="text-muted leading-relaxed mt-0.5">{timing}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Time to Effects</p>
          <p className="text-muted leading-relaxed mt-0.5">{onset}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Approximate Cost</p>
          <p className="text-muted leading-relaxed mt-0.5">Check current pricing</p>
        </div>
      </div>
    </div>
  )
}

export default function CompareDosing({ item1, item2 }: CompareDosingProps) {
  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Dosing &amp; Timing</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Dosage and Usage Guidelines
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DosingCard item={item1} />
        <DosingCard item={item2} />
      </div>

      <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-4">
        <p className="text-xs leading-relaxed text-muted">
          Cost estimates vary by brand, form, and dose. Standardised extracts typically cost more than raw powder. Always verify dose and extract concentration on the product label before purchasing.
        </p>
      </div>
    </section>
  )
}
