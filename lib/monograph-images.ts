import { formatDisplayLabel } from '@/lib/display-utils'

export type MonographKind = 'herb' | 'compound'

export type MonographImage = {
  src: string
  alt: string
  credit?: string
}

const FEATURED_IMAGES: Record<string, string> = {
  'herb:ashwagandha': '/images/guides/ashwagandha.svg',
  'herb:lions-mane': '/images/guides/lions-mane-mushroom.svg',
  'herb:hericium-erinaceus': '/images/guides/lions-mane-mushroom.svg',
  'herb:turmeric': '/images/guides/turmeric-curcumin.svg',
  'herb:turmeric-curcumin': '/images/guides/turmeric-curcumin.svg',
  'compound:curcumin': '/images/guides/turmeric-curcumin.svg',
  'compound:magnesium': '/images/guides/magnesium-for-sleep-and-anxiety.svg',
  'compound:magnesium-glycinate': '/images/guides/magnesium-for-sleep-and-anxiety.svg',
}

function asImagePath(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed
  return ''
}

function inferFallbackImage(kind: MonographKind, slug: string, record: Record<string, unknown>): string {
  const haystack = [
    slug,
    record.name,
    record.displayName,
    record.category,
    record.compoundClass,
    record.class,
  ].join(' ').toLowerCase()

  if (kind === 'compound') {
    if (/magnesium|zinc|iron|copper|selenium|lithium|mineral|electrolyte/.test(haystack)) {
      return '/images/monographs/mineral.svg'
    }
    return '/images/monographs/molecule.svg'
  }

  if (/mushroom|reishi|cordyceps|chaga|maitake|hericium|ganoderma|fung/.test(haystack)) {
    return '/images/monographs/mushroom.svg'
  }

  return '/images/monographs/botanical.svg'
}

export function getMonographImage(
  kind: MonographKind,
  slug: string,
  record: Record<string, unknown>,
): MonographImage {
  const displayName = formatDisplayLabel(record.displayName || record.name || slug) || 'Profile'
  const explicitImage = asImagePath(record.image || record.imageUrl || record.og || record.thumbnail)
  const featuredImage = FEATURED_IMAGES[`${kind}:${slug}`]
  const src = explicitImage || featuredImage || inferFallbackImage(kind, slug, record)
  const explicitCredit = typeof record.imageCredit === 'string' ? record.imageCredit.trim() : ''

  return {
    src,
    alt: `${displayName} monograph visual`,
    credit: explicitCredit || (featuredImage ? 'The Hippie Scientist illustration' : 'Generated profile category visual'),
  }
}

export function toAbsoluteImageUrl(src: string, siteUrl: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`
}
