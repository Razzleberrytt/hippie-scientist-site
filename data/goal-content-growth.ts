import type { GoalContentExtension } from './goal-content'

export const growthGoalContentBySlug: Record<string, GoalContentExtension> = {
  cognition: {
    faqItems: [
      {
        question: 'How should cognition supplements be compared?',
        answer:
          'Compare the exact human outcome being measured, the study population, the formulation, the study duration, and the safety record. Attention, memory, learning, and broad “brain health” language should not be treated as interchangeable outcomes.',
      },
      {
        question: 'Why separate mechanism from human cognitive outcomes?',
        answer:
          'A plausible biological mechanism can explain why an ingredient is worth studying, but it does not by itself establish a meaningful human benefit. The comparison path keeps mechanistic findings visibly separate from clinical outcome evidence.',
      },
      {
        question: 'Why does formulation matter in cognition research?',
        answer:
          'Extracts, chemical forms, and preparation methods can differ substantially. Evidence from one studied preparation should not automatically be transferred to every product carrying the same ingredient name.',
      },
      {
        question: 'What should I check before comparing a cognition stack?',
        answer:
          'Review each ingredient independently for human evidence, studied dose, duration, formulation, interactions, and safety. A larger stack should not be assumed to have stronger evidence than its individual components.',
      },
    ],
    dosingNotes: [
      { compound: 'Bacopa', note: 'Use the canonical profile to match any dose discussion to the studied extract and study duration.' },
      { compound: 'Lion’s Mane', note: 'Keep fruiting-body, mycelium, and extraction differences explicit instead of assuming dose equivalence.' },
      { compound: 'Citicoline / Alpha-GPC', note: 'Treat each choline source as a separate evidence record rather than transferring dose claims between them.' },
    ],
    evidenceRows: [
      { compound: 'Bacopa', evidence: 'See canonical profile', humanData: 'Outcome-specific human evidence', limitation: 'Extract, duration, and population differences matter' },
      { compound: 'Lion’s Mane', evidence: 'See canonical profile', humanData: 'Human and mechanistic evidence kept separate', limitation: 'Mechanism does not substitute for clinical outcomes' },
      { compound: 'Citicoline', evidence: 'See canonical profile', humanData: 'Population-specific human evidence', limitation: 'Do not generalize across all populations or outcomes' },
      { compound: 'Alpha-GPC', evidence: 'See canonical profile', humanData: 'Population-specific human evidence', limitation: 'Keep population and endpoint limits visible' },
    ],
    safetyBullets: [
      'Keep cognition claims outcome-specific: attention, memory, learning, and cognitive decline are separate endpoints.',
      'Review the canonical interaction and safety record before combining multiple cognition-oriented products.',
      'Keep mechanistic findings separate from demonstrated human outcomes throughout the decision path.',
    ],
  },
}
