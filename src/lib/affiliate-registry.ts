export interface ActiveIngredient {
  name: string
  amountMg: number
  activeCompound: string
  activeYieldPercent: number // e.g. 5 for 5% concentration, 100 for pure compound
}

export type ProductCertification = 'GMP' | 'COA' | 'USP' | 'NSF' | 'Third-Party Tested'

export interface AffiliateProduct {
  id: string
  brand: string
  name: string
  category: 'herb' | 'compound'
  entitySlugs: string[] // slugs of herbs or compounds this satisfies
  priceUsd: number
  servings: number
  capsulesPerContainer: number
  servingSize: number // in capsules/tablets
  activeIngredients: ActiveIngredient[]
  certifications: ProductCertification[]
  amazonAsin: string
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // ASHWAGANDHA
  {
    id: 'jarrow-ashwagandha-ksm66',
    brand: 'Jarrow Formulas',
    name: 'KSM-66 Ashwagandha',
    category: 'herb',
    entitySlugs: ['ashwagandha'],
    priceUsd: 16.95,
    servings: 120,
    capsulesPerContainer: 120,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Ashwagandha Root Extract (KSM-66)',
        amountMg: 300,
        activeCompound: 'withanolides',
        activeYieldPercent: 5,
      },
    ],
    certifications: ['GMP', 'Third-Party Tested'],
    amazonAsin: 'B0013OQG0A',
  },
  {
    id: 'now-ashwagandha-450',
    brand: 'NOW Foods',
    name: 'Ashwagandha Extract',
    category: 'herb',
    entitySlugs: ['ashwagandha'],
    priceUsd: 11.50,
    servings: 90,
    capsulesPerContainer: 90,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Ashwagandha Root Extract',
        amountMg: 450,
        activeCompound: 'withanolides',
        activeYieldPercent: 2.5,
      },
    ],
    certifications: ['GMP'],
    amazonAsin: 'B0013OVZMI',
  },
  {
    id: 'le-optimized-ashwagandha',
    brand: 'Life Extension',
    name: 'Optimized Ashwagandha (Sensoril)',
    category: 'herb',
    entitySlugs: ['ashwagandha'],
    priceUsd: 14.25,
    servings: 60,
    capsulesPerContainer: 60,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Ashwagandha Extract (Sensoril)',
        amountMg: 125,
        activeCompound: 'withanolides',
        activeYieldPercent: 10,
      },
    ],
    certifications: ['GMP', 'COA'],
    amazonAsin: 'B00271NFE6',
  },

  // L-THEANINE
  {
    id: 'doctors-best-l-theanine',
    brand: "Doctor's Best",
    name: 'Suntheanine L-Theanine',
    category: 'compound',
    entitySlugs: ['l-theanine', 'theanine'],
    priceUsd: 14.99,
    servings: 90,
    capsulesPerContainer: 90,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Suntheanine L-Theanine',
        amountMg: 150,
        activeCompound: 'L-Theanine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP', 'USP'],
    amazonAsin: 'B0019OK3Q6',
  },
  {
    id: 'now-l-theanine-200',
    brand: 'NOW Foods',
    name: 'L-Theanine',
    category: 'compound',
    entitySlugs: ['l-theanine', 'theanine'],
    priceUsd: 18.99,
    servings: 120,
    capsulesPerContainer: 120,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'L-Theanine',
        amountMg: 200,
        activeCompound: 'L-Theanine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP', 'COA'],
    amazonAsin: 'B000781GA2',
  },

  // RHODIOLA ROSEA
  {
    id: 'le-rhodiola-extract',
    brand: 'Life Extension',
    name: 'Rhodiola Extract',
    category: 'herb',
    entitySlugs: ['rhodiola', 'rhodiola-rosea'],
    priceUsd: 15.00,
    servings: 60,
    capsulesPerContainer: 60,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Rhodiola Rosea Root Extract',
        amountMg: 250,
        activeCompound: 'rosavins',
        activeYieldPercent: 3,
      },
      {
        name: 'Rhodiola Rosea Root Extract',
        amountMg: 250,
        activeCompound: 'salidrosides',
        activeYieldPercent: 1,
      },
    ],
    certifications: ['GMP', 'COA'],
    amazonAsin: 'B001T9S8SM',
  },
  {
    id: 'now-rhodiola-500',
    brand: 'NOW Foods',
    name: 'Rhodiola Rosea Extract',
    category: 'herb',
    entitySlugs: ['rhodiola', 'rhodiola-rosea'],
    priceUsd: 19.99,
    servings: 60,
    capsulesPerContainer: 60,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Rhodiola Rosea Extract',
        amountMg: 500,
        activeCompound: 'rosavins',
        activeYieldPercent: 3,
      },
      {
        name: 'Rhodiola Rosea Extract',
        amountMg: 500,
        activeCompound: 'salidrosides',
        activeYieldPercent: 1,
      },
    ],
    certifications: ['GMP'],
    amazonAsin: 'B0019OI2J0',
  },

  // BERBERINE
  {
    id: 'thorne-berberine-500',
    brand: 'Thorne',
    name: 'Berberine-500',
    category: 'compound',
    entitySlugs: ['berberine'],
    priceUsd: 36.00,
    servings: 60,
    capsulesPerContainer: 60,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Berberine HCl',
        amountMg: 500,
        activeCompound: 'berberine',
        activeYieldPercent: 85,
      },
    ],
    certifications: ['GMP', 'Third-Party Tested', 'COA'],
    amazonAsin: 'B0094FTO68',
  },
  {
    id: 'doctors-best-berberine',
    brand: "Doctor's Best",
    name: 'Berberine',
    category: 'compound',
    entitySlugs: ['berberine'],
    priceUsd: 18.99,
    servings: 60,
    capsulesPerContainer: 60,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Berberine HCl',
        amountMg: 500,
        activeCompound: 'berberine',
        activeYieldPercent: 85,
      },
    ],
    certifications: ['GMP', 'USP'],
    amazonAsin: 'B07FB9G61B',
  },

  // CAFFEINE
  {
    id: 'prolab-caffeine-200',
    brand: 'ProLab',
    name: 'Caffeine Tablets',
    category: 'compound',
    entitySlugs: ['caffeine'],
    priceUsd: 7.99,
    servings: 100,
    capsulesPerContainer: 100,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Caffeine Anhydrous',
        amountMg: 200,
        activeCompound: 'caffeine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP'],
    amazonAsin: 'B0011865IQ',
  },
  {
    id: 'nutricost-caffeine-200',
    brand: 'Nutricost',
    name: 'Caffeine Capsules',
    category: 'compound',
    entitySlugs: ['caffeine'],
    priceUsd: 9.95,
    servings: 250,
    capsulesPerContainer: 250,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'Caffeine Anhydrous',
        amountMg: 200,
        activeCompound: 'caffeine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP', 'Third-Party Tested'],
    amazonAsin: 'B01D56M1EC',
  },

  // L-TYROSINE
  {
    id: 'now-l-tyrosine-500',
    brand: 'NOW Foods',
    name: 'L-Tyrosine',
    category: 'compound',
    entitySlugs: ['l-tyrosine'],
    priceUsd: 12.99,
    servings: 120,
    capsulesPerContainer: 120,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'L-Tyrosine',
        amountMg: 500,
        activeCompound: 'L-Tyrosine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP'],
    amazonAsin: 'B0019OSM8A',
  },
  {
    id: 'jarrow-l-tyrosine-500',
    brand: 'Jarrow Formulas',
    name: 'L-Tyrosine',
    category: 'compound',
    entitySlugs: ['l-tyrosine'],
    priceUsd: 14.50,
    servings: 100,
    capsulesPerContainer: 100,
    servingSize: 1,
    activeIngredients: [
      {
        name: 'L-Tyrosine',
        amountMg: 500,
        activeCompound: 'L-Tyrosine',
        activeYieldPercent: 100,
      },
    ],
    certifications: ['GMP', 'Third-Party Tested'],
    amazonAsin: 'B0013OSJPE',
  },
]

export function getProductsBySlug(slug: string): AffiliateProduct[] {
  const norm = slug.trim().toLowerCase()
  return AFFILIATE_PRODUCTS.filter(p => p.entitySlugs.map(s => s.toLowerCase()).includes(norm))
}
