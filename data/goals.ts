export type GoalOption = {
  slug: string
  name: string
  bestFor: string
  speed: string
  evidence: string
  risk: string
  avoidIf: string
  whyPeopleStop: string
  form: string
}

export type Goal = {
  slug: string
  title: string
  eyebrow: string
  description: string
  quickPicks: {
    need: string
    option: string
    slug: string
  }[]
  options: GoalOption[]
  relatedGoals: string[]
}

export const goals: Goal[] = [
  {
    slug: 'pain',
    title: 'Pain support decisions',
    eyebrow: 'Goal decision guide',
    description: 'Compare common non-prescription options for everyday pain support based on fit, onset, evidence quality, and risk profile.',
    quickPicks: [
      { need: 'General joint discomfort', option: 'Curcumin', slug: 'curcumin' },
      { need: 'Short-term flare periods', option: 'Boswellia', slug: 'boswellia' },
      { need: 'Sensitive to NSAID-like effects', option: 'PEA', slug: 'pea' },
    ],
    options: [
      { slug: 'curcumin', name: 'Curcumin', bestFor: 'Joint discomfort with inflammatory component', speed: 'Days to weeks', evidence: 'Moderate to strong in osteoarthritis-adjacent pain', risk: 'Low to moderate', avoidIf: 'Gallbladder disease, anticoagulant use, active reflux sensitivity', whyPeopleStop: 'Delayed noticeable effect or GI upset', form: 'Standardized curcuminoid extract with absorption support' },
      { slug: 'boswellia', name: 'Boswellia', bestFor: 'Knee and mobility-related pain', speed: 'Days to 2 weeks', evidence: 'Moderate for pain and function in joint discomfort', risk: 'Low to moderate', avoidIf: 'Pregnancy or known resin sensitivity', whyPeopleStop: 'Cost or inconsistent response across brands', form: 'Boswellia serrata extract (AKBA-standardized)' },
      { slug: 'pea', name: 'PEA (Palmitoylethanolamide)', bestFor: 'Neuropathic-like or persistent discomfort patterns', speed: '2 to 8 weeks', evidence: 'Moderate but heterogeneous by indication', risk: 'Low', avoidIf: 'Use with clinician supervision in complex medication regimens', whyPeopleStop: 'Slow onset and less immediate feedback', form: 'Micronized or ultra-micronized PEA capsules' },
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Tension-related discomfort and poor recovery sleep', speed: 'Days to weeks', evidence: 'Limited to moderate depending on pain subtype', risk: 'Low', avoidIf: 'Advanced kidney disease without clinician clearance', whyPeopleStop: 'Loose stool with dose escalation', form: 'Magnesium glycinate or citrate' },
      { slug: 'omega-3', name: 'Omega-3 (EPA/DHA)', bestFor: 'Systemic soreness with inflammatory lifestyle load', speed: '2 to 8 weeks', evidence: 'Moderate for some chronic pain contexts', risk: 'Low to moderate', avoidIf: 'Bleeding disorders or anticoagulant dose changes without supervision', whyPeopleStop: 'Fishy aftertaste or delayed payoff', form: 'Concentrated fish oil softgels' },
    ],
    relatedGoals: ['inflammation', 'sleep', 'focus'],
  },
  {
    slug: 'inflammation',
    title: 'Inflammation support decisions',
    eyebrow: 'Goal decision guide',
    description: 'Use this page to compare anti-inflammatory options by practical use case, likely onset, and tolerance constraints.',
    quickPicks: [
      { need: 'Joint stiffness and mobility', option: 'Curcumin', slug: 'curcumin' },
      { need: 'Short-course symptom support', option: 'Ginger', slug: 'ginger' },
      { need: 'Lifestyle cardiometabolic support', option: 'Omega-3', slug: 'omega-3' },
    ],
    options: [
      { slug: 'curcumin', name: 'Curcumin', bestFor: 'Broad inflammatory signaling support', speed: '1 to 4 weeks', evidence: 'Moderate to strong in several inflammatory conditions', risk: 'Low to moderate', avoidIf: 'Gallbladder issues, clotting medication adjustments', whyPeopleStop: 'Absorption complexity and product variability', form: 'Phytosome or enhanced-bioavailability curcumin' },
      { slug: 'boswellia', name: 'Boswellia', bestFor: 'Localized inflammatory discomfort', speed: 'Days to 2 weeks', evidence: 'Moderate for functional mobility outcomes', risk: 'Low to moderate', avoidIf: 'Resin hypersensitivity', whyPeopleStop: 'Benefit not obvious without consistent use', form: 'Standardized boswellic acids extract' },
      { slug: 'ginger', name: 'Ginger', bestFor: 'Mild inflammatory and digestive overlap symptoms', speed: 'Hours to days', evidence: 'Limited to moderate by endpoint', risk: 'Low', avoidIf: 'Significant reflux triggers or anticoagulant caution', whyPeopleStop: 'Taste burden or GI warmth sensation', form: 'Ginger extract capsules or tea' },
      { slug: 'omega-3', name: 'Omega-3 (EPA/DHA)', bestFor: 'Longer-term low-grade inflammation support', speed: '2 to 8 weeks', evidence: 'Moderate for inflammatory markers in select populations', risk: 'Low to moderate', avoidIf: 'Peri-procedural periods without clinician review', whyPeopleStop: 'Delayed subjective effects', form: 'High-EPA fish oil formulations' },
      { slug: 'tart-cherry', name: 'Tart Cherry', bestFor: 'Exercise-related soreness and recovery strain', speed: 'Days to 2 weeks', evidence: 'Limited to moderate, strongest in exercise recovery settings', risk: 'Low', avoidIf: 'Sugar-sensitive protocols when using juice concentrates', whyPeopleStop: 'Cost per dose and routine adherence', form: 'Concentrate shots or standardized capsules' },
    ],
    relatedGoals: ['pain', 'sleep', 'focus'],
  },
  {
    slug: 'focus',
    title: 'Focus support decisions',
    eyebrow: 'Goal decision guide',
    description: 'Compare cognitive support options by stimulation profile, onset speed, evidence strength, and common dropout reasons.',
    quickPicks: [
      { need: 'Calm concentration', option: 'L-Theanine', slug: 'l-theanine' },
      { need: 'Stress-heavy workdays', option: 'Rhodiola', slug: 'rhodiola' },
      { need: 'Immediate alertness', option: 'Caffeine', slug: 'caffeine' },
    ],
    options: [
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Calmer attention, often with caffeine', speed: '30 to 90 minutes', evidence: 'Moderate for attention quality and stress buffering', risk: 'Low', avoidIf: 'Very low blood pressure tendency with sedating stacks', whyPeopleStop: 'Subtle effect when used solo', form: 'Capsules, often paired with caffeine' },
      { slug: 'rhodiola', name: 'Rhodiola', bestFor: 'Cognitive fatigue and stress resilience', speed: 'Days to 2 weeks', evidence: 'Limited to moderate with trial variability', risk: 'Low to moderate', avoidIf: 'Bipolar-spectrum risk without medical oversight', whyPeopleStop: 'Can feel overstimulating in sensitive users', form: 'Standardized Rhodiola rosea extract' },
      { slug: 'tyrosine', name: 'Tyrosine', bestFor: 'High-demand periods with sleep debt or acute stress', speed: '30 to 120 minutes', evidence: 'Moderate for performance under stress', risk: 'Low to moderate', avoidIf: 'Thyroid disorders or MAOI use unless supervised', whyPeopleStop: 'Inconsistent everyday benefit', form: 'L-tyrosine powder or capsules' },
      { slug: 'caffeine', name: 'Caffeine', bestFor: 'Fast alertness and reaction speed', speed: '15 to 60 minutes', evidence: 'Strong for vigilance and reaction-time endpoints', risk: 'Moderate', avoidIf: 'Panic-prone profiles, uncontrolled hypertension, late-day use', whyPeopleStop: 'Jitters, sleep disruption, tolerance drift', form: 'Coffee, tea, or measured capsules' },
    ],
    relatedGoals: ['sleep', 'inflammation', 'pain'],
  },
  {
    slug: 'sleep',
    title: 'Sleep support decisions',
    eyebrow: 'Goal decision guide',
    description: 'Evaluate common sleep aids by onset window, expected benefit profile, safety constraints, and adherence friction.',
    quickPicks: [
      { need: 'Sleep-onset difficulty', option: 'Melatonin', slug: 'melatonin' },
      { need: 'Racing mind at bedtime', option: 'L-Theanine', slug: 'l-theanine' },
      { need: 'Nightly relaxation routine', option: 'Magnesium', slug: 'magnesium' },
    ],
    options: [
      { slug: 'magnesium', name: 'Magnesium', bestFor: 'Wind-down support and muscle relaxation', speed: 'Days to 2 weeks', evidence: 'Limited to moderate depending on baseline status', risk: 'Low', avoidIf: 'Renal impairment without clinician guidance', whyPeopleStop: 'GI tolerance at higher doses', form: 'Magnesium glycinate in evening dosing' },
      { slug: 'l-theanine', name: 'L-Theanine', bestFor: 'Pre-sleep cognitive quieting', speed: '30 to 90 minutes', evidence: 'Moderate for relaxation-related sleep quality support', risk: 'Low', avoidIf: 'Concurrent sedative stacking without adjustment', whyPeopleStop: 'Too subtle for severe insomnia', form: 'Capsules or tea-derived supplements' },
      { slug: 'melatonin', name: 'Melatonin', bestFor: 'Sleep timing shift and sleep-onset support', speed: '30 to 60 minutes', evidence: 'Strong for circadian timing, moderate for general insomnia', risk: 'Low to moderate', avoidIf: 'Autoimmune caution or morning grogginess sensitivity', whyPeopleStop: 'Residual drowsiness or vivid dreams', form: 'Low-dose tablets or sublingual forms' },
      { slug: 'lemon-balm', name: 'Lemon Balm', bestFor: 'Mild anxiety-linked restlessness at night', speed: '30 minutes to several days', evidence: 'Limited to moderate, often in combination products', risk: 'Low', avoidIf: 'Sedative polypharmacy without supervision', whyPeopleStop: 'Variable potency across extracts', form: 'Standardized extract capsules or tea' },
    ],
    relatedGoals: ['focus', 'pain', 'inflammation'],
  },
]

export function getGoal(slug: string): Goal | undefined {
  return goals.find((goal) => goal.slug === slug)
}


export type GoalConfig = {
  slug: string
  title: string
  summary: string
  compoundCandidates: string[]
  safetyNote: string
}

export const goalConfigs: GoalConfig[] = goals.map((goal) => ({
  slug: goal.slug,
  title: goal.title,
  summary: goal.description,
  compoundCandidates: goal.options.map((option) => option.slug),
  safetyNote: goal.options.map((option) => option.avoidIf).join('; '),
}))
