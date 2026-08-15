import type { RuntimeRecord } from '../../src/types/content'

import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { formatDisplayLabel } from '@/lib/display-utils'
import { isRedirectedCompoundDuplicate } from '@/lib/deprecated-compound-canonicals'

export function getCompoundName(compound: RuntimeRecord) {
  return (
    formatDisplayLabel(compound.displayName) ||
    formatDisplayLabel(compound.name) ||
    formatDisplayLabel(compound.compoundName) ||
    formatDisplayLabel(compound.canonicalCompoundName) ||
    formatDisplayLabel(compound.slug)
  )
}

export function selectPublishedCompounds(compounds: RuntimeRecord[]): RuntimeRecord[] {
  const presentSlugs = new Set(compounds.map((compound) => String(compound.slug || '')))

  return compounds
    .filter(
      (compound) =>
        compound.slug &&
        getRuntimeVisibility(compound).canIndex &&
        !isRedirectedCompoundDuplicate(String(compound.slug), presentSlugs),
    )
    .sort((a, b) => getCompoundName(a).localeCompare(getCompoundName(b)))
}
