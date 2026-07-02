import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const CANONICAL_PATH = '/guides/anxiety/l-theanine-for-calm/'
const SLUG = 'l-theanine-for-calm'

export const metadata = goalClusterArticleMetadata(SLUG, CANONICAL_PATH)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} canonicalPath={CANONICAL_PATH} />
}

