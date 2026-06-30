import type { MechanismRisk } from '@/lib/interaction-risk'

const DESCRIPTIONS: Record<string, string> = {
  serotonergic:
    'May increase serotonin activity. Combining with SSRIs, MAOIs, or other serotonergic supplements raises serotonin syndrome risk.',
  anticoagulant:
    'May affect bleeding or clotting. Combining with blood thinners, NSAIDs, or anticoagulant supplements may increase bleeding risk.',
  cns_sedation:
    'May cause CNS depression or sedation. Combining with sedatives, alcohol, or other depressants may amplify these effects.',
  blood_glucose:
    'May lower blood glucose. Combining with diabetes medications or other glucose-lowering agents may cause hypoglycemia.',
  blood_pressure:
    'May affect blood pressure. Combining with antihypertensives or other BP-active agents may amplify or antagonize effects.',
}

interface Props {
  risks: MechanismRisk[]
  displayName: string
}

export default function AdditiveRiskPanel({ risks, displayName }: Props) {
  if (!risks.length) return null

  return (
    <section
      id="stacking-risks"
      aria-labelledby="stacking-risks-heading"
      className="rounded-2xl border border-amber-900/20 bg-amber-50/50 p-4 sm:p-5 space-y-4"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Mechanistic caution</p>
        <h2 id="stacking-risks-heading" className="mt-1 text-lg font-bold text-ink">
          Stacking Risks
        </h2>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          {displayName} shares pharmacological properties with other supplements that may compound when combined. These are
          mechanistic flags derived from workbook contraindication data, not verified clinical interactions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {risks.map(risk => (
          <div
            key={risk.mechanism}
            className="rounded-xl border border-amber-200 bg-white/80 p-3 space-y-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={
                  risk.severity === 'severe'
                    ? 'inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800'
                    : 'inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800'
                }
              >
                {risk.severity}
              </span>
              <span className="text-sm font-bold text-ink">{risk.label}</span>
            </div>

            <p className="text-xs leading-5 text-amber-900">
              {DESCRIPTIONS[risk.mechanism] ?? ''}
            </p>

            <p className="text-xs text-muted">
              <strong>{risk.partnerCount}</strong> other supplement{risk.partnerCount !== 1 ? 's' : ''} share
              this flag.{' '}
              {risk.topPartners.length > 0 && (
                <>
                  Examples:{' '}
                  {risk.topPartners
                    .slice(0, 3)
                    .map(p => p.name)
                    .join(', ')}
                  {risk.partnerCount > 3 ? `, +${risk.partnerCount - 3} more` : ''}.
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-5 text-amber-800">
        Consult a clinician or pharmacist before stacking {displayName} with other supplements or medications, especially
        those flagged for the same mechanisms above.
      </p>
    </section>
  )
}
