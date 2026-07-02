import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const CANONICAL_PATH = '/guides/herbs/melatonin-vs-valerian/'
const SLUG = 'melatonin-vs-valerian'

export const metadata = goalClusterArticleMetadata(SLUG, CANONICAL_PATH)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} canonicalPath={CANONICAL_PATH} />
}

