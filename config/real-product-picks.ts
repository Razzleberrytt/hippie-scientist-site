export type ProductPick = {
  label: string
  productName: string
  brand: string
  bestFor: string
  form: string
  doseNote?: string
  qualityNote: string
  caution?: string
  searchQuery: string
}

export type CompoundProductPicks = {
  compoundSlug: string
  intro: string
  picks: ProductPick[]
}

export const realProductPicks: Record<string, CompoundProductPicks> = {
  creatine: {
    compoundSlug: 'creatine',
    intro: 'Creatine monohydrate is the default evidence-aligned form for most users. Prioritize clear 5 g serving information, simple ingredients, and testing signals.',
    picks: [
      {
        label: 'Best overall',
        productName: 'Optimum Nutrition Micronized Creatine Monohydrate Powder',
        brand: 'Optimum Nutrition',
        bestFor: 'Most users who want a mainstream creatine monohydrate powder',
        form: 'Micronized creatine monohydrate powder',
        doseNote: 'Common serving format is 5 g creatine monohydrate.',
        qualityNote: 'Widely available simple monohydrate product with clear serving format.',
        searchQuery: 'Optimum Nutrition Micronized Creatine Monohydrate Powder',
      },
      {
        label: 'Best sport-tested premium',
        productName: 'Thorne Creatine',
        brand: 'Thorne',
        bestFor: 'Athletes or users who care most about testing credentials',
        form: 'Creatine monohydrate powder',
        doseNote: 'Look for the 5 g per serving powder version.',
        qualityNote: 'NSF Certified for Sport option frequently recommended for athletes.',
        searchQuery: 'Thorne Creatine NSF Certified for Sport',
      },
      {
        label: 'Best bulk value',
        productName: 'Nutricost Creatine Monohydrate Micronized Powder',
        brand: 'Nutricost',
        bestFor: 'Cost-conscious users who want simple creatine monohydrate',
        form: 'Micronized creatine monohydrate powder',
        doseNote: 'Look for 5 g per serving labeling.',
        qualityNote: 'Popular value-oriented creatine monohydrate option.',
        searchQuery: 'Nutricost Creatine Monohydrate Micronized Powder',
      },
    ],
  },

  magnesium: {
    compoundSlug: 'magnesium',
    intro: 'Magnesium products vary by form. Glycinate is commonly chosen for gentler evening use, citrate is more bowel-active, and threonate is marketed for cognitive support.',
    picks: [
      {
        label: 'Best glycinate',
        productName: 'Pure Encapsulations Magnesium Glycinate',
        brand: 'Pure Encapsulations',
        bestFor: 'Users who want a cleaner glycinate-style magnesium product',
        form: 'Magnesium glycinate capsule',
        doseNote: 'Check elemental magnesium amount, not just total compound weight.',
        qualityNote: 'Common premium pick in magnesium glycinate category.',
        caution: 'Avoid high-dose magnesium without clinician guidance in kidney disease.',
        searchQuery: 'Pure Encapsulations Magnesium Glycinate',
      },
      {
        label: 'Best value glycinate',
        productName: 'Doctors Best High Absorption Magnesium Lysinate Glycinate',
        brand: "Doctor's Best",
        bestFor: 'Users who want a lower-cost chelated magnesium option',
        form: 'Chelated magnesium lysinate glycinate tablets',
        doseNote: 'Check serving size because tablets per serving can vary.',
        qualityNote: 'Common value-oriented chelated magnesium option.',
        caution: 'Magnesium can cause digestive effects and may interact with some medications by timing.',
        searchQuery: 'Doctors Best High Absorption Magnesium Lysinate Glycinate',
      },
      {
        label: 'Best mainstream option',
        productName: 'Nature Made Magnesium Glycinate',
        brand: 'Nature Made',
        bestFor: 'Users who prefer a widely available mainstream brand',
        form: 'Magnesium bisglycinate capsules',
        doseNote: 'Confirm elemental magnesium per serving.',
        qualityNote: 'Mainstream option commonly found in retail channels.',
        caution: 'Separate magnesium from certain medications when advised by a clinician or pharmacist.',
        searchQuery: 'Nature Made Magnesium Glycinate 200 mg',
      },
    ],
  },

  melatonin: {
    compoundSlug: 'melatonin',
    intro: 'Melatonin is best handled conservatively. Lower-dose products are often more sensible as a starting point than high-dose sleep blends.',
    picks: [
      {
        label: 'Best conservative starter',
        productName: 'Swanson Melatonin 1 mg',
        brand: 'Swanson',
        bestFor: 'Users who want to start with a lower dose',
        form: 'Capsule',
        doseNote: '1 mg lower-dose format.',
        qualityNote: 'Lower-dose starter option highlighted by supplement review sources.',
        caution: 'More melatonin is not always better; watch next-day grogginess.',
        searchQuery: 'Swanson Melatonin 1 mg capsules',
      },
      {
        label: 'Best budget mainstream',
        productName: 'Nature Made Melatonin 3 mg',
        brand: 'Nature Made',
        bestFor: 'Users who want a simple mainstream melatonin tablet',
        form: 'Tablet',
        doseNote: '3 mg per tablet format is common.',
        qualityNote: 'Common budget-friendly mainstream option; check current USP labeling on the exact product.',
        caution: 'Use caution with sedatives, pregnancy, autoimmune disease, and medical conditions.',
        searchQuery: 'Nature Made Melatonin 3 mg tablets',
      },
      {
        label: 'Best fast-dissolve',
        productName: 'Natrol Melatonin Fast Dissolve',
        brand: 'Natrol',
        bestFor: 'Users who prefer a no-water quick-dissolve format',
        form: 'Fast-dissolve tablet',
        doseNote: 'Natrol offers several strengths; avoid assuming higher dose is better.',
        qualityNote: 'Popular fast-dissolve melatonin format.',
        caution: 'Start low and avoid stacking with other sedatives without guidance.',
        searchQuery: 'Natrol Melatonin Fast Dissolve tablets',
      },
    ],
  },

  'l-theanine': {
    compoundSlug: 'l-theanine',
    intro: 'Plain L-theanine is easier to reason about than multi-ingredient calming blends. Suntheanine-labeled products are common premium options.',
    picks: [
      {
        label: 'Best overall',
        productName: 'Jarrow Formulas Theanine 200 mg',
        brand: 'Jarrow Formulas',
        bestFor: 'Users who want a simple 200 mg theanine capsule',
        form: 'Vegetarian capsule',
        doseNote: '200 mg L-theanine per serving format is common.',
        qualityNote: 'Frequently recommended theanine product with clean single-ingredient positioning.',
        searchQuery: 'Jarrow Formulas Theanine 200 mg',
      },
      {
        label: 'Best value',
        productName: 'NOW Foods L-Theanine 200 mg',
        brand: 'NOW Foods',
        bestFor: 'Users who want a budget-friendly L-theanine option',
        form: 'Vegetarian capsule',
        doseNote: 'Often sold as 200 mg L-theanine with inositol depending on exact version.',
        qualityNote: 'Common value pick in the L-theanine category.',
        searchQuery: 'NOW Foods L-Theanine 200 mg',
      },
      {
        label: 'Best caffeine-stack option',
        productName: 'Sports Research Suntheanine L-Theanine',
        brand: 'Sports Research',
        bestFor: 'Users pairing theanine with coffee or caffeine for smoother focus',
        form: 'Softgel',
        doseNote: 'Look for the 200 mg Suntheanine version.',
        qualityNote: 'Suntheanine-branded option often selected for focused calm use-cases.',
        caution: 'Softgel format may not fit vegan users depending on exact product.',
        searchQuery: 'Sports Research Suntheanine L-Theanine 200 mg',
      },
    ],
  },
}

export function getRealProductPicks(compoundSlugOrName: string): CompoundProductPicks | null {
  const key = compoundSlugOrName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  return realProductPicks[key] ?? null
}
