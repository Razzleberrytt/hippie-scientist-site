import type { Herb } from '@/types'
import type { GoalDefinition } from '@/data/goals'
import { getClassTokens, getContraindications, getHerbEffects } from '@/utils/herbSignals'

export type HerbGoalScore = {
  score: number
  matchedEffects: string[]
}

function effectMatches(effect: string, targetEffect: string): boolean {
  const left = effect.toLowerCase()
  const right = targetEffect.toLowerCase()
  return left.includes(right) || right.includes(left)
}

export function scoreHerbForGoal(herb: Herb, goal: GoalDefinition): HerbGoalScore {
  const herbEffects = getHerbEffects(herb)
  const matchedEffects = goal.targetEffects.filter(target =>
    herbEffects.some(effect => effectMatches(effect, target))
  )

  let score = matchedEffects.length * 2

  if (goal.classHints?.length) {
    const classTokens = getClassTokens(herb)
    const classAligned = goal.classHints.some(hint => {
      const normalizedHint = hint.toLowerCase()
      return classTokens.some(
        token => token.includes(normalizedHint) || normalizedHint.includes(token)
      )
    })

    if (classAligned) score += 1
  }

  if (goal.contraindicationKeywords?.length) {
    const herbContraindications = getContraindications(herb)
    const hasConflict = goal.contraindicationKeywords.some(keyword =>
      herbContraindications.some(contraindication =>
        contraindication.includes(keyword.toLowerCase())
      )
    )

    if (hasConflict) score -= 2
  }

  return {
    score,
    matchedEffects,
  }
}
