export type StackEcosystemItem = {
  compound_slug: string
  compound?: string
  role: 'anchor' | 'amplifier' | 'support'
  rationale: string
}

export type StackEcosystem = {
  slug: string
  title: string
  goal: string
  goal_slug: string
  summary: string
  primary_effect: string
  time_to_effect: string
  evidence_level: string
  stack: StackEcosystemItem[]
}

export const supplementalStackEcosystems: StackEcosystem[] = [
  {
    slug: 'sleep-recovery-stack',
    title: 'Sleep Recovery Stack',
    goal: 'Sleep Recovery',
    goal_slug: 'sleep-recovery',
    summary: 'A cautious sleep-support stack organized around relaxation, sleep continuity, recovery, and next-day tolerability rather than heavy sedation.',
    primary_effect: 'Relaxation, sleep quality, and nighttime recovery support',
    time_to_effect: 'Same night to 2 weeks depending on component and routine consistency',
    evidence_level: 'Mixed to moderate, component-dependent',
    stack: [
      { compound_slug: 'magnesium-glycinate', compound: 'Magnesium Glycinate', role: 'anchor', rationale: 'Mineral-based relaxation and deficiency-context support.' },
      { compound_slug: 'glycine', compound: 'Glycine', role: 'amplifier', rationale: 'Sleep quality and body-temperature-related nighttime support context.' },
      { compound_slug: 'l-theanine', compound: 'L-Theanine', role: 'support', rationale: 'Calming support without direct sleep-timing framing.' },
      { compound_slug: 'apigenin', compound: 'Apigenin', role: 'support', rationale: 'Exploratory calming and sleep-adjacent pathway context.' },
    ],
  },
  {
    slug: 'calm-focus-stack',
    title: 'Calm Focus Stack',
    goal: 'Calm Focus',
    goal_slug: 'calm-focus',
    summary: 'A focus stack built around alertness balance, stimulation smoothing, and cholinergic context rather than maximum stimulation.',
    primary_effect: 'Calm alertness and focus support',
    time_to_effect: '30–90 minutes for acute components; longer for adaptational components',
    evidence_level: 'Mixed to moderate, component-dependent',
    stack: [
      { compound_slug: 'caffeine', compound: 'Caffeine', role: 'anchor', rationale: 'Direct alertness signal with clear stimulation considerations.' },
      { compound_slug: 'l-theanine', compound: 'L-Theanine', role: 'amplifier', rationale: 'Commonly paired with caffeine to smooth stimulation and support calmer focus.' },
      { compound_slug: 'citicoline', compound: 'Citicoline', role: 'support', rationale: 'Cholinergic support context for attention and cognitive energy.' },
      { compound_slug: 'alpha-gpc', compound: 'Alpha-GPC', role: 'support', rationale: 'Alternative cholinergic support option often compared with citicoline.' },
    ],
  },
  {
    slug: 'stress-resilience-stack',
    title: 'Stress Resilience Stack',
    goal: 'Stress Resilience',
    goal_slug: 'stress-resilience',
    summary: 'A stress-support stack organized around adaptogenic context, calming support, and resilience pathways without implying treatment of anxiety or mood disorders.',
    primary_effect: 'Stress adaptation and calm resilience support',
    time_to_effect: 'Acute to 8 weeks depending on adaptogen and outcome',
    evidence_level: 'Mixed to moderate, component-dependent',
    stack: [
      { compound_slug: 'ashwagandha', compound: 'Ashwagandha', role: 'anchor', rationale: 'Adaptogen-style stress and sleep-adjacent support context.' },
      { compound_slug: 'rhodiola-rosea', compound: 'Rhodiola', role: 'amplifier', rationale: 'Fatigue and stress-resilience context with a more energizing profile.' },
      { compound_slug: 'magnesium', compound: 'Magnesium', role: 'support', rationale: 'Foundational mineral support and relaxation context.' },
      { compound_slug: 'holy-basil', compound: 'Holy Basil', role: 'support', rationale: 'Traditional adaptogen-style calming ecosystem context.' },
    ],
  },
  {
    slug: 'mitochondrial-energy-stack',
    title: 'Mitochondrial Energy Stack',
    goal: 'Mitochondrial Energy',
    goal_slug: 'mitochondrial-energy',
    summary: 'A mitochondrial ecosystem stack focused on cellular energy, redox context, and fatigue-related pathway exploration.',
    primary_effect: 'Cellular energy and mitochondrial pathway support',
    time_to_effect: '1–8 weeks depending on component and baseline status',
    evidence_level: 'Mixed, component-dependent',
    stack: [
      { compound_slug: 'coenzyme-q10', compound: 'CoQ10', role: 'anchor', rationale: 'Mitochondrial electron transport and oxidative stress context.' },
      { compound_slug: 'pqq', compound: 'PQQ', role: 'amplifier', rationale: 'Mitochondrial signaling and redox-adjacent exploratory context.' },
      { compound_slug: 'acetyl-l-carnitine', compound: 'Acetyl-L-Carnitine', role: 'support', rationale: 'Fatty-acid transport and cognitive-energy context.' },
      { compound_slug: 'creatine', compound: 'Creatine', role: 'support', rationale: 'Cellular energy buffering and performance context.' },
    ],
  },
  {
    slug: 'recovery-stack',
    title: 'Recovery Stack',
    goal: 'Recovery',
    goal_slug: 'recovery',
    summary: 'A recovery-oriented stack connecting training output, connective tissue context, inflammatory signaling, and mineral support.',
    primary_effect: 'Training recovery and routine consistency support',
    time_to_effect: 'Days to 8 weeks depending on training status and component',
    evidence_level: 'Mixed to moderate, component-dependent',
    stack: [
      { compound_slug: 'creatine', compound: 'Creatine', role: 'anchor', rationale: 'Performance and repeated-output support context.' },
      { compound_slug: 'collagen', compound: 'Collagen', role: 'support', rationale: 'Connective tissue and joint-support routine context.' },
      { compound_slug: 'omega-3', compound: 'Omega-3', role: 'support', rationale: 'Inflammatory signaling and recovery ecosystem context.' },
      { compound_slug: 'magnesium', compound: 'Magnesium', role: 'support', rationale: 'Muscle, mineral, and relaxation context.' },
    ],
  },
  {
    slug: 'brain-fog-stack',
    title: 'Brain Fog Stack',
    goal: 'Brain Fog',
    goal_slug: 'brain-fog',
    summary: 'A cognition-oriented stack for focus, mental fatigue, and cognitive-energy exploration while preserving caution around causes of brain fog.',
    primary_effect: 'Cognitive energy and focus support',
    time_to_effect: 'Acute to 12 weeks depending on component',
    evidence_level: 'Mixed, component-dependent',
    stack: [
      { compound_slug: 'citicoline', compound: 'Citicoline', role: 'anchor', rationale: 'Cholinergic and cognitive-energy support context.' },
      { compound_slug: 'l-tyrosine', compound: 'L-Tyrosine', role: 'amplifier', rationale: 'Stress-related cognitive demand and catecholamine precursor context.' },
      { compound_slug: 'acetyl-l-carnitine', compound: 'Acetyl-L-Carnitine', role: 'support', rationale: 'Mitochondrial and cognitive-energy pathway context.' },
      { compound_slug: 'lions-mane', compound: 'Lion’s Mane', role: 'support', rationale: 'Longer-term neurotrophic and cognition-adjacent ecosystem context.' },
    ],
  },
]

export function mergeStackEcosystems(runtimeStacks: any[]) {
  const existing = new Set(runtimeStacks.map((stack) => stack?.slug).filter(Boolean))
  return [
    ...runtimeStacks,
    ...supplementalStackEcosystems.filter((stack) => !existing.has(stack.slug)),
  ]
}
