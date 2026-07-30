export type AlkaloidEvidenceBand = 'human' | 'limited' | 'traditional'
export type AlkaloidFormat = 'botanical' | 'isolated'
export type AlkaloidSafetyTier = 'standard' | 'interaction' | 'higher'

export type AlkaloidDirectoryEntry = {
  id: string
  name: string
  identity: string
  alkaloids: string
  classification: string
  formats: AlkaloidFormat[]
  evidenceBand: AlkaloidEvidenceBand
  evidenceLabel: string
  humanEvidence: string
  traditionalEvidence: string
  mechanisticEvidence: string
  safetyTier: AlkaloidSafetyTier
  safetyLabel: string
  safetySummary: string
  labelChecks: string[]
  internalLinks: Array<{ label: string; href: string }>
  references: number[]
}

export const ALKALOID_DIRECTORY: AlkaloidDirectoryEntry[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    identity: 'Caffeine from coffee, tea, guarana, kola nut, or yerba maté—or isolated caffeine',
    alkaloids: 'Caffeine',
    classification: 'Methylxanthine (purine alkaloid)',
    formats: ['botanical', 'isolated'],
    evidenceBand: 'human',
    evidenceLabel: 'Substantial human evidence',
    humanEvidence:
      'Acute alertness and performance effects are well studied in people. Evidence for weight loss or broad “metabolism” promises is much less useful and often comes from multi-ingredient products.',
    traditionalEvidence:
      'Caffeinated plants have long food and beverage histories, but that does not make concentrated extracts equivalent to tea or coffee.',
    mechanisticEvidence:
      'Adenosine-receptor antagonism explains stimulation; tolerance, sleep timing, total daily exposure, and stimulant stacking shape the practical risk.',
    safetyTier: 'standard',
    safetyLabel: 'Dose and stacking matter',
    safetySummary:
      'Check the total caffeine from every source. Extra caution is warranted with anxiety, sleep disruption, pregnancy, cardiovascular sensitivity, and other stimulants.',
    labelChecks: ['Exact caffeine amount per serving', 'All botanical caffeine sources disclosed', 'No stimulant blend hiding the total dose'],
    internalLinks: [
      { label: 'Caffeine profile', href: '/compounds/caffeine/' },
      { label: 'Caffeine vs. L-theanine', href: '/guides/compare/caffeine-vs-l-theanine/' },
    ],
    references: [4],
  },
  {
    id: 'berberine',
    name: 'Berberine',
    identity: 'An isolated constituent found in barberry, goldenseal, Oregon grape, and related plants',
    alkaloids: 'Berberine',
    classification: 'Isoquinoline alkaloid',
    formats: ['isolated', 'botanical'],
    evidenceBand: 'human',
    evidenceLabel: 'Human evidence, interaction-heavy',
    humanEvidence:
      'Human trials and reviews report changes in some glucose and lipid markers, but study quality and populations vary. This is not evidence that berberine replaces prescribed treatment.',
    traditionalEvidence:
      'Berberine-containing plants have histories in several medical traditions; modern isolated products are a different exposure from traditional preparations.',
    mechanisticEvidence:
      'Multiple metabolic enzymes, transporters, and signaling pathways have been studied. The same breadth helps explain why medication interactions deserve prominent attention.',
    safetyTier: 'interaction',
    safetyLabel: 'Interaction caution',
    safetySummary:
      'Medication review is important. Avoid during pregnancy, breastfeeding, and infancy; gastrointestinal effects are common in clinical use.',
    labelChecks: ['Chemical form stated clearly', 'Amount per serving is visible', 'No “natural GLP-1” or medication-replacement positioning'],
    internalLinks: [
      { label: 'Berberine profile', href: '/compounds/berberine/' },
      { label: 'Berberine evidence guide', href: '/guides/other/berberine-weight-loss/' },
    ],
    references: [13],
  },
  {
    id: 'theobromine',
    name: 'Theobromine',
    identity: 'A constituent of cacao; also used as an isolated ingredient in some formulas',
    alkaloids: 'Theobromine',
    classification: 'Methylxanthine (purine alkaloid)',
    formats: ['botanical', 'isolated'],
    evidenceBand: 'limited',
    evidenceLabel: 'Limited use-specific human evidence',
    humanEvidence:
      'Human exposure through cacao is familiar, but that does not establish a benefit for concentrated standalone products or multi-ingredient “energy” formulas.',
    traditionalEvidence:
      'Cacao has a long food and ceremonial history. Historical use should not be used as a dose or efficacy claim for extracts.',
    mechanisticEvidence:
      'Theobromine is pharmacologically related to caffeine but has a different stimulant and cardiovascular profile.',
    safetyTier: 'standard',
    safetyLabel: 'Concentration matters',
    safetySummary:
      'Concentrated products should not be treated like ordinary chocolate. Check for added caffeine and consider cardiovascular or sleep sensitivity.',
    labelChecks: ['Theobromine amount stated', 'Added caffeine separated from the total', 'No proprietary “energy matrix”'],
    internalLinks: [{ label: 'Supplement stacking safety', href: '/guides/other/supplement-stacking-safety/' }],
    references: [2, 4],
  },
  {
    id: 'california-poppy',
    name: 'California poppy',
    identity: 'Eschscholzia californica aerial parts—not Papaver somniferum',
    alkaloids: 'Protopine and related isoquinoline alkaloids',
    classification: 'Botanical source of isoquinoline alkaloids',
    formats: ['botanical'],
    evidenceBand: 'traditional',
    evidenceLabel: 'Traditional use; limited clinical evidence',
    humanEvidence:
      'Clinical evidence is too limited to make confident sleep, anxiety, pain, or withdrawal claims.',
    traditionalEvidence:
      'European herbal assessments recognize a history of traditional use, which is not the same as strong clinical proof.',
    mechanisticEvidence:
      'Alkaloid and sedative-pathway findings are largely preclinical and do not establish an opioid-like effect in people.',
    safetyTier: 'interaction',
    safetyLabel: 'Sedative-interaction caution',
    safetySummary:
      'Do not confuse this plant with opium poppy. Avoid stacking sedating botanicals with alcohol, sleep medicines, or other central nervous system depressants without clinical guidance.',
    labelChecks: ['Botanical name: Eschscholzia californica', 'Aerial plant part identified', 'No “herbal opioid” or withdrawal positioning'],
    internalLinks: [
      { label: 'Sleep supplement guide', href: '/guides/other/sleep-supplements-guide/' },
      { label: 'Site safety checker', href: '/safety-checker/' },
    ],
    references: [9, 10],
  },
  {
    id: 'blue-lotus',
    name: 'Blue lotus',
    identity: 'Nymphaea caerulea—not sacred lotus (Nelumbo nucifera)',
    alkaloids: 'Nuciferine and related aporphine alkaloids',
    classification: 'Aporphine alkaloids in a botanical product',
    formats: ['botanical'],
    evidenceBand: 'traditional',
    evidenceLabel: 'Mostly traditional, chemical, and case-report evidence',
    humanEvidence:
      'There are no robust human trials supporting general wellness, sleep, or withdrawal uses. Published clinical literature includes a small toxicity case series rather than efficacy evidence.',
    traditionalEvidence:
      'Historical and ritual associations are often repeated online, but they do not establish modern product identity, dose, or clinical benefit.',
    mechanisticEvidence:
      'Receptor findings and constituent chemistry are hypothesis-generating; they do not predict a reliable effect from an unverified extract.',
    safetyTier: 'higher',
    safetyLabel: 'Higher caution',
    safetySummary:
      'Sedation and perceptual disturbances have been reported. Reject vaping, smoking, “legal high,” extreme-extract, or kratom/7-OH substitution positioning.',
    labelChecks: ['Botanical name: Nymphaea caerulea', 'Plant part and extraction ratio disclosed', 'Identity and contaminant COA available'],
    internalLinks: [{ label: 'Psychedelic-adjacent herb safety guide', href: '/guides/other/psychedelic-adjacent-herbs/' }],
    references: [8],
  },
  {
    id: 'huperzine-a',
    name: 'Huperzine A',
    identity: 'An isolated Lycopodium alkaloid associated with Huperzia serrata',
    alkaloids: 'Huperzine A',
    classification: 'Lycopodium alkaloid; acetylcholinesterase inhibitor',
    formats: ['isolated'],
    evidenceBand: 'limited',
    evidenceLabel: 'Clinical-context evidence; uncertain general use',
    humanEvidence:
      'Trials and reviews mostly concern dementia-related clinical contexts. Reviews flag heterogeneous, low-quality primary studies, so they do not support casual memory-enhancement claims for healthy shoppers.',
    traditionalEvidence:
      'Traditional plant use does not map cleanly onto a measured isolated compound.',
    mechanisticEvidence:
      'Acetylcholinesterase inhibition is pharmacologically meaningful and makes cholinergic stacking a safety issue, not a reason to assume cognitive benefit.',
    safetyTier: 'higher',
    safetyLabel: 'Higher caution',
    safetySummary:
      'Avoid self-directed stacking with other cholinergic ingredients or medicines. Pregnancy, heart-rate concerns, and medication use call for clinician review.',
    labelChecks: ['Huperzine A amount shown in micrograms', 'No hidden cholinergic blend', 'No disease-treatment or “limitless” claims'],
    internalLinks: [
      { label: 'Nootropic stacking guide', href: '/guides/other/nootropic-stacking-guide/' },
      { label: 'Site safety checker', href: '/safety-checker/' },
    ],
    references: [7],
  },
  {
    id: 'bitter-orange',
    name: 'Bitter orange',
    identity: 'Citrus aurantium fruit or extract',
    alkaloids: 'p-Synephrine and related protoalkaloids',
    classification: 'Protoalkaloid / sympathomimetic amine (classification varies)',
    formats: ['botanical', 'isolated'],
    evidenceBand: 'limited',
    evidenceLabel: 'Small, confounded human studies',
    humanEvidence:
      'Weight-loss studies are generally small, short, and frequently use multi-ingredient formulas, making benefit and safety difficult to attribute to bitter orange.',
    traditionalEvidence:
      'Traditional citrus use is not evidence for concentrated stimulant-style extracts.',
    mechanisticEvidence:
      'Adrenergic activity raises practical questions about heart rate, blood pressure, and combination with caffeine or other stimulants.',
    safetyTier: 'higher',
    safetyLabel: 'Higher caution',
    safetySummary:
      'Reject stimulant stacks, especially products that obscure caffeine or make rapid weight-loss claims. Cardiovascular conditions and medication use require clinician review.',
    labelChecks: ['Citrus aurantium and plant part identified', 'p-Synephrine amount and standardization visible', 'Total caffeine disclosed'],
    internalLinks: [
      { label: 'Stimulant-free focus guide', href: '/guides/focus/focus-without-caffeine-crash/' },
      { label: 'Supplement stacking safety', href: '/guides/other/supplement-stacking-safety/' },
    ],
    references: [4, 5],
  },
  {
    id: 'yohimbe',
    name: 'Yohimbe',
    identity: 'Pausinystalia yohimbe bark or a yohimbine-standardized extract',
    alkaloids: 'Yohimbine and related indole alkaloids',
    classification: 'Indole alkaloids in a botanical stimulant',
    formats: ['botanical', 'isolated'],
    evidenceBand: 'limited',
    evidenceLabel: 'Little supplement efficacy evidence; documented risk',
    humanEvidence:
      'NCCIH reports very little research in people on yohimbe supplements and insufficient evidence for health uses. Product analyses have also found major yohimbine-label variability.',
    traditionalEvidence:
      'Traditional use does not resolve modern extract potency, adulteration, or medication-interaction concerns.',
    mechanisticEvidence:
      'Adrenergic effects are consistent with anxiety, blood-pressure, heart-rate, and stimulant-stacking concerns.',
    safetyTier: 'higher',
    safetyLabel: 'Higher caution',
    safetySummary:
      'Associated risks include blood-pressure problems, arrhythmia, heart attack, and seizures. Avoid sexual-enhancement, rapid-fat-loss, and stimulant-stack positioning.',
    labelChecks: ['Botanical identity and bark stated', 'Yohimbine amount verified independently', 'No proprietary sexual-enhancement blend'],
    internalLinks: [
      { label: 'Serotonin and MAOI safety context', href: '/learn/serotonin-syndrome-supplements/' },
      { label: 'Site safety checker', href: '/safety-checker/' },
    ],
    references: [6, 15],
  },
  {
    id: 'corydalis',
    name: 'Corydalis',
    identity: 'Corydalis yanhusuo rhizome; species and plant part are essential',
    alkaloids: 'Tetrahydropalmatine and related isoquinoline alkaloids',
    classification: 'Isoquinoline alkaloids in a traditional botanical',
    formats: ['botanical'],
    evidenceBand: 'traditional',
    evidenceLabel: 'Traditional and preclinical evidence dominate',
    humanEvidence:
      'Human evidence is not strong enough for confident pain, sleep, or withdrawal recommendations. A recent product analysis found large alkaloid variability and a possible enriched/adulterated sample.',
    traditionalEvidence:
      'Corydalis rhizome has traditional use in Chinese medicine; that history does not validate an unidentified powder or unusually concentrated extract.',
    mechanisticEvidence:
      'Dopamine and other receptor findings are preclinical and should not be translated into opioid-substitution or analgesic promises.',
    safetyTier: 'higher',
    safetyLabel: 'Higher caution',
    safetySummary:
      'Reject products without species, rhizome identity, alkaloid testing, and contaminant testing. Avoid sedative stacking and self-treatment positioning.',
    labelChecks: ['Species: Corydalis yanhusuo', 'Rhizome identified', 'Alkaloid profile and contaminant COA available'],
    internalLinks: [
      { label: 'Corydalis profile', href: '/herbs/corydalis/' },
      { label: 'Site safety checker', href: '/safety-checker/' },
    ],
    references: [11],
  },
  {
    id: 'cats-claw',
    name: 'Cat’s claw',
    identity: 'Uncaria tomentosa or Uncaria guianensis—not similarly named herbs',
    alkaloids: 'Pentacyclic and tetracyclic oxindole alkaloids',
    classification: 'Oxindole alkaloids in a botanical product',
    formats: ['botanical'],
    evidenceBand: 'limited',
    evidenceLabel: 'Very limited high-quality human evidence',
    humanEvidence:
      'NCCIH finds no conclusive human evidence for a health purpose. There is no reliable human evidence supporting cat’s claw as a kratom or 7-OH withdrawal aid.',
    traditionalEvidence:
      'Amazonian traditional use is culturally important context, but it is not proof for modern disease, pain, or withdrawal claims.',
    mechanisticEvidence:
      'Immune and inflammatory findings do not establish a clinically meaningful outcome and may matter for autoimmune or medication safety.',
    safetyTier: 'interaction',
    safetyLabel: 'Interaction caution',
    safetySummary:
      'Use extra caution with autoimmune disease, pregnancy, anticoagulant or antiplatelet drugs, blood-pressure drugs, and surgery.',
    labelChecks: ['Uncaria species named', 'Bark or root plant part identified', 'No withdrawal, detox, or immune-disease claims'],
    internalLinks: [
      { label: 'Evidence-methodology guide', href: '/info/methodology/' },
      { label: 'Site safety checker', href: '/safety-checker/' },
    ],
    references: [12],
  },
]

