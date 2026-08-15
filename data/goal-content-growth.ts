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
  energy: {
    faqItems: [
      {
        question: 'How should fatigue and energy supplements be compared?',
        answer:
          'Separate immediate alertness, exercise performance, fatigue outcomes, and longer-term metabolic or mitochondrial markers. They are different intents and should not be collapsed into one generic “energy” claim.',
      },
      {
        question: 'Does feeling stimulating mean an ingredient has stronger fatigue evidence?',
        answer:
          'No. Subjective stimulation and clinically measured fatigue are different outcomes. Compare the endpoint used in human studies, the duration, and the population before treating a faster sensation as stronger evidence.',
      },
      {
        question: 'Why does timing matter for energy-oriented products?',
        answer:
          'Timing can affect tolerability, sleep, and how an intervention is evaluated. Use the canonical timing record when it exists rather than inferring a schedule from stimulant or mechanism labels.',
      },
      {
        question: 'What should I check before comparing two energy options?',
        answer:
          'Compare human evidence, the exact fatigue or performance endpoint, studied dose, formulation, interaction burden, and whether the expected time course matches the outcome being researched.',
      },
    ],
    dosingNotes: [
      { compound: 'Caffeine', note: 'Use the canonical timing and dose record; do not let “more stimulating” substitute for a better evidence fit.' },
      { compound: 'Rhodiola', note: 'Match any dose discussion to the studied extract and fatigue/stress population.' },
      { compound: 'CoQ10', note: 'Keep formulation and population differences visible when interpreting dose or absorption information.' },
    ],
    evidenceRows: [
      { compound: 'Caffeine', evidence: 'See canonical profile', humanData: 'Alertness and performance outcomes', limitation: 'Alertness is not the same endpoint as chronic fatigue' },
      { compound: 'Rhodiola', evidence: 'See canonical profile', humanData: 'Fatigue/stress outcomes', limitation: 'Study populations and extracts vary' },
      { compound: 'CoQ10', evidence: 'See canonical profile', humanData: 'Population-specific human outcomes', limitation: 'Do not generalize mitochondrial mechanisms into universal energy benefit' },
      { compound: 'Panax Ginseng', evidence: 'See canonical profile', humanData: 'Fatigue and vitality research', limitation: 'Extract and population differences matter' },
    ],
    safetyBullets: [
      'Keep wakefulness, exercise performance, fatigue, and metabolic outcomes separate.',
      'Check sleep disruption, cardiovascular context, and interaction data before treating stimulation as a benefit.',
      'Use explicit human outcomes rather than mechanism language to rank energy-oriented options.',
    ],
  },
}
