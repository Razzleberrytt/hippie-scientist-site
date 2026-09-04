export type ArticleCitationOverride = {
  relatedSlugs?: string[]
  keyTakeaways?: string[]
  citationQuestions?: string[]
  canonicalConcepts?: string[]
}

export type CitationRelationshipTarget = {
  slug: string
  title: string
  category: string
  url: string
}

export const citationRelationshipTargets: Record<string, CitationRelationshipTarget> = {
  rhabdomyolysis: {
    slug: 'rhabdomyolysis',
    title: 'Rhabdomyolysis: How Muscle Breakdown Can Injure the Kidneys',
    category: 'Foundations',
    url: '/learn/rhabdomyolysis/',
  },
  'kratom-7oh-withdrawal-management': {
    slug: 'kratom-7oh-withdrawal-management',
    title: '7-OH Withdrawal: What the 2026 Evidence Actually Shows',
    category: 'Harm Reduction',
    url: '/guides/other/kratom-7oh-withdrawal-management/',
  },
}

export const articleCitationOverrides: Record<string, ArticleCitationOverride> = {
  'sleep-debt-and-recovery': {
    relatedSlugs: [
      'how-much-sleep-do-adults-need',
      'weekend-catch-up-sleep',
      'daytime-sleepiness-vs-fatigue',
      'insomnia-vs-sleep-deprivation',
      'sleep-inertia-grogginess-after-waking',
    ],
    canonicalConcepts: [
      'sleep debt',
      'recovery sleep',
      'sleep restriction',
      'weekend catch-up sleep',
      'vigilance',
      'executive function',
    ],
  },
  'daytime-sleepiness-vs-fatigue': {
    relatedSlugs: [
      'hypersomnolence-vs-insufficient-sleep',
      'sleep-debt-and-recovery',
      'snoring-vs-sleep-apnea',
      'home-sleep-apnea-test-vs-polysomnography',
      'medications-and-sleep',
    ],
    canonicalConcepts: [
      'excessive daytime sleepiness',
      'fatigue',
      'microsleep',
      'sleep propensity',
      'driving impairment',
      'sleep-disordered breathing',
    ],
  },
  'sleep-bruxism-and-sleep-apnea': {
    relatedSlugs: [
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'cpap-vs-oral-appliance-for-sleep-apnea',
      'home-sleep-apnea-test-vs-polysomnography',
      'why-sleep-studies-disagree',
    ],
    canonicalConcepts: [
      'sleep bruxism',
      'obstructive sleep apnea',
      'rhythmic masticatory muscle activity',
      'polysomnography',
      'dental sleep medicine',
      'autonomic arousal',
    ],
  },
  'hypersomnolence-vs-insufficient-sleep': {
    relatedSlugs: [
      'daytime-sleepiness-vs-fatigue',
      'sleep-debt-and-recovery',
      'how-much-sleep-do-adults-need',
      'snoring-vs-sleep-apnea',
      'sleep-paralysis',
    ],
    canonicalConcepts: [
      'central disorders of hypersomnolence',
      'narcolepsy',
      'idiopathic hypersomnia',
      'multiple sleep latency test',
      'actigraphy',
      'insufficient sleep',
      'orexin',
    ],
  },
  'sleep-apnea-in-women': {
    relatedSlugs: [
      'home-sleep-apnea-test-vs-polysomnography',
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'menopause-and-sleep',
      'daytime-sleepiness-vs-fatigue',
    ],
    canonicalConcepts: [
      'obstructive sleep apnea in women',
      'REM-predominant obstructive sleep apnea',
      'menopause',
      'home sleep apnea testing',
      'polysomnography',
      'OSA screening',
    ],
  },
  'cpap-vs-oral-appliance-for-sleep-apnea': {
    relatedSlugs: [
      'home-sleep-apnea-test-vs-polysomnography',
      'snoring-vs-sleep-apnea',
      'sleep-position-osa-and-reflux',
      'nasal-obstruction-and-sleep-apnea',
      'sleep-apnea-in-women',
    ],
    canonicalConcepts: [
      'continuous positive airway pressure',
      'mandibular advancement device',
      'oral appliance therapy',
      'obstructive sleep apnea treatment',
      'treatment adherence',
      'residual apnea-hypopnea index',
    ],
  },
  'home-sleep-apnea-test-vs-polysomnography': {
    relatedSlugs: [
      'sleep-apnea-in-women',
      'snoring-vs-sleep-apnea',
      'sleep-apnea-vs-insomnia',
      'cpap-vs-oral-appliance-for-sleep-apnea',
      'sleep-trackers-accuracy',
    ],
    canonicalConcepts: [
      'home sleep apnea testing',
      'polysomnography',
      'respiratory event index',
      'apnea-hypopnea index',
      'night-to-night variability',
      'REM sleep',
      'sleep staging',
    ],
  },
  'corynoxine-b-opioid-addiction-evidence-review': {
    relatedSlugs: [
      'mitragynine',
      '7-hydroxymitragynine',
      'mitragynine-pseudoindoxyl',
      'kratom-7oh-withdrawal-management',
    ],
    keyTakeaways: [
      'Corynoxine B has meaningful in-vitro mu-opioid receptor activity in newer assays, but the exact potency and signaling profile remain assay-dependent.',
      'Mu-opioid receptor activity is a safety signal, not proof that corynoxine B causes addiction, physical dependence, withdrawal, or clinically significant opioid effects in humans.',
      'Human pharmacokinetic, toxicological, abuse-liability, and controlled clinical data for isolated corynoxine B remain major evidence gaps.',
    ],
    citationQuestions: [
      'Does corynoxine B activate the mu-opioid receptor?',
      'Is corynoxine B addictive or dependence-forming?',
      'Can corynoxine B treat opioid withdrawal or substance-use disorder?',
    ],
    canonicalConcepts: [
      'corynoxine B',
      'mu-opioid receptor',
      'G-protein bias',
      'physical dependence',
      'kratom alkaloids',
    ],
  },
  'failure-chains-injected-mushroom-tea': {
    relatedSlugs: [
      'rhabdomyolysis',
      'failure-chains-mptp-parkinsonism',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-25b-nbome-blotter',
    ],
    keyTakeaways: [
      'Intravenous injection bypasses barriers that normally limit exposure to microbes and particulate biological material.',
      'Blood-culture growth does not mean mushrooms physically fruited inside the bloodstream.',
      'A case report can establish that an event occurred, but it cannot estimate how often similar behavior produces the same outcome.',
    ],
    citationQuestions: [
      'Can injected mushroom tea cause bloodstream infection?',
      'Did mushrooms literally grow inside the patient’s blood?',
      'Why is intravenous exposure to nonsterile biological material dangerous?',
    ],
    canonicalConcepts: ['fungemia', 'bacteremia', 'sepsis', 'intravenous exposure', 'route of administration'],
  },
  'failure-chains-mptp-parkinsonism': {
    relatedSlugs: [
      'failure-chains-injected-mushroom-tea',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-25b-nbome-blotter',
    ],
    keyTakeaways: [
      'MPTP is converted to MPP+, which can selectively injure dopamine-producing neurons in the substantia nigra.',
      'Removing the drug does not reverse neuronal loss that has already occurred.',
      'The MPTP syndrome became a research model for Parkinsonian neurodegeneration without proving that ordinary Parkinson’s disease has the same cause.',
    ],
    citationQuestions: [
      'How did an illicit opioid batch produce permanent parkinsonism?',
      'Why does MPTP preferentially damage dopamine neurons?',
      'Does MPTP explain ordinary Parkinson’s disease?',
    ],
    canonicalConcepts: ['MPTP', 'MPP+', 'dopamine neurons', 'substantia nigra', 'parkinsonism'],
  },
  'failure-chains-oklahoma-bromo-dragonfly': {
    relatedSlugs: [
      'failure-chains-25b-nbome-blotter',
      'failure-chains-injected-mushroom-tea',
      'failure-chains-mptp-parkinsonism',
    ],
    keyTakeaways: [
      'Precise measurement cannot compensate for incorrect chemical identity.',
      'A shared preparation can distribute one upstream identity error across an entire group.',
      'Delayed onset reduces the usefulness of subjective feedback and can increase the danger of premature redosing.',
    ],
    citationQuestions: [
      'What caused the 2011 Oklahoma Bromo-DragonFLY poisoning?',
      'Why can precise dosing still fail when a drug is mislabeled?',
      'Why is delayed onset dangerous in potent hallucinogen exposure?',
    ],
    canonicalConcepts: ['Bromo-DragonFLY', 'drug mislabeling', 'vasoconstriction', 'delayed onset', 'seizures'],
  },
  'failure-chains-25b-nbome-blotter': {
    relatedSlugs: [
      'rhabdomyolysis',
      'failure-chains-oklahoma-bromo-dragonfly',
      'failure-chains-injected-mushroom-tea',
      'failure-chains-mptp-parkinsonism',
    ],
    keyTakeaways: [
      'Blotter paper is a delivery format, not proof that a sample contains LSD.',
      'Seizures, respiratory failure, hyperthermia, and muscle breakdown can reinforce one another during severe NBOMe poisoning.',
      'Case reports document possible severe outcomes but cannot determine the percentage of all exposures that become critical.',
    ],
    citationQuestions: [
      'Can blotter sold as LSD contain an NBOMe compound?',
      'How can seizures lead to rhabdomyolysis and acute kidney injury?',
      'Why can’t case reports estimate the frequency of critical NBOMe poisoning?',
    ],
    canonicalConcepts: ['25B-NBOMe', 'blotter', 'seizures', 'rhabdomyolysis', 'acute kidney injury'],
  },
}
