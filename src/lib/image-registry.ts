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
    src: '/images/guides/ashwagandha-herb.jpg',
    alt: 'Ashwagandha botanical imagery',
    type: 'herb',
  },
  turmeric: {
    src: '/images/guides/turmeric-curcumin.jpg',
    alt: 'Turmeric botanical imagery',
    type: 'herb',
  },
  rhodiola: {
    src: '/images/monographs/photos/rhodiola.jpg',
    alt: 'Rhodiola botanical imagery',
    type: 'herb',
  },
}

const compoundImages: Record<string, SemanticImageRecord> = {
  l_theanine: {
    src: '/images/monographs/photos/l-theanine.jpg',
    alt: 'L-Theanine molecular illustration',
    type: 'compound',
  },
  magnesium: {
    src: '/images/guides/magnesium-for-sleep.jpg',
    alt: 'Magnesium scientific illustration',
    type: 'compound',
  },
}

const pathwayImages: Record<string, SemanticImageRecord> = {
  sleep: {
    src: '/images/guides/sleep-supplements-guide.jpg',
    alt: 'Sleep pathway visualization',
    type: 'pathway',
  },
  cognition: {
    src: '/images/learn-hub.jpg',
    alt: 'Cognition pathway visualization',
    type: 'pathway',
  },
}

const fallbackImages: Record<string, SemanticImageRecord> = {
  herb: {
    src: '/images/monographs/botanical.svg',
    alt: 'Botanical fallback image',
    type: 'fallback',
  },
  compound: {
    src: '/images/monographs/molecule.svg',
    alt: 'Scientific compound fallback image',
    type: 'fallback',
  },
  pathway: {
    src: '/images/learn-hub.jpg',
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
