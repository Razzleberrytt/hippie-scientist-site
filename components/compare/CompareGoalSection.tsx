import type { CompareItem } from '@/lib/compare'

interface CompareGoalSectionProps {
  item1: CompareItem
  item2: CompareItem
}

type GoalCard = {
  goal: string
  betterFit: string
  why: string
  unclear?: string
}

function hasBenefit(item: CompareItem, terms: string[]) {
  const text = [...item.primaryBenefits, item.description].join(' ').toLowerCase()
  return terms.some((term) => text.includes(term))
}

export default function CompareGoalSection({ item1, item2 }: CompareGoalSectionProps) {
  const ashwagandha = item1.slug === 'ashwagandha' ? item1 : item2.slug === 'ashwagandha' ? item2 : null
  const rhodiola = item1.slug === 'rhodiola' ? item1 : item2.slug === 'rhodiola' ? item2 : null

  if (!ashwagandha || !rhodiola) return null

  const goals: GoalCard[] = [
    {
      goal: 'Stress',
      betterFit: 'Tie, depending on stress pattern',
      why: `${ashwagandha.name} is listed for stress with sleep also present in its source effects. ${rhodiola.name} is listed for stress with stress resilience and fatigue reduction in its primary effects.`,
      unclear: 'The source data does not provide head-to-head trials, effect sizes, or a single winner for all stress patterns.',
    },
    {
      goal: 'Anxiety / calm',
      betterFit: ashwagandha.name,
      why: `${ashwagandha.name} has source-backed stress and sleep positioning, while ${rhodiola.name} is described in the source data as fatigue support with activation or insomnia caution in sensitive users.`,
      unclear: 'The current comparison data does not include anxiety-specific trial counts or effect sizes.',
    },
    {
      goal: 'Energy',
      betterFit: rhodiola.name,
      why: `${rhodiola.name} lists fatigue reduction and stress resilience as primary effects. ${ashwagandha.name} is primarily listed for sleep in the source record.`,
    },
    {
      goal: 'Focus',
      betterFit: hasBenefit(ashwagandha, ['cognition']) || hasBenefit(rhodiola, ['focus', 'mental stamina']) ? 'Unclear' : 'Unclear',
      why: `${ashwagandha.name} mentions cognition in its summary, and ${rhodiola.name} mentions mental stamina in its summary. The available fields do not support a firm focus winner.`,
    },
    {
      goal: 'Sleep support',
      betterFit: ashwagandha.name,
      why: `${ashwagandha.name} includes sleep in source effects and primary effects. ${rhodiola.name} is not framed as a bedtime calming herb in the available source description.`,
    },
    {
      goal: 'Exercise / fatigue',
      betterFit: rhodiola.name,
      why: `${rhodiola.name} includes fatigue reduction in primary effects. The current ${ashwagandha.name} herb record does not list fatigue as a primary effect.`,
      unclear: 'Exercise-specific outcomes are not available in these herb records.',
    },
  ]

  return (
    <section className="max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Goal matcher</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Goal-by-goal fit</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <article key={goal.goal} className="card-premium flex flex-col gap-3 p-5">
            <h3 className="border-b border-brand-900/10 pb-2 text-lg font-semibold text-ink">{goal.goal}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Better fit</p>
            <p className="text-sm font-semibold text-ink">{goal.betterFit}</p>
            <p className="text-sm leading-6 text-muted">{goal.why}</p>
            {goal.unclear ? <p className="text-xs leading-5 text-muted">{goal.unclear}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
