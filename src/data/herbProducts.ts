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
        affiliateUrl: 'https://www.amazon.com/dp/B07N7S35N5?tag=razzleberry02-20',
      },
      {
        name: 'Ashwagandha Root Powder',
        form: 'powder',
        attributes: ['root powder', 'single-herb formula', 'clear serving scoop'],
        notes: 'Works well for tea or warm milk-style preparation when flavor is acceptable.',
        score: 84,
        reasoning:
          'Good whole-herb option when flexible preparation is preferred over extract precision.',
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
        affiliateUrl: 'https://www.amazon.com/dp/B0009F3POO?tag=razzleberry02-20',
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
        attributes: [
          'rhodiola rosea species named',
          'rosavin/salidroside listed',
          'clear per-serving mg',
        ],
        notes: 'Most comparable format when choosing between extract products.',
        score: 91,
        highlight: true,
        reasoning:
          'Named species and marker compounds make cross-brand comparison more transparent and reliable.',
        affiliateUrl: 'https://www.amazon.com/dp/B07PJ4M6JQ?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'echinacea-purpurea',
    products: [
      {
        name: 'Echinacea Purpurea Herbal Tea',
        brand: 'Traditional Medicinals',
        form: 'tea',
        attributes: [
          'echinacea purpurea identified on label',
          'single-herb tea format',
          'easy per-cup serving consistency',
        ],
        notes: 'Simple single-herb tea format for buyers who want species-labeled echinacea.',
        score: 88,
        highlight: true,
        reasoning:
          'Species-labeled tea in a straightforward preparation makes quality checks easier than blend-heavy immune products.',
        affiliateUrl: 'https://www.amazon.com/dp/B0009F3QKW?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'ginger',
    products: [
      {
        name: 'Organic Ginger Root Powder',
        brand: 'Starwest Botanicals',
        form: 'powder',
        attributes: ['single-ingredient ginger root', 'clear culinary/supplement crossover use', 'organic'],
        notes: 'Practical whole-root option for tea, food, or measured daily use.',
        score: 89,
        highlight: true,
        reasoning:
          'Single-ingredient root powder supports flexible use while keeping ingredient quality review straightforward.',
        affiliateUrl: 'https://www.amazon.com/dp/B01N1A4JNR?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'peppermint',
    products: [
      {
        name: 'Peppermint Herbal Tea',
        brand: 'Traditional Medicinals',
        form: 'tea',
        attributes: ['peppermint leaf-forward formula', 'caffeine-free', 'consistent bagged serving'],
        notes: 'Reliable tea-first format aligned with peppermint shopping guidance.',
        score: 90,
        highlight: true,
        reasoning:
          'Single-herb peppermint tea provides consistent preparation and clear ingredient labeling for conservative selection.',
        affiliateUrl: 'https://www.amazon.com/dp/B0009F3QMM?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'tulsi',
    products: [
      {
        name: 'Organic Tulsi Herbal Tea',
        brand: 'Organic India',
        form: 'tea',
        attributes: ['single-herb tulsi emphasis', 'organic certified', 'routine-friendly tea format'],
        notes: 'Accessible starting format before moving to capsules or tinctures.',
        score: 87,
        highlight: true,
        reasoning:
          'Tea-first tulsi products with straightforward ingredient panels are the most conservative fit for broad users.',
        affiliateUrl: 'https://www.amazon.com/dp/B0016B1I4S?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'valerian-root',
    products: [
      {
        name: 'Valerian Root Extract Capsules',
        brand: 'Nature’s Way',
        form: 'capsule',
        attributes: ['valerian root identified', 'extract-based capsule format', 'clear serving instructions'],
        notes: 'Capsule format simplifies nightly consistency compared with loose root prep.',
        score: 90,
        highlight: true,
        reasoning:
          'Root-identified extract capsules improve dose consistency and align with conservative valerian comparison criteria.',
        affiliateUrl: 'https://www.amazon.com/dp/B00020I70A?tag=razzleberry02-20',
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
