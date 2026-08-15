import type { RuntimeRecord } from '../../src/types/content'

import { getHerbSummaryIndex } from '../../src/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { formatDisplayLabel } from '@/lib/display-utils'
import { isRedirectedDuplicate } from '@/lib/deprecated-herb-canonicals'

export function getHerbName(herb: RuntimeRecord) {
  return formatDisplayLabel(herb.displayName) || formatDisplayLabel(herb.name) || formatDisplayLabel(herb.slug)
}

export async function loadPublishedHerbs(): Promise<RuntimeRecord[]> {
  const allHerbs = (await getHerbSummaryIndex()) as RuntimeRecord[]
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
