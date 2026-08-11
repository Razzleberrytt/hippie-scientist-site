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
    return `Both profiles contain fields or descriptive text relevant to ${goal.label.toLowerCase()}. This keyword-level signal does not establish equal efficacy, a head-to-head tie, or a reason to combine them.`
  }
  if (match1) {
    return `${item1.name}'s profile contains fields or descriptive text relevant to ${goal.label.toLowerCase()}; ${item2.name}'s current comparison record does not surface the same keyword signal. That is a data-coverage difference, not proof that ${item1.name} works better for this goal.`
  }
  return `${item2.name}'s profile contains fields or descriptive text relevant to ${goal.label.toLowerCase()}; ${item1.name}'s current comparison record does not surface the same keyword signal. That is a data-coverage difference, not proof that ${item2.name} works better for this goal.`
}

export default function CompareGoalRouting({ item1, item2 }: CompareGoalRoutingProps) {
  type GoalCard = {
    label: string
    signal: 'both' | 'item1' | 'item2'
    explanation: string
  }

  const cards: GoalCard[] = []

  for (const goal of GOALS) {
    const m1 = itemMatchesGoal(item1, goal.keywords)
    const m2 = itemMatchesGoal(item2, goal.keywords)

    if (!m1 && !m2) continue

    cards.push({
      label: goal.label,
      signal: m1 && m2 ? 'both' : m1 ? 'item1' : 'item2',
      explanation: buildExplanation(goal, item1, item2, m1, m2),
    })
  }

  if (cards.length === 0) return null

  return (
    <section className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Goal relevance scan</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Where the Profile Data Mention Each Goal
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          This scan is based on keywords in profile fields and descriptions. Use it to find sections worth reading, not to rank efficacy or declare a winner.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card-premium p-4 flex flex-col gap-3">
            <h3 className="text-base font-semibold text-ink border-b border-brand-900/10 pb-2">
              {card.label}
            </h3>

            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-brand-900/10 bg-brand-50/50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {card.signal === 'both'
                ? 'Both profiles mention this goal'
                : `${card.signal === 'item1' ? item1.name : item2.name} profile signal`}
            </span>

            <p className="text-xs leading-relaxed text-muted">{card.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
