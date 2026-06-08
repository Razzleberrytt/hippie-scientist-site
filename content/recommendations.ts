import { AFFILIATE_TAGS } from '@/config/affiliate'

export type RecommendationGoal =
  | 'sleep'
  | 'stress'
  | 'focus'
  | 'brain-fog'
  | 'fatigue'
  | 'overthinking'

export type RecommendationConfidence = 'strong' | 'moderate' | 'limited' | 'insufficient'

export type SourcingPath = {
  id: string
  label: string
  description: string
  href: string
  affiliate?: boolean
  merchant?: string
  notes?: string
}

export type RecommendationItem = {
  id: string
  name: string
  goal: RecommendationGoal
  rankLabel?: string
  evidenceLevel: RecommendationConfidence
  bestFor: string
  avoidIf: string
  safetyNote: string
  practicalNote: string
  sourcingPaths: SourcingPath[]
}

const amazonSearch = (query: string): string =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAGS.amazon}`

const profilePath = (kind: 'compound' | 'herb', slug: string): SourcingPath => ({
  id: `${slug}-profile`,
  label: 'Read profile',
  description: 'Review evidence, mechanisms, and safety context before buying.',
  href: `/${kind === 'compound' ? 'compounds' : 'herbs'}/${slug}`,
})

const amazonPath = (id: string, query: string): SourcingPath => ({
  id: `${id}-amazon-search`,
  label: 'Compare products',
  description:
    'Search-based affiliate link. Replace with owner-approved product URLs before treating this as a curated pick.',
  href: amazonSearch(query),
  affiliate: true,
  merchant: 'Amazon',
  notes: 'Search URL placeholder for product-specific replacement.',
})

export const recommendations: RecommendationItem[] = [
  {
    id: 'sleep-magnesium',
    name: 'Magnesium',
    goal: 'sleep',
    rankLabel: 'Steady baseline option',
    evidenceLevel: 'moderate',
    bestFor: 'People comparing gentle evening support, muscle tension context, or low-risk sleep routines.',
    avoidIf: 'You have kidney disease, significant digestive sensitivity, or use medications that require mineral spacing.',
    safetyNote: 'Magnesium can interact with absorption of some medications and can cause loose stools depending on form and dose.',
    practicalNote: 'Glycinate or bisglycinate forms are often chosen for evening use; check elemental magnesium on the label.',
    sourcingPaths: [profilePath('compound', 'magnesium'), amazonPath('magnesium', 'magnesium glycinate supplement')],
  },
  {
    id: 'sleep-theanine',
    name: 'L-theanine',
    goal: 'sleep',
    rankLabel: 'Calm without heavy sedation',
    evidenceLevel: 'moderate',
    bestFor: 'Wind-down support when the issue is mental tension rather than strong sedation.',
    avoidIf: 'You are very sensitive to calming supplements or combining several sedating products.',
    safetyNote: 'Use extra caution with sedatives, alcohol, or medications that affect alertness.',
    practicalNote: 'Often used earlier in the evening rather than as a knockout sleep aid.',
    sourcingPaths: [profilePath('compound', 'l-theanine'), amazonPath('l-theanine', 'L-theanine 200 mg supplement')],
  },
  {
    id: 'sleep-glycine',
    name: 'Glycine',
    goal: 'sleep',
    rankLabel: 'Evening routine support',
    evidenceLevel: 'limited',
    bestFor: 'People comparing simple amino-acid options for sleep-quality routines.',
    avoidIf: 'You need a highly targeted option for a diagnosed sleep disorder.',
    safetyNote: 'Discuss use with a clinician if pregnant, nursing, or managing a medical condition.',
    practicalNote: 'Powder formats are common; taste and serving size matter for adherence.',
    sourcingPaths: [profilePath('compound', 'glycine'), amazonPath('glycine', 'glycine powder supplement')],
  },
  {
    id: 'sleep-lemon-balm',
    name: 'Lemon balm',
    goal: 'sleep',
    rankLabel: 'Botanical calming support',
    evidenceLevel: 'limited',
    bestFor: 'Evening calm and gentle wind-down routines.',
    avoidIf: 'You are combining multiple sedating herbs, alcohol, or sedative medication.',
    safetyNote: 'Pregnancy, nursing, thyroid conditions, and medication use deserve clinician review.',
    practicalNote: 'Tea, tincture, and capsule forms differ meaningfully in dose consistency.',
    sourcingPaths: [profilePath('herb', 'lemon-balm'), amazonPath('lemon-balm', 'lemon balm supplement')],
  },
  {
    id: 'stress-theanine',
    name: 'L-theanine',
    goal: 'stress',
    rankLabel: 'Situational calm',
    evidenceLevel: 'moderate',
    bestFor: 'Stress that feels like tension, overstimulation, or caffeine edge.',
    avoidIf: 'You need urgent mental health support or are stacking multiple calming substances.',
    safetyNote: 'Do not use supplements as a replacement for appropriate mental health care.',
    practicalNote: 'Works best as a narrow tool, not a complete stress plan.',
    sourcingPaths: [profilePath('compound', 'l-theanine'), amazonPath('stress-theanine', 'L-theanine supplement')],
  },
  {
    id: 'stress-ashwagandha',
    name: 'Ashwagandha',
    goal: 'stress',
    rankLabel: 'Adaptogen-style option',
    evidenceLevel: 'moderate',
    bestFor: 'People comparing all-day stress-load support rather than acute sedation.',
    avoidIf: 'Pregnant, nursing, thyroid-sensitive, autoimmune-sensitive, or using sedatives unless cleared by a clinician.',
    safetyNote: 'Rare liver safety reports and endocrine context make fit important.',
    practicalNote: 'Standardized extracts differ; avoid assuming all ashwagandha products are equivalent.',
    sourcingPaths: [profilePath('herb', 'ashwagandha'), amazonPath('ashwagandha', 'ashwagandha KSM-66 supplement')],
  },
  {
    id: 'stress-magnesium',
    name: 'Magnesium',
    goal: 'stress',
    rankLabel: 'Baseline mineral support',
    evidenceLevel: 'limited',
    bestFor: 'People with stress-linked tension or poor baseline intake.',
    avoidIf: 'Kidney disease, mineral-sensitive medication schedules, or significant GI intolerance.',
    safetyNote: 'Medication spacing can matter for thyroid medication, antibiotics, and some bone-health drugs.',
    practicalNote: 'Best framed as foundational support, not an acute stress treatment.',
    sourcingPaths: [profilePath('compound', 'magnesium'), amazonPath('stress-magnesium', 'magnesium glycinate supplement')],
  },
  {
    id: 'stress-rhodiola',
    name: 'Rhodiola',
    goal: 'stress',
    rankLabel: 'Stimulating adaptogen',
    evidenceLevel: 'limited',
    bestFor: 'Stress-linked fatigue where a more activating profile is acceptable.',
    avoidIf: 'Anxiety sensitivity, bipolar-spectrum history, insomnia, or stimulant-heavy routines.',
    safetyNote: 'Rhodiola may feel stimulating for some people and should not be stacked casually with stimulants.',
    practicalNote: 'Often better earlier in the day than near bedtime.',
    sourcingPaths: [profilePath('herb', 'rhodiola-rosea'), amazonPath('rhodiola', 'Rhodiola rosea supplement')],
  },
  {
    id: 'focus-caffeine-theanine',
    name: 'Caffeine + L-theanine',
    goal: 'focus',
    rankLabel: 'Fastest practical option',
    evidenceLevel: 'strong',
    bestFor: 'Short-term alertness where caffeine is tolerated and jitters are the limiting factor.',
    avoidIf: 'Anxiety sensitivity, high caffeine intake, insomnia, heart rhythm concerns, or stimulant medication use.',
    safetyNote: 'Track total caffeine load from coffee, tea, energy drinks, pre-workout, and capsules.',
    practicalNote: 'The theanine portion may smooth caffeine edge for some users but does not make high caffeine intake risk-free.',
    sourcingPaths: [profilePath('compound', 'l-theanine'), amazonPath('caffeine-theanine', 'caffeine L-theanine supplement')],
  },
  {
    id: 'focus-citicoline',
    name: 'Citicoline / CDP-choline',
    goal: 'focus',
    rankLabel: 'Cholinergic support',
    evidenceLevel: 'moderate',
    bestFor: 'People comparing non-caffeine cognitive-support options.',
    avoidIf: 'You are sensitive to cholinergic supplements, headaches, or medication interactions.',
    safetyNote: 'Discuss use if taking neurological or psychiatric medications.',
    practicalNote: 'Start by comparing citicoline against alpha-GPC and plain choline rather than treating them as identical.',
    sourcingPaths: [profilePath('compound', 'citicoline'), amazonPath('citicoline', 'citicoline CDP choline supplement')],
  },
  {
    id: 'focus-rhodiola',
    name: 'Rhodiola',
    goal: 'focus',
    rankLabel: 'Stress-fatigue crossover',
    evidenceLevel: 'limited',
    bestFor: 'Focus dips that track with fatigue or stress load.',
    avoidIf: 'Stimulant sensitivity, insomnia, anxiety spikes, or bipolar-spectrum history.',
    safetyNote: 'Avoid casual stacking with high caffeine or stimulant medication.',
    practicalNote: 'More useful as a pattern-matched option than a universal nootropic.',
    sourcingPaths: [profilePath('herb', 'rhodiola-rosea'), amazonPath('focus-rhodiola', 'Rhodiola rosea supplement')],
  },
  {
    id: 'focus-tyrosine',
    name: 'Tyrosine',
    goal: 'focus',
    rankLabel: 'Demand-context option',
    evidenceLevel: 'limited',
    bestFor: 'Acute cognitive demand, sleep restriction contexts, or stress-linked performance dips.',
    avoidIf: 'Thyroid disease, MAOI use, stimulant stacking, or blood pressure concerns unless cleared.',
    safetyNote: 'Medication and thyroid context are important.',
    practicalNote: 'Not a daily cure-all; context matters more than hype.',
    sourcingPaths: [profilePath('compound', 'l-tyrosine'), amazonPath('tyrosine', 'L-tyrosine supplement')],
  },
  {
    id: 'brain-fog-citicoline',
    name: 'Citicoline / CDP-choline',
    goal: 'brain-fog',
    rankLabel: 'Cholinergic clarity support',
    evidenceLevel: 'moderate',
    bestFor: 'Comparing non-stimulant cognitive support when brain fog is not medically unexplained or severe.',
    avoidIf: 'Brain fog is new, severe, worsening, or accompanied by neurological symptoms.',
    safetyNote: 'Brain fog can come from sleep loss, anemia, thyroid issues, medication effects, sleep apnea, and other causes.',
    practicalNote: 'Use as a comparison point after checking obvious root-cause patterns.',
    sourcingPaths: [profilePath('compound', 'citicoline'), amazonPath('brain-fog-citicoline', 'citicoline CDP choline supplement')],
  },
  {
    id: 'brain-fog-alcar',
    name: 'Acetyl-L-carnitine',
    goal: 'brain-fog',
    rankLabel: 'Mitochondrial-support category',
    evidenceLevel: 'limited',
    bestFor: 'People comparing energy-metabolism-oriented cognitive support.',
    avoidIf: 'You have seizure history, bipolar-spectrum history, or take anticoagulants unless cleared.',
    safetyNote: 'Medical context matters when fatigue and cognition symptoms overlap.',
    practicalNote: 'Often evaluated alongside sleep quality, nutrition, and medication review.',
    sourcingPaths: [profilePath('compound', 'acetyl-l-carnitine'), amazonPath('alcar', 'acetyl L carnitine supplement')],
  },
  {
    id: 'brain-fog-creatine',
    name: 'Creatine',
    goal: 'brain-fog',
    rankLabel: 'Energy-system support',
    evidenceLevel: 'moderate',
    bestFor: 'Baseline cognitive-energy support, especially when diet or high demand may matter.',
    avoidIf: 'Kidney disease or clinician-advised creatine restriction.',
    safetyNote: 'Discuss persistent brain fog with a qualified clinician rather than self-treating indefinitely.',
    practicalNote: 'Plain creatine monohydrate is the reference form for most buyers.',
    sourcingPaths: [profilePath('compound', 'creatine'), amazonPath('creatine', 'creatine monohydrate supplement')],
  },
  {
    id: 'brain-fog-b-vitamins',
    name: 'B vitamins',
    goal: 'brain-fog',
    rankLabel: 'Deficiency-context option',
    evidenceLevel: 'limited',
    bestFor: 'People with dietary gaps, low intake, or clinician-confirmed deficiency risk.',
    avoidIf: 'You assume more B vitamins are better without checking dose or need.',
    safetyNote: 'High-dose B6 can be inappropriate long term; deficiency testing may matter.',
    practicalNote: 'Most useful when tied to intake, labs, or clinician guidance.',
    sourcingPaths: [profilePath('compound', 'vitamin-b6'), amazonPath('b-vitamins', 'B complex supplement')],
  },
  {
    id: 'fatigue-rhodiola',
    name: 'Rhodiola',
    goal: 'fatigue',
    rankLabel: 'Stress-linked fatigue option',
    evidenceLevel: 'limited',
    bestFor: 'Fatigue patterns that overlap with stress load and low drive.',
    avoidIf: 'Stimulant sensitivity, insomnia, anxiety spikes, or bipolar-spectrum history.',
    safetyNote: 'Persistent fatigue should be evaluated, especially when new, severe, or unexplained.',
    practicalNote: 'Use earlier in the day and avoid piling it onto high caffeine routines.',
    sourcingPaths: [profilePath('herb', 'rhodiola-rosea'), amazonPath('fatigue-rhodiola', 'Rhodiola rosea supplement')],
  },
  {
    id: 'fatigue-tyrosine',
    name: 'Tyrosine',
    goal: 'fatigue',
    rankLabel: 'Acute demand support',
    evidenceLevel: 'limited',
    bestFor: 'Short-term demanding days, especially where stress and cognitive load are high.',
    avoidIf: 'Thyroid disease, MAOI use, stimulant stacking, or blood pressure concerns unless cleared.',
    safetyNote: 'Fatigue can reflect sleep, anemia, thyroid issues, infection, medication effects, and other medical causes.',
    practicalNote: 'Use as a targeted tool, not as a substitute for evaluation.',
    sourcingPaths: [profilePath('compound', 'l-tyrosine'), amazonPath('fatigue-tyrosine', 'L-tyrosine supplement')],
  },
  {
    id: 'fatigue-creatine',
    name: 'Creatine',
    goal: 'fatigue',
    rankLabel: 'Baseline energy-system support',
    evidenceLevel: 'moderate',
    bestFor: 'People comparing low-stimulation support for training, cognition, or dietary context.',
    avoidIf: 'Kidney disease or clinician-advised restriction.',
    safetyNote: 'Hydration, dose, and medical context matter.',
    practicalNote: 'Creatine monohydrate is the simplest comparison benchmark.',
    sourcingPaths: [profilePath('compound', 'creatine'), amazonPath('fatigue-creatine', 'creatine monohydrate supplement')],
  },
  {
    id: 'fatigue-coq10',
    name: 'CoQ10',
    goal: 'fatigue',
    rankLabel: 'Mitochondrial-support category',
    evidenceLevel: 'limited',
    bestFor: 'People exploring energy metabolism support, especially in older-adult or medication-context discussions.',
    avoidIf: 'You take anticoagulants or have complex medication regimens without clinician input.',
    safetyNote: 'CoQ10 can be relevant to medication context, so do not treat it as universally neutral.',
    practicalNote: 'Ubiquinone and ubiquinol differ in price and positioning.',
    sourcingPaths: [profilePath('compound', 'coq10'), amazonPath('coq10', 'CoQ10 supplement')],
  },
  {
    id: 'fatigue-iron',
    name: 'Iron',
    goal: 'fatigue',
    rankLabel: 'Only when deficiency is plausible',
    evidenceLevel: 'strong',
    bestFor: 'Clinician-confirmed deficiency or clear deficiency-risk workups.',
    avoidIf: 'You have not confirmed need through appropriate testing or clinician guidance.',
    safetyNote: 'Iron can be harmful when unnecessary and should not be used casually for fatigue.',
    practicalNote: 'This is a testing-and-guidance category, not a general energy supplement.',
    sourcingPaths: [profilePath('compound', 'iron'), amazonPath('iron', 'iron supplement')],
  },
  {
    id: 'overthinking-theanine',
    name: 'L-theanine',
    goal: 'overthinking',
    rankLabel: 'Gentle calm support',
    evidenceLevel: 'moderate',
    bestFor: 'Racing-thought or overstimulation contexts where heavy sedation is not desired.',
    avoidIf: 'You need treatment for anxiety, OCD, or another clinical condition rather than general support.',
    safetyNote: 'Do not use supplements to avoid needed mental health care.',
    practicalNote: 'Useful as a calm-focus comparison point, especially around caffeine sensitivity.',
    sourcingPaths: [profilePath('compound', 'l-theanine'), amazonPath('overthinking-theanine', 'L-theanine supplement')],
  },
  {
    id: 'overthinking-lemon-balm',
    name: 'Lemon balm',
    goal: 'overthinking',
    rankLabel: 'Evening calming botanical',
    evidenceLevel: 'limited',
    bestFor: 'Wind-down routines when overthinking is tied to evening tension.',
    avoidIf: 'Sedative combinations, alcohol use, pregnancy, nursing, or thyroid complexity without clinician review.',
    safetyNote: 'Combining calming herbs can increase impairment or next-day sluggishness.',
    practicalNote: 'Tea can be a low-commitment starting format; extracts need more dose scrutiny.',
    sourcingPaths: [profilePath('herb', 'lemon-balm'), amazonPath('overthinking-lemon-balm', 'lemon balm supplement')],
  },
  {
    id: 'overthinking-magnesium',
    name: 'Magnesium',
    goal: 'overthinking',
    rankLabel: 'Tension-support baseline',
    evidenceLevel: 'limited',
    bestFor: 'People whose mental tension overlaps with body tension or poor sleep routines.',
    avoidIf: 'Kidney disease, significant GI sensitivity, or medication spacing concerns.',
    safetyNote: 'Minerals can interfere with medication absorption.',
    practicalNote: 'Pick form and dose carefully; more is not automatically better.',
    sourcingPaths: [profilePath('compound', 'magnesium'), amazonPath('overthinking-magnesium', 'magnesium glycinate supplement')],
  },
  {
    id: 'overthinking-ashwagandha',
    name: 'Ashwagandha',
    goal: 'overthinking',
    rankLabel: 'Stress-load support',
    evidenceLevel: 'moderate',
    bestFor: 'Stress-load patterns where calming support is part of a broader routine.',
    avoidIf: 'Pregnant, nursing, thyroid-sensitive, autoimmune-sensitive, or using sedatives unless cleared.',
    safetyNote: 'Ashwagandha is not a casual fit for everyone despite popularity.',
    practicalNote: 'Compare standardized extracts and avoid stacking with multiple calming products at once.',
    sourcingPaths: [profilePath('herb', 'ashwagandha'), amazonPath('overthinking-ashwagandha', 'ashwagandha supplement')],
  },
]

export function getRecommendationsForGoal(
  goal: RecommendationGoal,
  limit?: number
): RecommendationItem[] {
  const matches = recommendations.filter((item) => item.goal === goal)
  return typeof limit === 'number' ? matches.slice(0, limit) : matches
}
