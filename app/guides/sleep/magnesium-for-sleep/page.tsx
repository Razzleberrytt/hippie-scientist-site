import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const SLUG = 'magnesium-for-sleep'

export const metadata = goalClusterArticleMetadata(SLUG)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} />
}

