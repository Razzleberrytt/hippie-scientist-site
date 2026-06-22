import type { CompareItem } from '@/lib/compare'

interface CompareGoalSectionProps {
  item1: CompareItem
  item2: CompareItem
}

type GoalCard = {
  goal: string
  winner: string
  rationale: string
  details: string
}

export default function CompareGoalSection({ item1, item2 }: CompareGoalSectionProps) {
  const isAshwagandhaRhodiola =
    (item1.slug === 'ashwagandha' && item2.slug === 'rhodiola') ||
    (item1.slug === 'rhodiola' && item2.slug === 'ashwagandha')

  if (!isAshwagandhaRhodiola) return null

  // Custom goal comparisons for Ashwagandha vs Rhodiola
  const goals: GoalCard[] = [
    {
      goal: 'Stress Response',
      winner: 'Tie (Depends on stress pattern)',
      rationale: 'Ashwagandha is better for "wired" stress (nervous tension). Rhodiola is better for "tired" stress (burnout and fatigue).',
      details: 'Ashwagandha modulates the HPA axis to reduce baseline cortisol levels, helping you feel more grounded. Rhodiola supports stress resilience by modulating neurotransmitters and cellular energy, helping you power through stressors without depleting your stamina.',
    },
    {
      goal: 'Anxiety & Calming',
      winner: 'Ashwagandha',
      rationale: 'Ashwagandha shows stronger human trial evidence for reducing perceived anxiety scores.',
      details: 'Clinical trials demonstrate significant, replicable reductions in salivary cortisol and anxiety rating scales (such as HAM-A) with standardized root extracts. Rhodiola is not primarily a calming agent and can occasionally feel mildly stimulating to sensitive individuals.',
    },
    {
      goal: 'Sleep Support',
      winner: 'Ashwagandha',
      rationale: 'Ashwagandha is clinically tracked for improving sleep efficiency and sleep quality.',
      details: 'Ashwagandha acts as a GABA facilitator to calm the nervous system in the evening, making it ideal for individuals whose stress keeps them awake. Rhodiola has no direct clinical support for sleep promotion and should be taken in the morning to avoid sleep disruption.',
    },
    {
      goal: 'Energy & Fatigue',
      winner: 'Rhodiola',
      rationale: 'Rhodiola (specifically SHR-5 extract) has robust evidence for alleviating stress-induced fatigue.',
      details: 'Multiple trials show Rhodiola helps prevent burnout and fatigue in students, physicians, and military personnel under high stress. It works by supporting cellular energy production (AMPK/mitochondria), whereas Ashwagandha acts more as a calming recovery agent.',
    },
    {
      goal: 'Focus & Cognition',
      winner: 'Rhodiola',
      rationale: 'Rhodiola is superior for acute cognitive stamina and mental performance under pressure.',
      details: 'Rhodiola is a fast-acting adaptogen that modulates dopamine and norepinephrine, leading to rapid improvements in attention, processing speed, and mental accuracy. Ashwagandha requires weeks of daily dosing to build systemic cognitive support.',
    },
  ]

  return (
    <section className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Goal Matcher</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Goal-by-Goal Breakdown
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((item) => (
          <div key={item.goal} className="card-premium p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-ink border-b border-brand-900/10 pb-2">{item.goal}</h3>
              <p className="text-xs font-bold text-brand-700">
                Better fit: <span className="text-ink font-medium">{item.winner}</span>
              </p>
              <p className="text-xs font-semibold text-ink leading-relaxed">
                {item.rationale}
              </p>
              <p className="text-xs leading-relaxed text-muted">
                {item.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
