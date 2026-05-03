export type BestPageConfig = {
  slug: string
  title: string
  description: string
  compoundCandidates: string[]
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
  { slug: 'recovery', title: 'Best Supplements for Recovery', description: 'Recovery-support options for training, soreness, and routine consistency.', compoundCandidates: ['creatine','protein','collagen','magnesium','omega-3','curcumin'] }
]
