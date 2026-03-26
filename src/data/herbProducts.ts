export const AMAZON_AFFILIATE_TRACKING_ID = 'razzleberry02-20'

export type ProductForm = 'capsule' | 'powder' | 'tea' | 'loose herb'

export type HerbProduct = {
  label: string
  form: ProductForm
  asin: string
  note: string
  bestFor: string
}

export type HerbProductCatalogEntry = {
  herb: string
  products: HerbProduct[]
}

export const herbProductCatalog: HerbProductCatalogEntry[] = [
  {
    herb: 'ashwagandha',
    products: [
      {
        label: 'Himalaya Organic Ashwagandha Capsules',
        form: 'capsule',
        asin: 'B003ODIZL6',
        note: 'Convenient daily use, standardized extract',
        bestFor: 'Best for daily use',
      },
      {
        label: 'Ashwagandha Root Powder',
        form: 'powder',
        asin: 'B01M0KJX7E',
        note: 'Traditional form for tea or mixing',
        bestFor: 'Best for traditional preparation',
      },
    ],
  },
  {
    herb: 'lions mane',
    products: [
      {
        label: 'Host Defense Lion’s Mane Capsules',
        form: 'capsule',
        asin: 'B002WJ2ALA',
        note: 'Trusted brand, widely used',
        bestFor: 'Best for convenience',
      },
      {
        label: 'Lion’s Mane Mushroom Powder',
        form: 'powder',
        asin: 'B01BK871DE',
        note: 'Mixable powder for coffee or smoothies',
        bestFor: 'Best for daily use',
      },
    ],
  },
  {
    herb: 'chamomile',
    products: [
      {
        label: 'Traditional Medicinals Chamomile Tea',
        form: 'tea',
        asin: 'B0009F3POO',
        note: 'Easy entry point, calming herbal tea',
        bestFor: 'Best for convenience',
      },
      {
        label: 'Organic Chamomile Flowers',
        form: 'loose herb',
        asin: 'B0001M0Z6A',
        note: 'Loose flowers for traditional preparation',
        bestFor: 'Best for traditional preparation',
      },
    ],
  },
]