export const HIGHER_CAUTION_IDS = [
  'blue-lotus',
  'huperzine-a',
  'bitter-orange',
  'yohimbe',
  'corydalis',
] as const
export const COMMONLY_MISTAKEN_FOR_ALKALOIDS = [
  {
    name: 'L-theanine',
    classification: 'A non-protein amino acid found in tea—not an alkaloid.',
    href: '/compounds/l-theanine/',
  },
  {
    name: 'L-tyrosine',
    classification: 'An amino acid—not an alkaloid.',
  },
  {
    name: '5-HTP',
    classification: 'An amino-acid derivative and serotonin precursor—not an alkaloid.',
  },
  {
    name: 'Taurine',
    classification: 'An amino sulfonic acid—not an alkaloid.',
  },
] as const

export const PRODUCT_SCREENING_CRITERIA = [
  {
    title: 'Botanical identity',
    detail: 'Require the full Latin binomial; reject common-name-only labels where plants can be confused.',
  },
  {
    title: 'Plant part',
    detail: 'Bark, rhizome, aerial parts, leaf, seed, and flower are not interchangeable.',
  },
  {
    title: 'Standardization',
    detail: 'The named marker, percentage, and actual amount per serving should all be visible.',
  },
  {
    title: 'Supplement Facts',
    detail: 'Every active ingredient and amount should be readable before purchase.',
  },
  {
    title: 'Responsible manufacturer',
    detail: 'Look for a traceable company, lot number, contact path, and manufacturing-quality information.',
  },
  {
    title: 'COA and testing',
    detail: 'Prefer lot-specific identity, potency, heavy-metal, microbial, and adulterant testing from an independent laboratory.',
  },
  {
    title: 'No opaque blends',
    detail: 'Reject proprietary blends that hide the amount of the alkaloid source or accompanying stimulants and sedatives.',
  },
  {
    title: 'No high-risk positioning',
    detail: 'Reject vaping, smoking, “legal high,” detox, withdrawal-substitute, rapid-weight-loss, or drug-like marketing.',
  },
] as const
