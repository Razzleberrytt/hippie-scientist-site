import { getRecommendationsForGoal, type RecommendationGoal } from '@/content/recommendations'
import { RecommendationCard } from './RecommendationCard'

type RecommendationGridProps = {
  goal: RecommendationGoal
  limit?: number
  className?: string
}

export function RecommendationGrid({
  goal,
  limit,
  className = '',
}: RecommendationGridProps) {
  const items = getRecommendationsForGoal(goal, limit)

  if (items.length === 0) {
    return (
      <section className={`rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5 text-sm text-muted ${className}`}>
        No recommendation cards are configured for this goal yet.
      </section>
    )
  }

  return (
    <section className={`grid gap-4 md:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <RecommendationCard key={item.id} item={item} />
      ))}
    </section>
  )
}
