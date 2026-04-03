export type HerbProduct = {
  name: string
  brand?: string
  form: string
  attributes: string[]
  notes?: string
}

export type HerbProductEntry = {
  herbSlug: string
  products: HerbProduct[]
}

export const herbProducts: HerbProductEntry[] = [
  {
    herbSlug: 'ashwagandha',
    products: [
      {
        name: 'Organic Ashwagandha Root Extract',
        brand: 'Himalaya',
        form: 'capsule',
        attributes: ['root-only', 'standardized withanolides', 'third-party tested'],
        notes: 'Good fit when you want a measured daily format with straightforward labeling.',
      },
      {
        name: 'Ashwagandha Root Powder',
        form: 'powder',
        attributes: ['root powder', 'single-herb formula', 'clear serving scoop'],
        notes: 'Works well for tea or warm milk-style preparation when flavor is acceptable.',
      },
    ],
  },
  {
    herbSlug: 'chamomile',
    products: [
      {
        name: 'Single-Herb Chamomile Tea Bags',
        form: 'tea',
        attributes: ['flower-only listing', 'no stimulant add-ins', 'aroma-forward dried flowers'],
        notes: 'Easy entry option for nightly wind-down routines.',
      },
      {
        name: 'Whole Chamomile Flowers',
        form: 'loose herb',
        attributes: ['whole flower heads', 'clean sifted material', 'organic when available'],
      },
    ],
  },
  {
    herbSlug: 'rhodiola-rosea',
    products: [
      {
        name: 'Rhodiola Rosea Standardized Extract',
        form: 'capsule',
        attributes: ['rhodiola rosea species named', 'rosavin/salidroside listed', 'clear per-serving mg'],
        notes: 'Most comparable format when choosing between extract products.',
      },
    ],
  },
  {
    herbSlug: 'turmeric',
    products: [
      {
        name: 'Turmeric Curcuminoid Extract',
        form: 'capsule',
        attributes: ['curcuminoid standardization', 'third-party tested', 'clear extract amount'],
      },
      {
        name: 'Culinary Turmeric Root Powder',
        form: 'powder',
        attributes: ['root powder', 'single-ingredient', 'batch freshness details'],
        notes: 'Practical for food-first use when you prefer gradual daily intake.',
      },
    ],
  },
]
