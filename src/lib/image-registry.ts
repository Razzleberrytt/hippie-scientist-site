export type SemanticImageType =
  | 'herb'
  | 'compound'
  | 'pathway'
  | 'ecosystem'
  | 'fallback'

export type SemanticImageRecord = {
  src: string
  alt: string
  type: SemanticImageType
}

const herbImages: Record<string, SemanticImageRecord> = {
  ashwagandha: {
    src: '/images/herbs/ashwagandha.webp',
    alt: 'Ashwagandha botanical imagery',
    type: 'herb',
  },
  turmeric: {
    src: '/images/herbs/turmeric.webp',
    alt: 'Turmeric botanical imagery',
    type: 'herb',
  },
  rhodiola: {
    src: '/images/herbs/rhodiola.webp',
    alt: 'Rhodiola botanical imagery',
    type: 'herb',
  },
}

const compoundImages: Record<string, SemanticImageRecord> = {
  l_theanine: {
    src: '/images/compounds/l-theanine.webp',
    alt: 'L-Theanine molecular illustration',
    type: 'compound',
  },
  magnesium: {
    src: '/images/compounds/magnesium.webp',
    alt: 'Magnesium scientific illustration',
    type: 'compound',
  },
}

const pathwayImages: Record<string, SemanticImageRecord> = {
  sleep: {
    src: '/images/pathways/sleep.webp',
    alt: 'Sleep pathway visualization',
    type: 'pathway',
  },
  cognition: {
    src: '/images/pathways/cognition.webp',
    alt: 'Cognition pathway visualization',
    type: 'pathway',
  },
}

const fallbackImages: Record<string, SemanticImageRecord> = {
  herb: {
    src: '/images/fallbacks/herb-fallback.webp',
    alt: 'Botanical fallback image',
    type: 'fallback',
  },
  compound: {
    src: '/images/fallbacks/compound-fallback.webp',
    alt: 'Scientific compound fallback image',
    type: 'fallback',
  },
  pathway: {
    src: '/images/fallbacks/pathway-fallback.webp',
    alt: 'Scientific pathway fallback image',
    type: 'fallback',
  },
}

export function getSemanticImage(slug?: string, category?: string) {
  const normalizedSlug = (slug || '').toLowerCase()
  const normalizedCategory = (category || '').toLowerCase()

  return (
    herbImages[normalizedSlug] ||
    compoundImages[normalizedSlug] ||
    pathwayImages[normalizedSlug] ||
    fallbackImages[normalizedCategory] ||
    fallbackImages.herb
  )
}
