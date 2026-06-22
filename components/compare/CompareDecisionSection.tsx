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
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Decision guide</p>
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
                <li>You want calmer stress support.</li>
                <li>Sleep support is part of your goal.</li>
                <li>You want the option with the stronger source evidence tier in this comparison.</li>
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
                <li>Your stress support goal is paired with fatigue reduction.</li>
                <li>You want the more energy- and stamina-oriented profile.</li>
                <li>You are avoiding bedtime-oriented calming support.</li>
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
          Be more cautious if you are pregnant, on medication, sensitive to supplements, or managing a medical condition. The source records specifically flag thyroid and sedative cautions for ashwagandha and SSRI cautions for rhodiola.
        </p>
      </div>
    </section>
  )
}
