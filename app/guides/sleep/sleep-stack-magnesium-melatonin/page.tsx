import GoalClusterArticlePage, { goalClusterArticleMetadata } from '@/components/articles/GoalClusterArticlePage'

const CANONICAL_PATH = '/guides/sleep/sleep-stack-magnesium-melatonin/'
const SLUG = 'sleep-stack-magnesium-melatonin'

export const metadata = goalClusterArticleMetadata(SLUG, CANONICAL_PATH)

export default function Page() {
  return <GoalClusterArticlePage slug={SLUG} canonicalPath={CANONICAL_PATH} />
}

