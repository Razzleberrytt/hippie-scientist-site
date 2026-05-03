export type BestPageConfig = {
  slug: string
  title: string
  description: string
  compoundCandidates: string[]
}

export const bestPages: BestPageConfig[] = [
  { slug: 'sleep', title: 'Best Supplements for Sleep', description: 'Sleep support options ranked by usefulness.', compoundCandidates: ['melatonin','magnesium','l-theanine','glycine'] },
  { slug: 'stress', title: 'Best Supplements for Stress', description: 'Calm + stress support options.', compoundCandidates: ['ashwagandha','rhodiola-rosea','l-theanine','magnesium'] },
  { slug: 'focus', title: 'Best Supplements for Focus', description: 'Attention and cognitive support.', compoundCandidates: ['caffeine','l-tyrosine','alpha-gpc','citicoline'] },
  { slug: 'fat-loss', title: 'Best Supplements for Fat Loss', description: 'Metabolic + appetite support.', compoundCandidates: ['caffeine','green-tea-extract','capsaicin','berberine'] },
  { slug: 'energy', title: 'Best Supplements for Energy', description: 'Energy + performance support.', compoundCandidates: ['caffeine','creatine','rhodiola-rosea','tyrosine'] },
  { slug: 'gut-health', title: 'Best Supplements for Gut Health', description: 'Digestion and microbiome support.', compoundCandidates: ['psyllium-husk','berberine','magnesium'] },

  { slug: 'anxiety', title: 'Best Supplements for Anxiety', description: 'Calming compounds for anxiety.', compoundCandidates: ['l-theanine','ashwagandha','magnesium','glycine'] },
  { slug: 'muscle', title: 'Best Supplements for Muscle Growth', description: 'Muscle and strength support.', compoundCandidates: ['creatine','protein','beta-alanine'] },
  { slug: 'testosterone', title: 'Best Supplements for Testosterone', description: 'Hormonal support options.', compoundCandidates: ['ashwagandha','zinc','vitamin-d'] },
  { slug: 'blood-pressure', title: 'Best Supplements for Blood Pressure', description: 'Cardiovascular support.', compoundCandidates: ['magnesium','potassium','omega-3'] },
  { slug: 'inflammation', title: 'Best Supplements for Inflammation', description: 'Anti-inflammatory compounds.', compoundCandidates: ['curcumin','omega-3','resveratrol'] },
  { slug: 'memory', title: 'Best Supplements for Memory', description: 'Memory and cognition.', compoundCandidates: ['bacopa-monnieri','citicoline','alpha-gpc'] }
]
