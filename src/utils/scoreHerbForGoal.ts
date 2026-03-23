import type { GoalDefinition } from '@/data/goals'
import type { Herb } from '@/types'
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

function warningKeywords(warning: string | undefined): string[] {
  if (!warning) return []
  return warning
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(token => token.trim())
    .filter(token => token.length >= 4)
}

export function scoreHerbForGoal(herb: Herb, goal: GoalDefinition): HerbGoalScore {
  const herbEffects = getHerbEffects(herb)
  const matchedEffects = goal.targetEffects.filter(target =>
    herbEffects.some(effect => effectMatches(effect, target))
  )

  let score = matchedEffects.length * 2

  if (goal.classBoosts?.length) {
    const classTokens = getClassTokens(herb)
    const classAligned = goal.classBoosts.some(hint => {
      const normalizedHint = hint.toLowerCase()
      return classTokens.some(
        token => token.includes(normalizedHint) || normalizedHint.includes(token)
      )
    })

    if (classAligned) score += 1
  }

  const cautionKeywords = warningKeywords(goal.warning)
  if (cautionKeywords.length) {
    const herbContraindications = getContraindications(herb)
    const hasConflict = cautionKeywords.some(keyword =>
      herbContraindications.some(contraindication => contraindication.includes(keyword))
    )

    if (hasConflict) score -= 2
  }

  return {
    score,
    matchedEffects,
  }
}
