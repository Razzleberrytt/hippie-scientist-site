export type WelcomeEmailPurpose =
  | 'deliver-resource'
  | 'explain-evidence-grades'
  | 'evaluate-label'
  | 'demonstrate-safety-checker'
  | 'show-research-resources'
  | 'highlight-comparison'
  | 'invite-topic-selection'

export type WelcomeEmail = {
  sequence: number
  purpose: WelcomeEmailPurpose
  delayDays: number
  subject: string
  previewText: string
  body: readonly string[]
  cta: {
    label: string
    href: string
  }
  secondaryCtas?: readonly {
    label: string
    href: string
  }[]
}

const EMAIL_MEDIUM = 'email'
const CAMPAIGN = 'welcome_sequence'

export function withWelcomeTracking(href: string, sequence: number): string {
  const separator = href.includes('?') ? '&' : '?'
  return `${href}${separator}utm_source=newsletter&utm_medium=${EMAIL_MEDIUM}&utm_campaign=${CAMPAIGN}&utm_content=email_${sequence}`
}

export const welcomeEmailSequence: readonly WelcomeEmail[] = [
  {
    sequence: 1,
    purpose: 'deliver-resource',
    delayDays: 0,
    subject: 'Your supplement safety checklist is here',
    previewText: 'Start with the promised resource, then keep the same safety-first workflow for anything you research.',
    body: [
      'Thanks for joining The Hippie Scientist. Here is the supplement safety checklist you asked for.',
      'Use it as a pre-purchase workflow: check medications and contraindications, verify the dose and form, look for stacking risks, and confirm product-quality details before treating a label as trustworthy.',
      'The site is educational and does not replace medical care. When a question involves a medication, pregnancy, a serious condition, or a high-risk substance, use the checklist to identify what needs professional review rather than to self-clear the combination.',
    ],
    cta: {
      label: 'Open the safety checklist',
      href: withWelcomeTracking('/info/supplement-safety-checklist/', 1),
    },
  },
  {
    sequence: 2,
    purpose: 'explain-evidence-grades',
    delayDays: 1,
    subject: 'What an evidence grade actually tells you',
    previewText: 'A mechanism, one positive study, and a replicated human effect are not the same thing.',
    body: [
      'The evidence grade is meant to answer a narrow question: how much confidence should the current human evidence support for a specific conclusion?',
      'Human trials, systematic reviews, observational research, animal work, mechanisms, and traditional use are separated because they answer different questions. Mechanistic plausibility can explain why an effect might happen; it cannot substitute for replicated clinical evidence that it does happen.',
      'When evidence is mixed or preliminary, the useful response is not hype or dismissal. It is a smaller conclusion with the uncertainty kept visible.',
    ],
    cta: {
      label: 'See the grading methodology',
      href: withWelcomeTracking('/info/methodology/', 2),
    },
    secondaryCtas: [
      { label: 'Evidence levels in plain English', href: withWelcomeTracking('/learn/evidence-levels/', 2) },
    ],
  },
  {
    sequence: 3,
    purpose: 'evaluate-label',
    delayDays: 3,
    subject: 'How to read a supplement label before buying',
    previewText: 'Form, elemental amount, extract standardization, and proprietary blends can change what the label really means.',
    body: [
      'A product can contain the right ingredient name and still fail to resemble what was studied. Start by identifying the exact form, serving size, active or elemental amount, and any extract standardization.',
      'Watch for proprietary blends that hide individual amounts, mineral labels that emphasize compound weight instead of elemental content, and botanical extracts whose marker percentage or extraction method is not disclosed.',
      'Then compare the label with the form and dose used in the evidence. A research result for one standardized extract should not automatically be generalized to every product carrying the same plant name.',
    ],
    cta: {
      label: 'Open the product-quality guide',
      href: withWelcomeTracking('/learn/product-quality/', 3),
    },
    secondaryCtas: [
      { label: 'Review dosing basics', href: withWelcomeTracking('/info/dosing/', 3) },
    ],
  },
  {
    sequence: 4,
    purpose: 'demonstrate-safety-checker',
    delayDays: 5,
    subject: 'Use the Safety Checker before you stack supplements',
    previewText: 'The useful result is not “safe” or “unsafe” — it is why a combination deserves attention.',
    body: [
      'The Safety Checker is designed as a screening tool. It surfaces documented or plausible caution flags, shows why a pair was flagged, and points back to the underlying ingredient safety context.',
      'A blank result should never be interpreted as proof of no interaction. The right wording is that no documented interaction was found in the current dataset, because evidence can be incomplete.',
      'Try it with supplements you are already researching, then open each ingredient profile for the fuller interaction and contraindication context.',
    ],
    cta: {
      label: 'Open the Safety Checker',
      href: withWelcomeTracking('/safety-checker/', 4),
    },
  },
  {
    sequence: 5,
    purpose: 'show-research-resources',
    delayDays: 8,
    subject: 'The strongest research tools on the site',
    previewText: 'Go beyond individual profiles with the evidence report, lookup tools, and citation resources.',
    body: [
      'Ingredient pages are only one layer of the site. The research tools are built to make the underlying structure easier to inspect across many ingredients at once.',
      'Use the Evidence Report for the big-picture view, Evidence Lookup to filter by evidence level, and the Citation Explorer when you want to trace claims back toward their sources.',
      'These resources are most useful when they make uncertainty easier to see, not when they manufacture a single score that hides disagreement.',
    ],
    cta: {
      label: 'Open the Evidence Report',
      href: withWelcomeTracking('/evidence/evidence-report/', 5),
    },
    secondaryCtas: [
      { label: 'Use Evidence Lookup', href: withWelcomeTracking('/evidence/evidence-checker/', 5) },
      { label: 'Explore citations', href: withWelcomeTracking('/learn/citation-explorer/', 5) },
    ],
  },
  {
    sequence: 6,
    purpose: 'highlight-comparison',
    delayDays: 11,
    subject: 'A better way to compare supplement options',
    previewText: 'The important differences are evidence, safety, form, dose, and fit — not who wins a generic ranking.',
    body: [
      'Comparison pages should make tradeoffs explicit. Two supplements can target a similar goal while differing sharply in evidence strength, sedation or stimulation risk, medication concerns, studied forms, and the time horizon of the trials.',
      'The comparison below is a useful example because it separates calming strategies instead of pretending the ingredients are interchangeable.',
      'Use the quick verdict to orient yourself, then read the evidence and safety differences before treating either option as a fit.',
    ],
    cta: {
      label: 'Compare ashwagandha, L-theanine, and magnesium',
      href: withWelcomeTracking('/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/', 6),
    },
  },
  {
    sequence: 7,
    purpose: 'invite-topic-selection',
    delayDays: 14,
    subject: 'What should The Hippie Scientist research next?',
    previewText: 'Choose the topics you want more of: Sleep, Stress, Anxiety, Focus, or general research.',
    body: [
      'The best research queue should be driven partly by what readers are actually trying to understand.',
      'Choose the topic closest to what you want to follow. This is a content preference, not a request for symptoms, diagnoses, medications, or other health information.',
      'Your selection can be used to send relevant research notes more selectively instead of sending every topic to everyone.',
    ],
    cta: {
      label: 'Choose research topics',
      href: withWelcomeTracking('/info/newsletter/#research-interests', 7),
    },
  },
] as const

export const REQUIRED_WELCOME_PURPOSES: readonly WelcomeEmailPurpose[] = [
  'deliver-resource',
  'explain-evidence-grades',
  'evaluate-label',
  'demonstrate-safety-checker',
  'show-research-resources',
  'highlight-comparison',
  'invite-topic-selection',
]
