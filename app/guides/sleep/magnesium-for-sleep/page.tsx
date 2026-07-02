import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const CANONICAL_PATH = '/guides/sleep/magnesium-for-sleep/'
const SLUG = 'magnesium-for-sleep'

export const metadata = goalClusterArticleMetadata(SLUG, CANONICAL_PATH)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} canonicalPath={CANONICAL_PATH} />
}

