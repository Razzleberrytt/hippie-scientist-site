import type { HerbRecommendation, RecommendationConfidence } from '@/types/recommendations'

const CONFIDENCE_LABELS: Record<RecommendationConfidence, string> = {
  low: 'Early guidance',
  medium: 'Moderate confidence',
  high: 'High confidence',
}

const FORM_LABELS: Record<string, string> = {
  capsule: 'Capsule',
  tincture: 'Tincture',
  powder: 'Powder',
  tea: 'Tea',
  extract: 'Extract',
  'loose herb': 'Loose herb',
  softgel: 'Softgel',
}

function displayForm(form: string) {
  return FORM_LABELS[form] || form
}

export default function HerbBuyerGuidanceSection({
  recommendation,
}: {
  recommendation: HerbRecommendation
}) {
  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <div className='rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 md:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
              Buyer guidance
            </h2>
            <p className='mt-1 text-sm text-white/70'>
              Practical quality checks for comparing labels and formats.
            </p>
          </div>
          <span className='rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-100'>
            {CONFIDENCE_LABELS[recommendation.recommendationConfidence]}
          </span>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          <div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-white/60'>
              Recommended forms
            </h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              {recommendation.recommendedForms.map(form => (
                <span key={form} className='ds-pill'>
                  {displayForm(form)}
                </span>
              ))}
            </div>
          </div>

          <div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-white/60'>
              Preferred attributes
            </h3>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/85'>
              {recommendation.preferredAttributes.map(attribute => (
                <li key={attribute}>{attribute}</li>
              ))}
            </ul>
          </div>

          <div className='rounded-xl border border-rose-300/20 bg-rose-500/[0.06] p-3'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-rose-100/80'>
              Avoid flags
            </h3>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-rose-100/90'>
              {recommendation.avoidFlags.map(flag => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>

          <div className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-white/60'>
              Shopping notes
            </h3>
            <p className='mt-2 text-sm leading-relaxed text-white/85'>
              {recommendation.shoppingNotes}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
