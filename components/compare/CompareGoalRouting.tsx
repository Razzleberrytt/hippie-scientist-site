import type { CompareItem } from '@/lib/compare'

interface CompareGoalRoutingProps {
  item1: CompareItem
  item2: CompareItem
}

type GoalDef = {
  label: string
  keywords: string[]
}

const GOALS: GoalDef[] = [
  { label: 'Sleep', keywords: ['sleep', 'insomnia', 'rest', 'sedative', 'sedation'] },
  { label: 'Stress', keywords: ['stress', 'cortisol', 'adaptogen', 'hpa', 'anxiety', 'anxiolytic'] },
  { label: 'Focus / Cognitive', keywords: ['focus', 'cognit', 'memory', 'concentration', 'nootropic', 'mental', 'brain'] },
  { label: 'Athletic Performance', keywords: ['athletic', 'exercise', 'endurance', 'stamina', 'performance', 'strength', 'muscle'] },
  { label: 'Mood', keywords: ['mood', 'depression', 'serotonin', 'dopamine', 'wellbeing', 'well-being'] },
  { label: 'Immune Support', keywords: ['immune', 'immunity', 'antiviral', 'antimicrobial', 'infection', 'defense'] },
  { label: 'Inflammation', keywords: ['inflam', 'anti-inflam', 'cytokine', 'cox', 'oxidative'] },
  { label: 'Recovery', keywords: ['recover', 'repair', 'regenerat', 'healing', 'rehabilit'] },
]

function itemMatchesGoal(item: CompareItem, keywords: string[]): boolean {
  const haystack = [
    ...item.primaryBenefits,
    ...item.mechanisms,
    item.description,
  ]
    .join(' ')
    .toLowerCase()

  return keywords.some((kw) => haystack.includes(kw))
}

function buildExplanation(
  goal: GoalDef,
  item1: CompareItem,
  item2: CompareItem,
  match1: boolean,
  match2: boolean,
): string {
  if (match1 && match2) {
    const b1 = item1.primaryBenefits[0] || item1.mechanisms[0]
    const b2 = item2.primaryBenefits[0] || item2.mechanisms[0]
    if (b1 && b2 && b1 !== b2) {
      return `Both support ${goal.label.toLowerCase()} but through different pathways — ${item1.name} via ${b1.toLowerCase()} and ${item2.name} via ${b2.toLowerCase()}.`
    }
    return `Both ${item1.name} and ${item2.name} have data relevant to ${goal.label.toLowerCase()} support.`
  }
  if (match1) {
    const benefit = item1.primaryBenefits.find((b) =>
      goal.keywords.some((kw) => b.toLowerCase().includes(kw)),
    ) || item1.primaryBenefits[0]
    return benefit
      ? `${item1.name} directly targets ${benefit.toLowerCase()}, while ${item2.name} lacks documented effects in this area.`
      : `${item1.name} has documented relevance to ${goal.label.toLowerCase()} support; ${item2.name} does not.`
  }
  // match2 only
  const benefit = item2.primaryBenefits.find((b) =>
    goal.keywords.some((kw) => b.toLowerCase().includes(kw)),
  ) || item2.primaryBenefits[0]
  return benefit
    ? `${item2.name} directly targets ${benefit.toLowerCase()}, while ${item1.name} lacks documented effects in this area.`
    : `${item2.name} has documented relevance to ${goal.label.toLowerCase()} support; ${item1.name} does not.`
}

export default function CompareGoalRouting({ item1, item2 }: CompareGoalRoutingProps) {
  type GoalCard = {
    label: string
    winner: 'item1' | 'item2' | 'tie'
    explanation: string
  }

  const cards: GoalCard[] = []

  for (const goal of GOALS) {
    const m1 = itemMatchesGoal(item1, goal.keywords)
    const m2 = itemMatchesGoal(item2, goal.keywords)

    if (!m1 && !m2) continue

    cards.push({
      label: goal.label,
      winner: m1 && m2 ? 'tie' : m1 ? 'item1' : 'item2',
      explanation: buildExplanation(goal, item1, item2, m1, m2),
    })
  }

  if (cards.length === 0) return null

  return (
    <section className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Goal Matcher</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Goal-by-Goal Breakdown
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card-premium p-4 flex flex-col gap-3">
            <h3 className="text-base font-semibold text-ink border-b border-brand-900/10 pb-2">
              {card.label}
            </h3>

            {card.winner === 'tie' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/50 border border-brand-900/10 px-2.5 py-1 text-xs font-semibold text-brand-700 w-fit">
                TIE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/50 border border-brand-900/10 px-2.5 py-1 text-xs font-semibold text-evidence-strong w-fit">
                {card.winner === 'item1' ? item1.name : item2.name} wins
              </span>
            )}

            <p className="text-xs leading-relaxed text-muted">{card.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
