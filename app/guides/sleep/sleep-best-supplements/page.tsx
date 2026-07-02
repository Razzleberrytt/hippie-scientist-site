import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const CANONICAL_PATH = '/guides/sleep/sleep-best-supplements/'
const SLUG = 'sleep-best-supplements'

export const metadata = goalClusterArticleMetadata(SLUG, CANONICAL_PATH)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} canonicalPath={CANONICAL_PATH} />
}

