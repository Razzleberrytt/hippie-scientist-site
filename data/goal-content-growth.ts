import type { GoalContentExtension } from './goal-content'

export const growthGoalContentBySlug: Record<string, GoalContentExtension> = {
  cognition: {
    faqItems: [
      {
        question: 'Which supplements have human evidence for memory or cognition?',
        answer:
          'The useful distinction is outcome-specific evidence rather than a generic “brain health” label. Bacopa is usually researched over weeks for memory and learning outcomes, while citicoline or Alpha-GPC are choline-related options with different populations, endpoints, and evidence depth. Lion’s mane has substantial mechanistic interest, but mechanism should not be treated as equivalent to replicated human cognitive benefit.',
      },
      {
        question: 'Bacopa vs lion’s mane — which has stronger cognition evidence?',
        answer:
          'Use the head-to-head comparison to inspect human evidence, studied dose, formulation, and safety side by side. The site keeps neurotrophic or mechanistic findings separate from clinical cognitive outcomes so a plausible mechanism does not automatically become a benefit claim.',
      },
      {
        question: 'Do cognition supplements work immediately?',
        answer:
          'Not necessarily. Some compounds are studied for acute attention-related effects, while others are evaluated over repeated use for memory or learning outcomes. Match the expected time course to the specific outcome and studied formulation rather than assuming every cognitive supplement should feel immediate.',
      },
      {
        question: 'Can I combine several nootropics for better results?',
        answer:
          'A larger stack does not automatically have stronger evidence. Combining products can also add interaction, tolerability, and attribution problems, so the safer research path is to evaluate each ingredient’s evidence and safety record before considering combinations.',
      },
    ],
    dosingNotes: [
      { compound: 'Bacopa', note: 'Interpret dose only in the context of the standardized extract and duration used in the supporting human trials.' },
      { compound: 'Lion’s Mane', note: 'Do not generalize dose across fruiting-body, mycelium, or differently extracted products unless the evidence supports equivalence.' },
      { compound: 'Citicoline / Alpha-GPC', note: 'Treat each choline source as a separate intervention; dose and outcome data should not be transferred automatically between them.' },
    ],
    evidenceRows: [
      { compound: 'Bacopa', evidence: 'Moderate, outcome-dependent', humanData: 'Repeated-use cognitive trials', limitation: 'Extract, duration, and population differences matter' },
      { compound: 'Lion’s Mane', evidence: 'Emerging / limited', humanData: 'Smaller human cognition studies', limitation: 'Mechanistic evidence is stronger than the clinical evidence base' },
      { compound: 'Citicoline', evidence: 'Limited to moderate by population', humanData: 'Human cognition and attention studies', limitation: 'Do not generalize across all ages or cognitive states' },
      { compound: 'Alpha-GPC', evidence: 'Context-dependent', humanData: 'Human studies in selected populations', limitation: 'Evidence in healthy young adults is less established' },
    ],
    safetyBullets: [
      'Keep cognition claims outcome-specific: attention, memory, learning, and cognitive decline are not interchangeable endpoints.',
      'Review medication interactions and cholinergic load before combining multiple cognition-oriented products.',
      'Mechanistic findings such as neurotrophic signaling should remain visibly separate from demonstrated human benefit.',
    ],
  },
}
