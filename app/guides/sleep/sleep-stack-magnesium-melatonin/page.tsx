import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const SLUG = 'sleep-stack-magnesium-melatonin'

export const metadata = goalClusterArticleMetadata(SLUG)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} />
}

