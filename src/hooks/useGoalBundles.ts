import { useEffect, useState } from 'react'
import type { GoalBundle } from '@/types/goalBundle'

const GOAL_LABEL_BY_ROUTE: Record<string, string> = {
  anxiety: 'Anxiety',
  cognition: 'Cognition',
  sleep: 'Sleep',
  energy: 'Energy',
  inflammation: 'Inflammation',
  digestive: 'Digestive',
  immune: 'Immune',
  liver: 'Liver',
  cardiovascular: 'Cardiovascular',
}

export function useGoalBundles(goal?: string) {
  const [bundles, setBundles] = useState<GoalBundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch('/data/workbook-goal-bundles.json')
      .then(r => r.json())
      .then((data: GoalBundle[]) => {
        if (cancelled) return

        const goalLabel = goal ? GOAL_LABEL_BY_ROUTE[goal.toLowerCase()] : undefined
        const filtered = goalLabel
          ? data.filter(bundle => bundle.goal.toLowerCase() === goalLabel.toLowerCase())
          : data

        setBundles(filtered)
      })
      .catch(() => {
        if (!cancelled) setBundles([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [goal])

  return { bundles, loading }
}
