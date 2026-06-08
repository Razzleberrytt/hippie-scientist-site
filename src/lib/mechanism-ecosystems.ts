export type MechanismEcosystem = {
  slug: string
  title: string
  summary: string
  pathways: string[]
  compounds: string[]
  comparePages: string[]
  bestPages: string[]
  stacks: string[]
  explorationPrompts: string[]
}

export const mechanismEcosystems: MechanismEcosystem[] = [
  {
    slug: 'gaba-ecosystem',
    title: 'GABA Ecosystem',
    summary: 'A calming and inhibitory-signaling ecosystem focused on relaxation pathways, sleep continuity, nervous-system downshifting, and overstimulation support context.',
    pathways: ['gaba', 'sleep', 'stress-response', 'relaxation'],
    compounds: ['l-theanine', 'taurine', 'magnesium-glycinate', 'glycine', 'apigenin', 'valerian'],
    comparePages: ['l-theanine-vs-taurine', 'magnesium-vs-melatonin'],
    bestPages: ['sleep', 'non-melatonin-sleep', 'falling-asleep', 'overstimulation'],
    stacks: ['sleep-recovery-stack', 'stress-resilience-stack'],
    explorationPrompts: [
      'Explore calming pathways without heavy sedation framing.',
      'Compare neurotransmitter-balancing compounds for nighttime recovery.',
      'Continue into stress-resilience and relaxation ecosystems.',
    ],
  },
  {
    slug: 'dopamine-ecosystem',
    title: 'Dopamine Ecosystem',
    summary: 'A motivation and cognitive-energy ecosystem centered around focus continuity, reward signaling, stimulation balance, and stress-related performance context.',
    pathways: ['dopamine', 'motivation', 'focus', 'cognitive-energy'],
    compounds: ['l-tyrosine', 'caffeine', 'citicoline', 'rhodiola-rosea', 'creatine'],
    comparePages: ['caffeine-vs-theanine', 'alpha-gpc-vs-citicoline'],
    bestPages: ['focus', 'motivation', 'productivity', 'brain-fog'],
    stacks: ['calm-focus-stack', 'brain-fog-stack'],
    explorationPrompts: [
      'Compare stimulation versus calm-focus support pathways.',
      'Explore cognitive-energy ecosystems and fatigue resistance.',
      'Continue into cholinergic and mitochondrial support systems.',
    ],
  },
  {
    slug: 'acetylcholine-ecosystem',
    title: 'Acetylcholine Ecosystem',
    summary: 'A cognition-oriented ecosystem focused on cholinergic signaling, memory continuity, attention systems, and learning-related pathway exploration.',
    pathways: ['acetylcholine', 'memory', 'cognition', 'focus'],
    compounds: ['alpha-gpc', 'citicoline', 'bacopa-monnieri', 'huperzine-a'],
    comparePages: ['alpha-gpc-vs-citicoline', 'bacopa-vs-lions-mane'],
    bestPages: ['memory', 'focus', 'brain-fog', 'calm-focus'],
    stacks: ['calm-focus-stack', 'brain-fog-stack'],
    explorationPrompts: [
      'Explore cholinergic compounds for cognition continuity.',
      'Compare memory-support ecosystems and focus pathways.',
      'Continue into mitochondrial and dopamine-adjacent systems.',
    ],
  },
  {
    slug: 'neuroinflammation-ecosystem',
    title: 'Neuroinflammation Ecosystem',
    summary: 'A recovery and oxidative-stress ecosystem focused on inflammation signaling, cognitive fatigue pathways, antioxidant systems, and recovery continuity.',
    pathways: ['neuroinflammation', 'oxidative-stress', 'recovery', 'inflammation'],
    compounds: ['curcumin', 'nac', 'omega-3', 'resveratrol', 'quercetin'],
    comparePages: ['curcumin-vs-boswellia', 'nac-vs-glutathione'],
    bestPages: ['oxidative-stress', 'inflammation', 'recovery'],
    stacks: ['recovery-stack', 'brain-fog-stack'],
    explorationPrompts: [
      'Compare antioxidant and inflammatory-signaling ecosystems.',
      'Explore cognitive fatigue and recovery continuity pathways.',
      'Continue into mitochondrial and stress-response ecosystems.',
    ],
  },
  {
    slug: 'mitochondrial-ecosystem',
    title: 'Mitochondrial Ecosystem',
    summary: 'A cellular-energy ecosystem focused on mitochondrial support, fatigue pathways, redox systems, and metabolic continuity.',
    pathways: ['mitochondrial', 'cellular-energy', 'fatigue', 'redox'],
    compounds: ['coq10', 'pqq', 'creatine', 'acetyl-l-carnitine', 'nmn', 'nr'],
    comparePages: ['coq10-vs-pqq', 'nmn-vs-nr'],
    bestPages: ['mitochondrial-support', 'energy', 'healthy-aging'],
    stacks: ['mitochondrial-energy-stack', 'recovery-stack'],
    explorationPrompts: [
      'Explore mitochondrial and cellular-energy support ecosystems.',
      'Compare NAD+ and redox-system continuity pathways.',
      'Continue into recovery and cognitive-energy ecosystems.',
    ],
  },
  {
    slug: 'stress-response-ecosystem',
    title: 'Stress-Response Ecosystem',
    summary: 'An adaptogenic resilience ecosystem focused on stress adaptation, fatigue resistance, calming continuity, and nervous-system balance.',
    pathways: ['stress-response', 'adaptogens', 'fatigue-resilience', 'calm'],
    compounds: ['ashwagandha', 'rhodiola-rosea', 'holy-basil', 'eleuthero'],
    comparePages: ['ashwagandha-vs-rhodiola', 'ashwagandha-vs-magnesium'],
    bestPages: ['stress', 'adaptogens', 'overstimulation'],
    stacks: ['stress-resilience-stack', 'sleep-recovery-stack'],
    explorationPrompts: [
      'Explore adaptogenic ecosystems for stress resilience.',
      'Compare calming versus energizing stress-support pathways.',
      'Continue into sleep continuity and dopamine ecosystems.',
    ],
  },
]
