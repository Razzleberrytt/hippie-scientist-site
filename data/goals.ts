export type GoalConfig = {
  slug: string
  title: string
  summary: string
  stackSlugs: string[]
  compoundCandidates: string[]
  comparisonSlugs: string[]
  safetyNote: string
}

export const goalConfigs: GoalConfig[] = [
  {
    slug: 'sleep',
    title: 'Sleep Support',
    summary: 'Start here if you want practical help with winding down, sleep timing, and nighttime supplement decisions.',
    stackSlugs: ['sleep'],
    compoundCandidates: ['melatonin', 'l-theanine', 'theanine', 'magnesium', 'glycine'],
    comparisonSlugs: ['melatonin-vs-l-theanine'],
    safetyNote: 'Sleep supplements can cause next-day grogginess and may interact with sedatives or medical conditions. Review safety notes before use.',
  },
  {
    slug: 'stress',
    title: 'Stress Support',
    summary: 'Compare calming and adaptogen-style options without treating every stress supplement as interchangeable.',
    stackSlugs: ['stress'],
    compoundCandidates: ['ashwagandha', 'l-theanine', 'theanine', 'rhodiola-rosea', 'magnesium'],
    comparisonSlugs: ['melatonin-vs-l-theanine', 'caffeine-vs-theanine'],
    safetyNote: 'Use extra caution with pregnancy, thyroid conditions, sedatives, bipolar history, autoimmune conditions, or medication use.',
  },
  {
    slug: 'focus',
    title: 'Focus & Energy',
    summary: 'Use this path for attention, alertness, mental effort, and cleaner stimulation decisions.',
    stackSlugs: ['cognition'],
    compoundCandidates: ['caffeine', 'l-theanine', 'theanine', 'alpha-gpc', 'citicoline', 'cdp-choline'],
    comparisonSlugs: ['caffeine-vs-theanine'],
    safetyNote: 'Stimulants can worsen anxiety, sleep, blood pressure, or heart-rhythm concerns. Start conservatively and review compound safety notes.',
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss Support',
    summary: 'Focus on simple, evidence-aware support for energy, thermogenesis, appetite, and metabolic context.',
    stackSlugs: ['fat-loss'],
    compoundCandidates: ['caffeine', 'green-tea-extract-egcg', 'capsaicin', 'berberine', 'psyllium-husk'],
    comparisonSlugs: ['berberine-vs-inositol', 'psyllium-vs-plant-sterols'],
    safetyNote: 'Fat-loss supplements are often over-marketed. Avoid stimulant-heavy routines with heart, blood pressure, anxiety, pregnancy, or medication concerns.',
  },
  {
    slug: 'blood-pressure',
    title: 'Blood Pressure Support',
    summary: 'Review cardiovascular-support compounds carefully, with safety and medication context front and center.',
    stackSlugs: [],
    compoundCandidates: ['magnesium', 'psyllium-husk', 'plant-sterols', 'berberine', 'citrulline-malate'],
    comparisonSlugs: ['psyllium-vs-plant-sterols', 'berberine-vs-inositol'],
    safetyNote: 'Do not treat supplement pages as a substitute for blood-pressure care. Medication interactions and monitoring matter here.',
  },
  {
    slug: 'gut-health',
    title: 'Gut Health Support',
    summary: 'Explore fiber, digestion, and gut-adjacent compounds with practical safety context.',
    stackSlugs: [],
    compoundCandidates: ['psyllium-husk', 'glycine', 'berberine', 'magnesium'],
    comparisonSlugs: ['psyllium-vs-plant-sterols'],
    safetyNote: 'Fiber and gut-active supplements can affect digestion and medication absorption. Separate timing when appropriate and review safety notes.',
  },
  {
    slug: 'joint-support',
    title: 'Joint Support',
    summary: 'Compare joint-support options without assuming every mobility supplement has the same evidence strength.',
    stackSlugs: [],
    compoundCandidates: ['glucosamine', 'glucosamine-sulfate', 'chondroitin', 'chondroitin-sulfate', 'curcumin'],
    comparisonSlugs: ['glucosamine-vs-chondroitin'],
    safetyNote: 'Joint-support supplements may still matter for allergies, blood thinners, surgery, diabetes context, or other medications.',
  },
  {
    slug: 'testosterone-support',
    title: 'Testosterone Support',
    summary: 'Use this page to separate cautious evidence from aggressive testosterone-booster marketing.',
    stackSlugs: [],
    compoundCandidates: ['ashwagandha', 'magnesium', 'zinc', 'creatine'],
    comparisonSlugs: ['creatine-vs-whey'],
    safetyNote: 'Be skeptical of testosterone-booster claims. Review evidence, safety notes, and hormone-related medical context before acting.',
  },
]
