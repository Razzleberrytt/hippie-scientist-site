export type HerbProduct = {
  name: string
  brand?: string
  form: string
  attributes: string[]
  notes?: string
  score?: number
  highlight?: boolean
  reasoning?: string
  affiliateUrl?: string
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
        score: 92,
        highlight: true,
        reasoning:
          'Prioritizes root-only standardization and routine-friendly dosing that matches the guidance.',
        affiliateUrl:
          'https://www.iherb.com/search?kw=organic%20ashwagandha%20root%20extract&rcode=HSITE01',
      },
      {
        name: 'Ashwagandha Root Powder',
        form: 'powder',
        attributes: ['root powder', 'single-herb formula', 'clear serving scoop'],
        notes: 'Works well for tea or warm milk-style preparation when flavor is acceptable.',
        score: 84,
        reasoning: 'Good whole-herb option when flexible preparation is preferred over extract precision.',
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
        score: 90,
        highlight: true,
        reasoning:
          'Keeps sourcing simple and supports consistent evening use with minimal preparation steps.',
        affiliateUrl:
          'https://www.iherb.com/search?kw=single-herb%20chamomile%20tea%20bags&rcode=HSITE01',
      },
      {
        name: 'Whole Chamomile Flowers',
        form: 'loose herb',
        attributes: ['whole flower heads', 'clean sifted material', 'organic when available'],
        score: 85,
        reasoning:
          'Strong fit for users who want direct flower quality checks and custom brew strength control.',
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
        score: 91,
        highlight: true,
        reasoning:
          'Named species and marker compounds make cross-brand comparison more transparent and reliable.',
        affiliateUrl:
          'https://www.iherb.com/search?kw=rhodiola%20rosea%20standardized%20extract&rcode=HSITE01',
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
        score: 89,
        highlight: true,
        reasoning:
          'Standardized curcuminoid labeling improves comparability when evaluating concentrated extracts.',
      },
      {
        name: 'Culinary Turmeric Root Powder',
        form: 'powder',
        attributes: ['root powder', 'single-ingredient', 'batch freshness details'],
        notes: 'Practical for food-first use when you prefer gradual daily intake.',
        score: 82,
        reasoning:
          'Useful for food-first routines, though active-compound precision is lower than standardized extracts.',
      },
    ],
  },
]
