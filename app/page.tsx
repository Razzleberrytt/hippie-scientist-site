import HomepageV2 from '@/components/homepage-v2'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

export default async function Page() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  return (
    <HomepageV2
      featuredHerbs={herbs.slice(0, 3)}
      featuredCompounds={compounds.slice(0, 3)}
    />
  )
}
