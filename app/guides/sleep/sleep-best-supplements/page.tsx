import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const SLUG = 'sleep-best-supplements'

export const metadata = goalClusterArticleMetadata(SLUG)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} />
}

