import type { RuntimeRecord } from '../../types/content'

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

export function selectCanonicalCompounds(compounds: RuntimeRecord[]): RuntimeRecord[] {
  const presentSlugs = new Set(compounds.map((compound) => String(compound.slug || '')))

  return compounds
    .filter(
      (compound) =>
        compound.slug &&
        !isRedirectedCompoundDuplicate(String(compound.slug), presentSlugs),
    )
    .sort((a, b) => getCompoundName(a).localeCompare(getCompoundName(b)))
}

export function selectPublishedCompounds(compounds: RuntimeRecord[]): RuntimeRecord[] {
  return selectCanonicalCompounds(compounds).filter(
    (compound) => getRuntimeVisibility(compound).canIndex,
  )
}
