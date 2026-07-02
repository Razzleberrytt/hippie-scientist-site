export type BestPageConfig = {
  slug: string
  title: string
  description: string
  compoundCandidates: string[]
}

const bestPageHrefOverrides: Record<string, string> = {
  sleep: '/guides/best-supplements-for-sleep',
  stress: '/guides/best-supplements-for-stress/',
  focus: '/guides/best-supplements-for-focus',
  'fat-loss': '/best-supplements-for-fat-loss',
  'gut-health': '/best-supplements-for-gut-health',
  'joint-support': '/best-supplements-for-joint-support',
  'blood-pressure': '/best-supplements-for-blood-pressure',
  anxiety: '/guides/best-herbs-for-anxiety/',
  adaptogens: '/guides/best-adaptogens-for-stress/',
  'brain-fog': '/guides/supplements-for-brain-fog-and-fatigue',
  'non-melatonin-sleep': '/guides/best-supplements-for-sleep',
  'falling-asleep': '/guides/best-supplements-for-sleep',
  'staying-asleep': '/guides/best-supplements-for-sleep',
  overstimulation: '/guides/best-supplements-for-overthinking',
  energy: '/goals/energy',
  'mitochondrial-support': '/goals/energy',
  'workout-performance': '/goals/energy',
  memory: '/goals/cognition',
  productivity: '/goals/focus',
  motivation: '/goals/focus',
  'calm-focus': '/goals/focus',
  inflammation: '/goals/inflammation',
  'oxidative-stress': '/goals/inflammation',
  muscle: '/goals/recovery',
  recovery: '/goals/recovery',
  testosterone: '/goals/testosterone-support',
  'healthy-aging': '/goals/longevity',
}

export function bestPageHref(slug: string): string {
  return bestPageHrefOverrides[slug] || '/goals'
}

