import { formatDisplayLabel, list, text } from '@/lib/display-utils'

type EntityType = 'herb' | 'compound'

export type AdaptiveComparison = {
  label: string
  description: string
  tone?: 'gentle' | 'balanced' | 'stimulating'
  href?: string
}

const STIMULATING_PATTERN = /stim|energy|focus|dopamine|alert|performance|energ/i
const CALM_PATTERN = /calm|sleep|relax|stress|recovery|gaba|anxiety/i
const CUMULATIVE_PATTERN = /bacopa|creatine|adaptogen|memory|recovery|cumulative/i
const ACUTE_PATTERN = /theanine|caffeine|focus|acute|fast|quick/i

function normalize(value: unknown) {
  return text(value).toLowerCase()
}

function getTone(record: any): AdaptiveComparison['tone'] {
  const source = [
    normalize(record?.summary),
    normalize(record?.description),
    ...list(record?.effects).map(normalize),
    ...list(record?.primary_effects).map(normalize),
  ].join(' ')

  if (STIMULATING_PATTERN.test(source)) return 'stimulating'
  if (CALM_PATTERN.test(source)) return 'gentle'
  return 'balanced'
}

function getHref(record: any, fallbackType: EntityType) {
  const slug = text(record?.slug)
  if (!slug) return undefined

  const type = record?.entityType === 'compound' || record?.entityType === 'herb'
    ? record.entityType
    : fallbackType

  return `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`
}

function getDescription(sourceRecord: any, targetRecord: any) {
  const source = normalize(sourceRecord?.summary)
  const target = normalize(targetRecord?.summary)

  if (CALM_PATTERN.test(target) && STIMULATING_PATTERN.test(source)) {
    return 'Potentially gentler or calmer comparison direction.'
  }

  if (STIMULATING_PATTERN.test(target) && CALM_PATTERN.test(source)) {
    return 'Potentially more activating comparison direction.'
  }

  if (CUMULATIVE_PATTERN.test(target)) {
    return 'More cumulative or consistency-oriented comparison.'
  }

  if (ACUTE_PATTERN.test(target)) {
    return 'More acute or immediately noticeable comparison.'
  }

  return 'Useful adjacent profile for fit and expectation comparison.'
}

export function buildAdaptiveComparisons(
  sourceRecord: any,
  relatedRecords: any[] = [],
  entityType: EntityType,
): AdaptiveComparison[] {
  return relatedRecords
    .filter((record) => record?.slug)
    .slice(0, 6)
    .map((record) => ({
      label: formatDisplayLabel(record?.name || record?.slug),
      description: getDescription(sourceRecord, record),
      tone: getTone(record),
      href: getHref(record, entityType),
    }))
}
