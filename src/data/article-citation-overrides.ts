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
}

export const articleCitationOverrides: Record<string, ArticleCitationOverride> = {
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
