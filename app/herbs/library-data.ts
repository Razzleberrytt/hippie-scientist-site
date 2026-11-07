import { profileCommonName } from '@/lib/profile-credibility'
import type { RuntimeRecord } from '../../types/content'

import { getHerbSummaryIndex } from '../../lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'

export function getHerbName(herb: RuntimeRecord) {
  return profileCommonName(herb)
}

export function selectPublishedHerbs(allHerbs: RuntimeRecord[]): RuntimeRecord[] {
  const presentSlugs = new Set(allHerbs.map((herb) => String(herb.slug || '')))

  return allHerbs
    .filter(
      (herb) =>
        herb.slug &&
        getRuntimeVisibility(herb).canIndex &&
        !isRedirectedDuplicate(String(herb.slug), presentSlugs),
    )
    .sort((a, b) => getHerbName(a).localeCompare(getHerbName(b)))
}

export async function loadPublishedHerbs(): Promise<RuntimeRecord[]> {
  const allHerbs = (await getHerbSummaryIndex()) as RuntimeRecord[]
  return selectPublishedHerbs(allHerbs)
}
