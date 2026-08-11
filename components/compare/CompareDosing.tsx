import type { CompareItem } from '@/lib/compare'

interface CompareDosingProps {
  item1: CompareItem
  item2: CompareItem
}

function deriveFormNote(item: CompareItem): string {
  if (item.type === 'herb') {
    return 'Product forms vary. Verify the plant part, extract ratio or standardization when relevant, amount per serving, and independent quality testing on the specific label.'
  }
  return 'Product forms vary. Verify the exact compound or mineral form, amount per serving, added ingredients, and independent quality testing on the specific label.'
}

function DosingCard({ item }: { item: CompareItem }) {
  const dose = item.typicalDose || 'Not reported in the comparison source data'
  const timing = item.bestTiming || 'Not reported in the comparison source data'
  const onset = item.onsetTime || 'Not reported in the comparison source data'
  const formNote = deriveFormNote(item)

  return (
    <div className="card-premium p-6 space-y-4">
      <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
        {item.name}
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-ink">Dose / Form in Source Data</p>
          <p className="text-muted leading-relaxed mt-0.5">{dose}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Product Form Check</p>
          <p className="text-muted leading-relaxed mt-0.5">{formNote}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Timing in Source Data</p>
          <p className="text-muted leading-relaxed mt-0.5">{timing}</p>
        </div>

        <div>
          <p className="font-semibold text-ink">Onset in Source Data</p>
          <p className="text-muted leading-relaxed mt-0.5">{onset}</p>
        </div>
      </div>
    </div>
  )
}

export default function CompareDosing({ item1, item2 }: CompareDosingProps) {
  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Dose, Form &amp; Timing</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          What the Source Data Actually Report
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          These fields summarize the underlying profile data. They are not a personalized dosing protocol, and a product form listed in a source field should not be read as a proven effective dose.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DosingCard item={item1} />
        <DosingCard item={item2} />
      </div>

      <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-4">
        <p className="text-xs leading-relaxed text-muted">
          Missing values are shown as missing rather than filled with a generic timing or onset assumption. Verify serving size, formulation, contraindications, and medication interactions on the full ingredient profile and product label before use.
        </p>
      </div>
    </section>
  )
}