export const bestPages: BestPageConfig[] = [
  { slug: 'sleep', title: 'Best Supplements for Sleep', description: 'Sleep-support options ranked by usefulness, timing, and safety fit.', compoundCandidates: ['melatonin','magnesium','magnesium-glycinate','l-theanine','glycine','apigenin'] },
  { slug: 'stress', title: 'Best Supplements for Stress', description: 'Calm and stress-support options compared by fit, safety, and practical use.', compoundCandidates: ['ashwagandha','rhodiola-rosea','l-theanine','magnesium','holy-basil'] },
  { slug: 'focus', title: 'Best Supplements for Focus', description: 'Attention, alertness, and cognition support with cleaner decision context.', compoundCandidates: ['caffeine','l-tyrosine','alpha-gpc','citicoline','l-theanine','bacopa-monnieri'] },
  { slug: 'fat-loss', title: 'Best Supplements for Fat Loss', description: 'Metabolic, appetite, and energy-support options without overhyped claims.', compoundCandidates: ['caffeine','green-tea-extract','green-tea-extract-egcg','capsaicin','berberine','psyllium-husk'] },
  { slug: 'energy', title: 'Best Supplements for Energy', description: 'Energy and fatigue-support options compared by stimulation level and timing.', compoundCandidates: ['caffeine','creatine','rhodiola-rosea','l-tyrosine','citicoline','acetyl-l-carnitine'] },
  { slug: 'gut-health', title: 'Best Supplements for Gut Health', description: 'Digestion, fiber, and gut-support options that are practical to compare.', compoundCandidates: ['psyllium-husk','berberine','magnesium','glycine','inulin'] },
  { slug: 'anxiety', title: 'Best Supplements for Calm', description: 'Calming options with safety-first context.', compoundCandidates: ['l-theanine','ashwagandha','magnesium','glycine','apigenin'] },
  { slug: 'muscle', title: 'Best Supplements for Muscle Growth', description: 'Muscle, strength, and training-support options with practical defaults.', compoundCandidates: ['creatine','creatine-monohydrate','protein','whey-protein','beta-alanine','collagen'] },
  { slug: 'testosterone', title: 'Best Supplements for Hormone Support', description: 'Hormone-support options framed around evidence, deficiency, and realistic expectations.', compoundCandidates: ['ashwagandha','zinc','vitamin-d','magnesium','tongkat-ali'] },
  { slug: 'blood-pressure', title: 'Best Supplements for Heart Support', description: 'Cardiovascular-support options that require safety and medication context.', compoundCandidates: ['magnesium','potassium','omega-3','fish-oil','beetroot'] },
  { slug: 'inflammation', title: 'Best Supplements for Inflammation Support', description: 'Inflammation and joint-support options compared by mechanism and practical use.', compoundCandidates: ['curcumin','turmeric','omega-3','fish-oil','boswellia','resveratrol'] },
  { slug: 'memory', title: 'Best Supplements for Memory', description: 'Memory and learning-support options with slower-onset cognition context.', compoundCandidates: ['bacopa-monnieri','citicoline','alpha-gpc','lions-mane','huperzine-a'] },
  { slug: 'joint-support', title: 'Best Supplements for Joint Support', description: 'Joint comfort and mobility-support options compared by evidence and routine fit.', compoundCandidates: ['glucosamine','chondroitin','curcumin','boswellia','collagen','omega-3'] },
  { slug: 'brain-fog', title: 'Best Supplements for Brain Fog', description: 'Focus, fatigue, and cognition-support options for clearer thinking decisions.', compoundCandidates: ['citicoline','alpha-gpc','l-tyrosine','acetyl-l-carnitine','bacopa-monnieri','lions-mane'] },
  { slug: 'workout-performance', title: 'Best Supplements for Workout Performance', description: 'Training-output options compared by timing, dose practicality, and use case.', compoundCandidates: ['creatine','beta-alanine','citrulline','citrulline-malate','caffeine','taurine'] },
  { slug: 'calm-focus', title: 'Best Supplements for Calm Focus', description: 'Options that support focus without pushing stimulation too hard.', compoundCandidates: ['l-theanine','caffeine','citicoline','alpha-gpc','bacopa-monnieri','magnesium'] },
  { slug: 'recovery', title: 'Best Supplements for Recovery', description: 'Recovery-support options for training, soreness, and routine consistency.', compoundCandidates: ['creatine','protein','collagen','magnesium','omega-3','curcumin'] },
  { slug: 'mitochondrial-support', title: 'Best Supplements for Mitochondrial Support', description: 'Mitochondrial and cellular-energy options compared by evidence maturity, pathway relevance, and practical routine fit.', compoundCandidates: ['coq10','pqq','acetyl-l-carnitine','creatine','nmn','nr'] },
  { slug: 'oxidative-stress', title: 'Best Supplements for Oxidative Stress', description: 'Antioxidant and redox-support options framed around oxidative stress pathways without implying broad disease treatment claims.', compoundCandidates: ['nac','glutathione','vitamin-c','resveratrol','curcumin','quercetin'] },
  { slug: 'non-melatonin-sleep', title: 'Best Non-Melatonin Sleep Supplements', description: 'Sleep-support options for users comparing calming, relaxation, and recovery pathways without relying on melatonin timing signals.', compoundCandidates: ['magnesium-glycinate','l-theanine','glycine','apigenin','taurine','valerian'] },
  { slug: 'falling-asleep', title: 'Best Supplements for Falling Asleep', description: 'Options commonly explored for sleep latency, calming onset, relaxation context, and nighttime routine fit.', compoundCandidates: ['melatonin','l-theanine','glycine','magnesium-glycinate','apigenin','valerian'] },
  { slug: 'staying-asleep', title: 'Best Supplements for Staying Asleep', description: 'Sleep-continuity options framed around nighttime recovery, relaxation depth, and next-day tolerance considerations.', compoundCandidates: ['magnesium-glycinate','glycine','apigenin','valerian','reishi','taurine'] },
  { slug: 'overstimulation', title: 'Best Supplements for Overstimulation', description: 'Lower-intensity calming options for users comparing stimulation smoothing, relaxation support, and gentle nervous-system context.', compoundCandidates: ['l-theanine','magnesium','taurine','glycine','apigenin','lemon-balm'] },
  { slug: 'adaptogens', title: 'Best Adaptogens for Stress', description: 'Adaptogenic herbs and compounds compared by stress-response context, fatigue fit, calming versus energizing profile, and evidence maturity.', compoundCandidates: ['ashwagandha','rhodiola-rosea','holy-basil','eleuthero','cordyceps','reishi'] },
  { slug: 'productivity', title: 'Best Supplements for Productivity', description: 'Focus and productivity-oriented options compared by alertness, calm-focus balance, cholinergic context, and overstimulation risk.', compoundCandidates: ['caffeine','l-theanine','citicoline','alpha-gpc','l-tyrosine','creatine'] },
  { slug: 'motivation', title: 'Best Supplements for Motivation', description: 'Motivation-adjacent options framed around dopamine, fatigue, stress resilience, and focus context without overclaiming mood effects.', compoundCandidates: ['l-tyrosine','rhodiola-rosea','caffeine','citicoline','creatine','acetyl-l-carnitine'] },
  { slug: 'healthy-aging', title: 'Best Supplements for Healthy Aging', description: 'Healthy-aging and longevity-adjacent options compared by mitochondrial, inflammatory, antioxidant, and metabolic pathway context.', compoundCandidates: ['nmn','nr','coq10','pqq','resveratrol','curcumin'] },
  { slug: 'immune-support', title: 'Best Supplements for Immune Support', description: 'Immune-support options compared by evidence maturity, deficiency relevance, oxidative stress context, and practical safety fit.', compoundCandidates: ['vitamin-d','zinc','vitamin-c','quercetin','nac','reishi'] },
  { slug: 'respiratory-support', title: 'Best Supplements for Respiratory Support', description: 'Respiratory-adjacent options framed around antioxidant, mucus, immune, and inflammation pathways while preserving medical caution.', compoundCandidates: ['nac','quercetin','vitamin-c','omega-3','curcumin','glutathione'] },
  { slug: 'liver-support', title: 'Best Supplements for Liver Support', description: 'Liver-support options compared carefully around antioxidant, detoxification, and safety context without implying treatment claims.', compoundCandidates: ['nac','milk-thistle','glutathione','curcumin','alpha-lipoic-acid','choline'] },
  { slug: 'cholesterol-support', title: 'Best Supplements for Cholesterol Support', description: 'Lipid-support options compared by fiber, absorption, omega-3, and metabolic context with medication-safety awareness.', compoundCandidates: ['psyllium-husk','plant-sterols','omega-3','fish-oil','berberine','niacin'] },
  { slug: 'insulin-sensitivity', title: 'Best Supplements for Insulin Sensitivity', description: 'Metabolic options compared by glucose handling, insulin signaling, fiber context, and evidence maturity.', compoundCandidates: ['berberine','inositol','psyllium-husk','magnesium','alpha-lipoic-acid','cinnamon'] }
]
