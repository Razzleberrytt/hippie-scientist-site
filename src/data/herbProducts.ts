export type HerbProduct = {
  productTitle: string
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
  // Explicit link target: herbSlug should match the canonical herb.slug field.
  herbSlug: string
  products: HerbProduct[]
}

export const herbProducts: HerbProductEntry[] = [
  {
    herbSlug: 'ashwagandha',
    products: [
      {
        productTitle: 'Organic Ashwagandha Root Extract',
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
        productTitle: 'Ashwagandha Root Powder',
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
        productTitle: 'Single-Herb Chamomile Tea Bags',
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
        productTitle: 'Whole Chamomile Flowers',
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
        productTitle: 'Rhodiola Rosea Standardized Extract',
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
        productTitle: 'Echinacea Purpurea Herbal Tea',
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
        productTitle: 'Organic Ginger Root Powder',
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
    herbSlug: 'lemon-balm',
    products: [
      {
        productTitle: 'Lemon Balm Herbal Tea',
        brand: 'Traditional Medicinals',
        form: 'tea',
        attributes: ['melissa officinalis listed', 'single-herb tea format', 'routine-friendly tea bags'],
        notes: 'Useful baseline format for gentle calming routines and simple nightly adherence.',
        score: 88,
        highlight: true,
        reasoning:
          'Species-labeled single-herb tea keeps quality checks straightforward for first-time buyers.',
        affiliateUrl: 'https://www.amazon.com/dp/B0009F3QK6?tag=razzleberry02-20',
      },
      {
        productTitle: 'Lemon Balm Liquid Extract',
        brand: 'Herb Pharm',
        form: 'extract',
        attributes: ['single-herb extract', 'clear dropper serving guidance', 'alcohol extract disclosure'],
        notes: 'Alternative for buyers who prefer low-volume servings over tea preparation.',
        score: 84,
        reasoning:
          'Liquid format offers flexible serving adjustments while keeping ingredient identity explicit.',
        affiliateUrl: 'https://www.amazon.com/dp/B0016AFR98?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'lion-s-mane',
    products: [
      {
        productTitle: 'Lion’s Mane Fruiting Body Capsules',
        brand: 'Real Mushrooms',
        form: 'capsule',
        attributes: ['fruiting body sourced', 'beta-glucans disclosed', 'grain-free mushroom material'],
        notes: 'Capsule-first option for users who want consistent daily mushroom intake.',
        score: 92,
        highlight: true,
        reasoning:
          'Fruiting-body transparency plus active-content disclosure supports cleaner cross-product comparisons.',
        affiliateUrl: 'https://www.amazon.com/dp/B078SZX3ML?tag=razzleberry02-20',
      },
      {
        productTitle: 'Lion’s Mane Mushroom Powder',
        brand: 'Om Mushroom',
        form: 'powder',
        attributes: ['powder mix format', 'measured scoop serving', 'single-mushroom focus'],
        notes: 'Works for smoothie/coffee routines when users prefer mix-ins over capsules.',
        score: 83,
        reasoning:
          'Powder format broadens onboarding options for buyers who avoid pill-based routines.',
        affiliateUrl: 'https://www.amazon.com/dp/B01N4SM3LF?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'passionflower',
    products: [
      {
        productTitle: 'Organic Passionflower Tea',
        brand: 'Traditional Medicinals',
        form: 'tea',
        attributes: ['single-herb passionflower emphasis', 'easy tea-bag dosing', 'caffeine-free evening format'],
        notes: 'Good first-step product for users testing passionflower in bedtime wind-down routines.',
        score: 87,
        highlight: true,
        reasoning:
          'Tea-first format keeps serving intensity moderate and supports conservative onboarding.',
        affiliateUrl: 'https://www.amazon.com/dp/B00F3RCL2O?tag=razzleberry02-20',
      },
      {
        productTitle: 'Passionflower Liquid Extract',
        brand: 'Nature’s Answer',
        form: 'extract',
        attributes: ['passiflora incarnata labeling', 'dropper dosage instructions', 'single-herb liquid formula'],
        notes: 'For users who want easier serving control than loose herb or tea prep.',
        score: 82,
        reasoning:
          'Adds a liquid alternative for buyers who need portable evening format options.',
        affiliateUrl: 'https://www.amazon.com/dp/B0014AU7R8?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'peppermint',
    products: [
      {
        productTitle: 'Peppermint Herbal Tea',
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
        productTitle: 'Organic Tulsi Herbal Tea',
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
        productTitle: 'Valerian Root Extract Capsules',
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
    herbSlug: 'reishi-mushroom',
    products: [
      {
        productTitle: 'Organic Reishi Mushroom Extract Capsules',
        brand: 'Real Mushrooms',
        form: 'capsule',
        attributes: [
          'fruiting body extract',
          'beta-glucans listed on label',
          'grain-free mushroom material',
        ],
        notes: 'Strong baseline option when comparing reishi extracts for standardized mushroom content.',
        score: 93,
        highlight: true,
        reasoning:
          'Fruiting-body sourcing plus disclosed beta-glucan content improves cross-product comparability and avoids mycelium-heavy ambiguity.',
        affiliateUrl: 'https://www.amazon.com/dp/B00M9MPS8E?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'bacopa-monnieri',
    products: [
      {
        productTitle: 'Bacopa Monnieri Standardized Extract',
        brand: 'Double Wood Supplements',
        form: 'capsule',
        attributes: [
          'bacopa monnieri species named',
          'bacosides standardization disclosed',
          'third-party tested',
        ],
        notes: 'Capsule format with marker compounds identified for simpler side-by-side brand review.',
        score: 91,
        highlight: true,
        reasoning:
          'Species-specific labeling and bacoside standardization align with conservative quality filters for bacopa buyers.',
        affiliateUrl: 'https://www.amazon.com/dp/B07X5KZ67V?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'silybum-marianum',
    products: [
      {
        productTitle: 'Milk Thistle Seed Extract Capsules',
        brand: 'Jarrow Formulas',
        form: 'capsule',
        attributes: [
          'silymarin standardized extract',
          'seed-derived milk thistle',
          'clear per-serving dosage',
        ],
        notes: 'Commonly compared format for milk thistle shoppers prioritizing standardized silymarin.',
        score: 92,
        highlight: true,
        reasoning:
          'Seed extract standardization with explicit silymarin strength supports consistent potency comparisons across products.',
        affiliateUrl: 'https://www.amazon.com/dp/B0013OXD38?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'sambucus-nigra',
    products: [
      {
        productTitle: 'Black Elderberry Standardized Extract',
        brand: 'Nature’s Way',
        form: 'capsule',
        attributes: [
          'sambucus nigra species identified',
          'standardized anthocyanin-rich extract',
          'single-active herb emphasis',
        ],
        notes: 'Useful option for elderberry buyers who want a named species in a measured capsule format.',
        score: 90,
        highlight: true,
        reasoning:
          'Species-identified elderberry extract with standardized active compounds reduces ambiguity compared with blend-heavy immune formulas.',
        affiliateUrl: 'https://www.amazon.com/dp/B0009ETA0E?tag=razzleberry02-20',
      },
    ],
  },
  {
    herbSlug: 'turmeric',
    products: [
      {
        productTitle: 'Turmeric Curcuminoid Extract',
        form: 'capsule',
        attributes: ['curcuminoid standardization', 'third-party tested', 'clear extract amount'],
        score: 89,
        highlight: true,
        reasoning:
          'Standardized curcuminoid labeling improves comparability when evaluating concentrated extracts.',
      },
      {
        productTitle: 'Culinary Turmeric Root Powder',
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
