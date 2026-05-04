import HomepageV2 from '@/components/homepage-v2'
import { generatedComparisons } from '@/data/generated-comparisons'

export default function Page() {
  return <HomepageV2 featuredComparisons={generatedComparisons.slice(0,4)} />
}
