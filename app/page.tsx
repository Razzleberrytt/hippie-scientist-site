import HomepageV2 from '@/components/homepage-v2'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

export default async function Page() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  const featuredHerbs = herbs
    .filter((item: any) => getRuntimeVisibility(item).canFeature)
    .slice(0, 3)

  const featuredCompounds = compounds
    .filter((item: any) => getRuntimeVisibility(item).canFeature)
    .slice(0, 3)

  return (
    <HomepageV2
      featuredHerbs={featuredHerbs}
      featuredCompounds={featuredCompounds}
    />
  )
}
