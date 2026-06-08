import { getSemanticImage } from '@/lib/image-registry'

export function getHerbFallbackImage(slug?: string) {
  return getSemanticImage(slug, 'herb')
}

export function getCompoundFallbackImage(slug?: string) {
  return getSemanticImage(slug, 'compound')
}

export function getPathwayFallbackImage(slug?: string) {
  return getSemanticImage(slug, 'pathway')
}

export function getSemanticFallbackImage(
  slug?: string,
  category?: string,
) {
  return getSemanticImage(slug, category)
}
