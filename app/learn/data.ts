export type LearnPost = {
  slug: string
  title: string
  description: string
  category: string
  readingTime: string
  hero: string
  bestFor: string[]
  keyStack?: { name: string; dose: string; timing: string; note: string }[]
  sections: { heading: string; body: string; bullets?: string[] }[]
  buyingCriteria?: string[]
  safetyNotes?: string[]
  relatedLinks: { label: string; href: string }[]
}

export const learnPosts: LearnPost[] = [
  {
    slug: 'cognitive-stack-that-actually-makes-sense',
    title: 'The Cognitive Stack That Actually Makes Sense',
    description: 'A practical, evidence-aware cognitive stack using Gotu Kola, Bacopa, Lion’s Mane, Ginkgo, Rhodiola, and L-Theanine.',
    category: 'Cognition',
    readingTime: '6 min read',
    hero: 'Most brain stacks online are random. This one is built around clear roles: calm focus, memory, circulation, fatigue resistance, and long-term cognitive support.',
    bestFor: ['Brain fog', 'Studying or deep work', 'Calm focus', 'Long-term memory support'],
    keyStack: [
      { name: 'Rhodiola', dose: '200–400 mg', timing: 'Morning', note: 'Stress-related fatigue and mental performance support.' },
      { name: 'L-Theanine', dose: '200 mg', timing: 'Morning or with caffeine', note: 'Calm focus without heavy sedation.' },
      { name: 'Lion’s Mane', dose: '1,000–1,500 mg', timing: 'Morning', note: 'Long-term neurotrophic support framing.' },
      { name: 'Bacopa', dose: '300 mg', timing: 'Daily', note: 'Memory support that usually builds slowly.' },
      { name: 'Ginkgo', dose: '120 mg', timing: 'Morning', note: 'Circulation and cognition context.' },
      { name: 'Gotu Kola', dose: '300–450 mg', timing: 'Morning', note: 'Calm cognition and microcirculation support.' },
    ],
    sections: [
      {
        heading: 'Why this stack works better than random nootropic blends',
        body: 'The goal is not to throw every “brain supplement” into one pile. Each ingredient should earn its place by covering a different job: stress buffering, calm focus, memory consolidation, circulation, or longer-term neuro-support.',
        bullets: ['Rhodiola and L-Theanine cover faster, day-of mental state support.', 'Bacopa and Gotu Kola are slower-build herbs.', 'Ginkgo and Gotu Kola add a circulation-oriented angle.', 'Lion’s Mane belongs in the long-term support lane, not the instant-focus lane.'],
      },
      {
        heading: 'What to expect',
        body: 'This is not an instant limitless-style stack. The faster pieces are Rhodiola and L-Theanine. Bacopa and Gotu Kola usually need weeks of consistent use before they make sense to judge.',
        bullets: ['Same day: L-Theanine and Rhodiola may be more noticeable.', '4–8+ weeks: Bacopa and Gotu Kola are better judged over time.', 'Avoid adding everything at once if you are sensitive to supplements.'],
      },
    ],
    buyingCriteria: ['Bacopa standardized to bacosides when possible.', 'Gotu Kola standardized to triterpenes when possible.', 'Ginkgo standardized extract is preferred over vague leaf powder.', 'Avoid proprietary blends that hide doses.'],
    safetyNotes: ['Be careful combining Ginkgo with blood-thinning medications.', 'Rhodiola may feel stimulating for some users.', 'Start lower if you are prone to anxiety or sleep disruption.'],
    relatedLinks: [
      { label: 'Browse compounds', href: '/compounds' },
      { label: 'Browse herbs', href: '/herbs' },
      { label: 'Search the database', href: '/search' },
    ],
  },
  {
    slug: 'turmeric-and-ginger-anti-inflammatory-stack',
    title: 'Turmeric + Ginger: The Practical Anti-Inflammatory Stack',
    description: 'How turmeric and ginger fit together for inflammation, digestion, joint comfort, and recovery support.',
    category: 'Inflammation',
    readingTime: '5 min read',
    hero: 'If you only picked two botanicals for an inflammation-focused daily stack, turmeric and ginger are one of the most practical combinations to compare.',
    bestFor: ['Joint comfort', 'Exercise recovery', 'Digestive support', 'Systemic inflammation support'],
    keyStack: [
      { name: 'Turmeric / Curcumin', dose: '500–1,000 mg', timing: 'Morning with food', note: 'Look for standardized curcuminoids and bioavailability support.' },
      { name: 'Ginger', dose: '500–1,000 mg', timing: 'Morning with food', note: 'Digestive, warming, and inflammation-support angle.' },
      { name: 'Holy Basil', dose: '300–500 mg', timing: 'Optional morning add-on', note: 'Adds stress-adaptation context rather than direct pain relief.' },
    ],
    sections: [
      {
        heading: 'Why the pairing makes sense',
        body: 'Turmeric is usually discussed through curcumin and inflammatory signaling pathways. Ginger brings gingerols and shogaols, plus a digestive support angle. Together, they make more sense than a vague “superfood inflammation blend.”',
        bullets: ['Turmeric: curcuminoid-centered anti-inflammatory framing.', 'Ginger: gingerol-centered digestive and inflammatory support.', 'The combination is especially useful for recovery or joint-support content.'],
      },
      {
        heading: 'The big buying mistake',
        body: 'Many turmeric products are underdosed or poorly absorbed. Many ginger products are just generic powder with no standardization. For a serious product comparison, standardization and dose visibility matter.',
      },
    ],
    buyingCriteria: ['Turmeric: look for 95% curcuminoids or a clearly enhanced absorption form.', 'Piperine can improve absorption, but it may also affect medication handling.', 'Ginger: look for standardized gingerols when possible.', 'Avoid pixie-dusted joint blends with hidden amounts.'],
    safetyNotes: ['Use caution with blood thinners, antiplatelets, or surgery timing.', 'Turmeric may be a poor fit for some gallbladder or bile duct issues.', 'Ginger may cause heartburn or GI warming at higher doses.'],
    relatedLinks: [
      { label: 'Turmeric page', href: '/herbs/turmeric' },
      { label: 'Ginger page', href: '/herbs/ginger' },
      { label: 'Browse stacks', href: '/stacks' },
    ],
  },
  {
    slug: 'adaptogens-explained-without-hype',
    title: 'Adaptogens Explained Without the Hype',
    description: 'A grounded comparison of Ashwagandha, Rhodiola, and Holy Basil for stress, fatigue, and recovery support.',
    category: 'Stress',
    readingTime: '5 min read',
    hero: 'Adaptogens are not magic stress shields. The useful question is simpler: which herb fits which kind of stress pattern?',
    bestFor: ['Daily stress', 'Burnout support', 'Stress-related fatigue', 'Evening recovery'],
    keyStack: [
      { name: 'Rhodiola', dose: '200–400 mg', timing: 'Morning', note: 'Better fit for fatigue and stress-performance support.' },
      { name: 'Holy Basil', dose: '300–600 mg', timing: 'Morning or midday', note: 'Daily stress balance and calm resilience framing.' },
      { name: 'Ashwagandha', dose: '300–600 mg', timing: 'Evening or daily', note: 'Stress recovery, sleep quality, and cortisol-context support.' },
      { name: 'Magnesium', dose: '200–400 mg', timing: 'Evening', note: 'Recovery and sleep-support add-on.' },
    ],
    sections: [
      {
        heading: 'The clean adaptogen tier',
        body: 'For The Hippie Scientist, the useful adaptogen cluster is not “every herb that sounds relaxing.” The core comparison starts with Ashwagandha, Rhodiola, and Holy Basil because they map to different stress use-cases.',
        bullets: ['Rhodiola: fatigue and performance under stress.', 'Ashwagandha: recovery, sleep, and stress load.', 'Holy Basil: daily calm resilience and metabolic-adjacent support.'],
      },
      {
        heading: 'One goal, one stack',
        body: 'The biggest mistake is stacking too many adaptogens without a reason. Decide whether the user needs calm, energy, sleep recovery, or long-term stress support first.',
      },
    ],
    buyingCriteria: ['Ashwagandha: prefer clear root extract and standardization details.', 'Rhodiola: standardized rosavins/salidroside products are easier to compare.', 'Holy Basil: leaf extract or standardized actives should be visible.', 'Avoid blends that hide individual adaptogen doses.'],
    safetyNotes: ['Ashwagandha may not fit everyone, especially with thyroid, autoimmune, pregnancy, liver, or medication context.', 'Rhodiola can feel stimulating.', 'Holy Basil may affect blood sugar or blood pressure in some contexts.'],
    relatedLinks: [
      { label: 'Ashwagandha page', href: '/herbs/ashwagandha' },
      { label: 'Rhodiola page', href: '/herbs/rhodiola' },
      { label: 'Holy Basil page', href: '/herbs/holy-basil' },
    ],
  },
  {
    slug: 'gotu-kola-underrated-brain-circulation-herb',
    title: 'Gotu Kola: The Underrated Brain + Circulation Herb',
    description: 'Where Gotu Kola fits for calm cognition, microcirculation, memory support, and slow-building herbal stacks.',
    category: 'Herb Profile',
    readingTime: '4 min read',
    hero: 'Gotu Kola is not just another calming herb. Its best fit is calm cognition, microcirculation, and long-term support rather than instant stimulation.',
    bestFor: ['Calm focus', 'Microcirculation support', 'Memory stacks', 'Ayurvedic cognitive herb comparisons'],
    keyStack: [
      { name: 'Gotu Kola', dose: '300–450 mg', timing: 'Morning', note: 'Slow-building calm cognition and circulation support.' },
      { name: 'Bacopa', dose: '300 mg', timing: 'Daily', note: 'Memory consolidation pairing.' },
      { name: 'Ginkgo', dose: '120 mg', timing: 'Morning', note: 'Circulation-focused pairing.' },
      { name: 'Lion’s Mane', dose: '1,000 mg+', timing: 'Morning', note: 'Long-term cognitive support stack member.' },
    ],
    sections: [
      {
        heading: 'What Gotu Kola actually does',
        body: 'Gotu Kola is best framed as a traditional Ayurvedic cognitive and circulatory herb with modern evidence still developing. It should not be marketed like a fast stimulant or guaranteed nootropic.',
        bullets: ['Calm cognition rather than sharp stimulation.', 'Microcirculation and venous-tone context.', 'Long-term memory and clarity stack support.'],
      },
      {
        heading: 'Where it fits in a stack',
        body: 'Gotu Kola makes the most sense beside Bacopa, Ginkgo, Lion’s Mane, L-Theanine, or Rhodiola depending on the goal. It is a supporting herb, not the whole stack by itself.',
      },
    ],
    buyingCriteria: ['Look for triterpene standardization when possible.', 'Prefer products that identify Centella asiatica clearly.', 'Avoid vague “brain blend” labels with tiny hidden Gotu Kola amounts.'],
    safetyNotes: ['May cause drowsiness or GI upset in some users.', 'Use caution with sedatives or liver-condition context.', 'Conservative avoidance during pregnancy/breastfeeding unless clinician-guided.'],
    relatedLinks: [
      { label: 'Gotu Kola page', href: '/herbs/gotu-kola' },
      { label: 'Bacopa page', href: '/herbs/bacopa' },
      { label: 'Ginkgo page', href: '/herbs/ginkgo' },
    ],
  },
  {
    slug: 'daily-stress-focus-energy-stack',
    title: 'Best Natural Stack for Stress, Focus, and Energy',
    description: 'A simple daily stack using Rhodiola, L-Theanine, Holy Basil, Ashwagandha, and Magnesium.',
    category: 'Stack Guide',
    readingTime: '5 min read',
    hero: 'A useful daily stack should not try to do everything. This version separates morning energy and calm focus from evening recovery.',
    bestFor: ['Work stress', 'Burnout recovery', 'Calm energy', 'Evening recovery'],
    keyStack: [
      { name: 'Rhodiola', dose: '200–400 mg', timing: 'Morning', note: 'Fatigue resistance and stress-performance support.' },
      { name: 'L-Theanine', dose: '200 mg', timing: 'Morning', note: 'Calm focus layer.' },
      { name: 'Holy Basil', dose: '300–500 mg', timing: 'Morning or midday', note: 'Daily adaptogen layer.' },
      { name: 'Ashwagandha', dose: '300–600 mg', timing: 'Evening', note: 'Recovery and stress-load support.' },
      { name: 'Magnesium', dose: '200–400 mg', timing: 'Evening', note: 'Sleep and relaxation support.' },
    ],
    sections: [
      {
        heading: 'Why split morning and evening support',
        body: 'Morning compounds should support energy and calm focus without wrecking sleep. Evening compounds should support recovery and relaxation without causing next-day drag.',
        bullets: ['Morning: Rhodiola + L-Theanine + Holy Basil.', 'Evening: Ashwagandha + Magnesium.', 'Keep the stack simple before adding cognition or inflammation extras.'],
      },
      {
        heading: 'When to keep it simpler',
        body: 'If someone is sensitive to supplements, start with one morning compound and one evening compound. The full stack is a framework, not a requirement.',
      },
    ],
    buyingCriteria: ['Avoid massive proprietary adaptogen blends.', 'Check Rhodiola and Ashwagandha standardization.', 'Use magnesium glycinate or another well-tolerated form when the goal is relaxation.', 'Keep caffeine intake visible if using this stack for workdays.'],
    safetyNotes: ['Do not combine multiple calming compounds with sedatives without professional guidance.', 'Rhodiola may be too stimulating for some users.', 'Ashwagandha and Holy Basil need extra caution with specific medical or medication contexts.'],
    relatedLinks: [
      { label: 'Browse stacks', href: '/stacks' },
      { label: 'Browse herbs', href: '/herbs' },
      { label: 'Search the database', href: '/search' },
    ],
  },
]

export function getLearnPost(slug: string) {
  return learnPosts.find((post) => post.slug === slug)
}
