import { cache } from './react-cache'
import {
  getCompoundBySlug,
  getCompounds,
  getHerbBySlug,
  getHerbs,
} from './runtime-data'
import {
  parseCanonicalPublicationRecord,
  type CanonicalEntityType,
  type CanonicalPublicationRecord,
} from './canonical-content'
import type { RuntimeRecord } from '../types/content'

function canonicalize(
  record: RuntimeRecord | null,
  entityType: CanonicalEntityType,
): CanonicalPublicationRecord | null {
  if (!record) return null
  const parsed = parseCanonicalPublicationRecord(record, entityType)
  return parsed.ok ? parsed.value : null
}

function canonicalizeMany(
  records: RuntimeRecord[],
  entityType: CanonicalEntityType,
): CanonicalPublicationRecord[] {
  return records.flatMap(record => {
    const parsed = parseCanonicalPublicationRecord(record, entityType)
    return parsed.ok ? [parsed.value] : []
  })
}

/**
 * Typed publication boundary for React/page consumers.
 *
 * Raw runtime loaders intentionally remain available to data-pipeline code,
 * but new public-facing components should prefer these getters so legacy field
 * aliases are normalized and malformed records fail closed before rendering.
 */
export const getCanonicalHerbs = cache(async (): Promise<CanonicalPublicationRecord[]> =>
  canonicalizeMany(await getHerbs(), 'herb'),
)

export const getCanonicalCompounds = cache(async (): Promise<CanonicalPublicationRecord[]> =>
  canonicalizeMany(await getCompounds(), 'compound'),
)

export async function getCanonicalHerbBySlug(slug: string): Promise<CanonicalPublicationRecord | null> {
  return canonicalize(await getHerbBySlug(slug), 'herb')
}

export async function getCanonicalCompoundBySlug(slug: string): Promise<CanonicalPublicationRecord | null> {
  return canonicalize(await getCompoundBySlug(slug), 'compound')
}
