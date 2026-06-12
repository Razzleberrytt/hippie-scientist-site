import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const SLUG = 'l-theanine-for-calm'

export const metadata = goalClusterArticleMetadata(SLUG)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} />
}

