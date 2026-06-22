import type { CompareItem } from '@/lib/compare'

interface CompareDosingProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareDosing({ item1, item2 }: CompareDosingProps) {

  // Cautious, standard botanical details for Ashwagandha and Rhodiola
  const getDosingGuidance = (slug: string) => {
    if (slug === 'ashwagandha') {
      return {
        timing: 'Commonly taken in the evening (before bed) or split into morning and evening doses. Evening use leverages its calming properties to support sleep quality.',
        extractNotes: 'Standardized to contain a specific percentage of withanolides (typically 1.5% to 5% depending on whether it is a root extract like KSM-66 or a root/leaf blend like Shoden).',
      }
    }
    if (slug === 'rhodiola') {
      return {
        timing: 'Recommended for morning or early afternoon consumption. Due to its activating qualities, late-afternoon or evening dosing may interfere with sleep onset.',
        extractNotes: 'Usually standardized to 3% rosavins and 1% salidrosides (a 3:1 ratio that mimics the natural composition of the Rhodiola rosea plant root).',
      }
    }
    return {
      timing: 'Follow manufacturer instructions or advice from a health practitioner.',
      extractNotes: 'Seek third-party tested products with clearly labeled active constituents.',
    }
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Dosing & Timing</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Dosage and Usage Guidelines
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item 1 Dosing */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
            {item1.name} Dosage
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-ink">Typical Dose</p>
              <p className="text-muted leading-relaxed mt-0.5">{item1.typicalDose || '—'}</p>
            </div>
            <div>
              <p className="font-bold text-ink">Intake Timing</p>
              <p className="text-muted leading-relaxed mt-0.5">{getDosingGuidance(item1.slug).timing}</p>
            </div>
            <div>
              <p className="font-bold text-ink">Sourcing & Extract Standard</p>
              <p className="text-muted leading-relaxed mt-0.5">{getDosingGuidance(item1.slug).extractNotes}</p>
            </div>
          </div>
        </div>

        {/* Item 2 Dosing */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-xl font-semibold text-ink border-b border-brand-900/10 pb-2">
            {item2.name} Dosage
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-ink">Typical Dose</p>
              <p className="text-muted leading-relaxed mt-0.5">{item2.typicalDose || '—'}</p>
            </div>
            <div>
              <p className="font-bold text-ink">Intake Timing</p>
              <p className="text-muted leading-relaxed mt-0.5">{getDosingGuidance(item2.slug).timing}</p>
            </div>
            <div>
              <p className="font-bold text-ink">Sourcing & Extract Standard</p>
              <p className="text-muted leading-relaxed mt-0.5">{getDosingGuidance(item2.slug).extractNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
