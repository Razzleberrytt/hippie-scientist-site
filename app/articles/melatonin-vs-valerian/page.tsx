import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const SLUG = 'melatonin-vs-valerian'

export const metadata = goalClusterArticleMetadata(SLUG)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} />
}

