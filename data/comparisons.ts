export type ComparisonConfig = {
  slug: string
  title: string
  summary: string
  a: {
    label: string
    candidates: string[]
  }
  b: {
    label: string
    candidates: string[]
  }
}

export const supplementComparisons: ComparisonConfig[] = [
  {
    slug: 'creatine-vs-whey',
    title: 'Creatine vs Whey Protein',
    summary: 'Creatine is usually the better choice for strength and repeat-output support, while whey is mainly a convenient protein source for hitting daily protein targets.',
    a: { label: 'Creatine', candidates: ['creatine', 'creatine-monohydrate', 'creatine-hcl'] },
    b: { label: 'Whey Protein', candidates: ['whey', 'whey-protein', 'protein-whey-isolate', 'whey-protein-isolate', 'protein'] },
  },
  {
    slug: 'psyllium-vs-plant-sterols',
    title: 'Psyllium vs Plant Sterols',
    summary: 'Psyllium is a fiber-first option with gut and lipid relevance, while plant sterols are more directly positioned around cholesterol absorption support.',
    a: { label: 'Psyllium', candidates: ['psyllium', 'psyllium-husk'] },
    b: { label: 'Plant Sterols', candidates: ['plant-sterols', 'phytosterols'] },
  },
  {
    slug: 'berberine-vs-inositol',
    title: 'Berberine vs Inositol',
    summary: 'Berberine is usually framed around metabolic markers, while inositol is often compared for insulin signaling and hormone-related metabolic contexts.',
    a: { label: 'Berberine', candidates: ['berberine'] },
    b: { label: 'Inositol', candidates: ['inositol', 'myo-inositol', 'd-chiro-inositol'] },
  },
  {
    slug: 'melatonin-vs-l-theanine',
    title: 'Melatonin vs L-Theanine',
    summary: 'Melatonin is more about sleep timing, while L-theanine is more about calming without necessarily acting as a direct sleep-timing signal.',
    a: { label: 'Melatonin', candidates: ['melatonin'] },
    b: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  {
    slug: 'caffeine-vs-theanine',
    title: 'Caffeine vs L-Theanine',
    summary: 'Caffeine is the stronger alertness driver, while L-theanine is commonly paired with it to smooth stimulation and support calmer focus.',
    a: { label: 'Caffeine', candidates: ['caffeine'] },
    b: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  {
    slug: 'glucosamine-vs-chondroitin',
    title: 'Glucosamine vs Chondroitin',
    summary: 'Glucosamine and chondroitin are usually compared for joint-support routines, with value depending heavily on evidence quality, dose, and user context.',
    a: { label: 'Glucosamine', candidates: ['glucosamine', 'glucosamine-sulfate', 'glucosamine-hcl'] },
    b: { label: 'Chondroitin', candidates: ['chondroitin', 'chondroitin-sulfate'] },
  },
  {
    slug: 'magnesium-vs-melatonin',
    title: 'Magnesium vs Melatonin',
    summary: 'Magnesium is better framed as deficiency, relaxation, or muscle-context support, while melatonin is more directly tied to sleep timing and circadian signaling.',
    a: { label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-threonate', 'magnesium-citrate'] },
    b: { label: 'Melatonin', candidates: ['melatonin'] },
  },
  {
    slug: 'ashwagandha-vs-rhodiola',
    title: 'Ashwagandha vs Rhodiola',
    summary: 'Ashwagandha is usually positioned around stress and sleep-adjacent support, while rhodiola is more often compared for fatigue, stress resilience, and energy under pressure.',
    a: { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ashwagandha-k66', 'ksm-66-ashwagandha'] },
    b: { label: 'Rhodiola', candidates: ['rhodiola', 'rhodiola-rosea', 'rhodiola-rosea-extract'] },
  },
  {
    slug: 'ashwagandha-vs-magnesium',
    title: 'Ashwagandha vs Magnesium',
    summary: 'Ashwagandha is an adaptogen-style stress option, while magnesium is more basic mineral support with different safety and deficiency considerations.',
    a: { label: 'Ashwagandha', candidates: ['ashwagandha', 'ashwagandha-extract', 'ashwagandha-k66', 'ksm-66-ashwagandha'] },
    b: { label: 'Magnesium', candidates: ['magnesium', 'magnesium-glycinate', 'magnesium-threonate', 'magnesium-citrate'] },
  },
  {
    slug: 'creatine-vs-beta-alanine',
    title: 'Creatine vs Beta-Alanine',
    summary: 'Creatine is a stronger default for strength and repeated high-output work, while beta-alanine is more specific to buffering fatigue in certain training durations.',
    a: { label: 'Creatine', candidates: ['creatine', 'creatine-monohydrate', 'creatine-hcl'] },
    b: { label: 'Beta-Alanine', candidates: ['beta-alanine', 'beta alanine'] },
  },
  {
    slug: 'alpha-gpc-vs-citicoline',
    title: 'Alpha-GPC vs Citicoline',
    summary: 'Alpha-GPC and citicoline are both choline-focused options, but differ in positioning, dosing context, and how people compare them for focus and cognition.',
    a: { label: 'Alpha-GPC', candidates: ['alpha-gpc', 'alpha gpc'] },
    b: { label: 'Citicoline', candidates: ['citicoline', 'cdp-choline', 'cdp choline'] },
  },
  {
    slug: 'bacopa-vs-lions-mane',
    title: 'Bacopa vs Lion’s Mane',
    summary: 'Bacopa is usually compared for memory and learning over time, while lion’s mane is more often positioned around nerve-growth signaling and broader cognition support.',
    a: { label: 'Bacopa', candidates: ['bacopa', 'bacopa-monnieri', 'bacopa-monnieri-extract'] },
    b: { label: 'Lion’s Mane', candidates: ['lions-mane', 'lion-s-mane', 'lions-mane-mushroom'] },
  },
  {
    slug: 'curcumin-vs-boswellia',
    title: 'Curcumin vs Boswellia',
    summary: 'Curcumin and boswellia are both commonly compared for inflammation and joint support, with different mechanisms, formulation issues, and tolerance considerations.',
    a: { label: 'Curcumin', candidates: ['curcumin', 'turmeric', 'turmeric-extract'] },
    b: { label: 'Boswellia', candidates: ['boswellia', 'boswellia-serrata', 'boswellia-extract'] },
  },
  {
    slug: 'omega-3-vs-krill-oil',
    title: 'Omega-3 vs Krill Oil',
    summary: 'Omega-3 fish oil and krill oil are compared for EPA/DHA delivery, cost, capsule format, and practical adherence rather than being identical products.',
    a: { label: 'Omega-3', candidates: ['omega-3', 'omega-3-fatty-acids', 'fish-oil'] },
    b: { label: 'Krill Oil', candidates: ['krill-oil', 'krill'] },
  },
  {
    slug: 'whey-vs-collagen',
    title: 'Whey Protein vs Collagen',
    summary: 'Whey is a better complete protein option for muscle protein targets, while collagen is usually positioned around connective tissue, skin, and joint-support routines.',
    a: { label: 'Whey Protein', candidates: ['whey', 'whey-protein', 'protein-whey-isolate', 'whey-protein-isolate', 'protein'] },
    b: { label: 'Collagen', candidates: ['collagen', 'collagen-peptides'] },
  },
  {
    slug: 'green-tea-extract-vs-caffeine',
    title: 'Green Tea Extract vs Caffeine',
    summary: 'Caffeine is the direct stimulant, while green tea extract is often compared for catechins, metabolic context, and safety concerns around concentrated extracts.',
    a: { label: 'Green Tea Extract', candidates: ['green-tea-extract', 'green-tea-extract-egcg', 'egcg'] },
    b: { label: 'Caffeine', candidates: ['caffeine'] },
  },
  {
    slug: 'berberine-vs-psyllium',
    title: 'Berberine vs Psyllium',
    summary: 'Berberine is more often compared for metabolic markers, while psyllium is a fiber-first option with gut and lipid-support relevance.',
    a: { label: 'Berberine', candidates: ['berberine'] },
    b: { label: 'Psyllium', candidates: ['psyllium', 'psyllium-husk'] },
  }
]
