import type { CompareItem } from '@/lib/compare'

interface CompareDecisionSectionProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareDecisionSection({ item1, item2 }: CompareDecisionSectionProps) {
  const isAshwagandhaRhodiola =
    (item1.slug === 'ashwagandha' && item2.slug === 'rhodiola') ||
    (item1.slug === 'rhodiola' && item2.slug === 'ashwagandha')

  return (
    <section className="card-premium p-6 space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision Guide</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          How to Choose Between Them
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Choose {item1.name} if:</h3>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-muted space-y-2">
            {isAshwagandhaRhodiola ? (
              <>
                <li>Your stress feels like tension, nervousness, or an overactive mind.</li>
                <li>Your stress interferes with sleep onset or sleep quality.</li>
                <li>You prefer a more relaxing, grounding effect during times of stress.</li>
              </>
            ) : (
              <>
                <li>You want to target {item1.primaryBenefits.join(', ') || 'general recovery'}.</li>
                <li>You prioritize a supplement backed by {item1.evidenceLevel || 'current scientific trials'}.</li>
              </>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">Choose {item2.name} if:</h3>
          <ul className="list-disc pl-5 text-sm leading-relaxed text-muted space-y-2">
            {isAshwagandhaRhodiola ? (
              <>
                <li>Your stress is accompanied by physical or mental fatigue, brain fog, or burnout.</li>
                <li>You need to maintain focus, alertness, and stamina during cognitive tasks.</li>
                <li>You prefer an adaptogen that supports work performance without causing drowsiness.</li>
              </>
            ) : (
              <>
                <li>You want to target {item2.primaryBenefits.join(', ') || 'general stamina'}.</li>
                <li>You prefer the specific mechanism of action offered by {item2.name}.</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Safety Note */}
      <div className="border-t border-brand-900/10 pt-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink">General Safety Warnings</h4>
        <p className="text-xs leading-relaxed text-muted">
          Be more cautious if you are pregnant or breastfeeding, taking prescription medications (especially thyroid medications, antidepressants/SSRIs, or sedatives), managing an autoimmune disease, or have a history of liver conditions. Always consult a healthcare professional before adding new supplements to your routine.
        </p>
      </div>
    </section>
  )
}
