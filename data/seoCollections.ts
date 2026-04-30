export type SeoCollection = {
  slug: string
  title: string
  description: string
  itemType: 'herb' | 'compound'
  filters: {
    effectsAny?: string[]
  }
}

export const seoCollections: SeoCollection[] = []
