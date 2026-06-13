import type { EvidenceStrengthData } from './evidence-strength'
import type { PathwayDiagramData } from './pathway-data'

export type ArticleSection = {
  heading: string
  body: string[]
}

export type FaqItem = {
  question: string
  answer: string
}

export type ComparisonRow = {
  name: string
  evidence: string
  dose: string
  bestFor: string
  caution: string
  href?: string
}

export type SleepArticleContent = {
  slug: string
  eyebrow: string
  tlDr: string[]
  evidence: EvidenceStrengthData
  pathway: PathwayDiagramData
  comparisonRows?: ComparisonRow[]
  sections: ArticleSection[]
  faq: FaqItem[]
  productSlug?: string
  cta: {
    title: string
    body: string
  }
  references: Array<{
    label: string
    href: string
  }>
}

const evidence = (
  tier: EvidenceStrengthData['tier'],
  label: string,
  score: number,
  explanation: string,
  downgradeReasons: string[],
): EvidenceStrengthData => {
  const tone =
    tier === 'moderate'
      ? {
          barColorClass: 'bg-blue-600',
          textColorClass: 'text-blue-800',
          bgColorClass: 'bg-blue-50',
          borderColorClass: 'border-blue-200',
        }
      : {
          barColorClass: 'bg-amber-500',
          textColorClass: 'text-amber-800',
          bgColorClass: 'bg-amber-50',
          borderColorClass: 'border-amber-200',
        }

  return {
    score,
    tier,
    label,
    grade: tier === 'moderate' ? 'B' : 'C',
    humanEvidence: true,
    mechanismEvidence: true,
    explanation,
    downgradeReasons,
    ...tone,
  }
}

const sleepPathway: PathwayDiagramData = {
  id: 'sleep-cluster-decision',
  title: 'Sleep Supplement Decision Pathway',
  summary:
    'Sleep supplements act on different problems: circadian timing, nervous system arousal, muscle tension, and subjective sleep quality.',
  nodes: [
    { id: 'problem', label: 'Sleep Problem', sublabel: 'Onset, quality, arousal', role: 'compound', col: 0, row: 0 },
    { id: 'timing', label: 'Circadian Timing', sublabel: 'Melatonin signal', role: 'target', col: 1, row: 0 },
    { id: 'calm', label: 'Neural Calm', sublabel: 'GABA/NMDA balance', role: 'target', col: 1, row: 1 },
    { id: 'behavior', label: 'Sleep Opportunity', sublabel: 'Light, caffeine, schedule', role: 'mechanism', col: 2, row: 0 },
    { id: 'result', label: 'Better Fit', sublabel: 'Lower-risk starting point', role: 'effect', col: 3, row: 0 },
  ],
  edges: [
    { from: 'problem', to: 'timing' },
    { from: 'problem', to: 'calm' },
    { from: 'timing', to: 'behavior' },
    { from: 'calm', to: 'result' },
    { from: 'behavior', to: 'result' },
  ],
}

const magnesiumPathway: PathwayDiagramData = {
  id: 'magnesium-sleep-cluster',
  title: 'How Magnesium May Support Sleep',
  summary:
    'Magnesium participates in NMDA receptor regulation, GABA signaling, and muscle relaxation; this may matter more for tension and poor sleep quality than for circadian timing.',
  nodes: [
    { id: 'magnesium', label: 'Magnesium', sublabel: 'Glycinate or citrate', role: 'compound', col: 0, row: 0 },
    { id: 'nmda', label: 'NMDA + GABA', sublabel: 'Excitability balance', role: 'target', col: 1, row: 0 },
    { id: 'tension', label: 'Physical Calm', sublabel: 'Less tension', role: 'mechanism', col: 2, row: 0 },
    { id: 'sleep', label: 'Sleep Quality', sublabel: 'Modest support', role: 'effect', col: 3, row: 0 },
  ],
  edges: [
    { from: 'magnesium', to: 'nmda' },
    { from: 'nmda', to: 'tension' },
    { from: 'tension', to: 'sleep' },
  ],
}

const melatoninPathway: PathwayDiagramData = {
  id: 'melatonin-valerian-decision',
  title: 'Melatonin and Valerian Work on Different Problems',
  summary:
    'Melatonin is primarily a timing signal; valerian is usually framed as a calming herb, but its clinical evidence is mixed.',
  nodes: [
    { id: 'choice', label: 'Sleep Aid Choice', sublabel: 'Match the problem', role: 'compound', col: 0, row: 0 },
    { id: 'melatonin', label: 'Melatonin', sublabel: 'Circadian signal', role: 'target', col: 1, row: 0 },
    { id: 'valerian', label: 'Valerian', sublabel: 'Calming herb', role: 'target', col: 1, row: 1 },
    { id: 'onset', label: 'Sleep Onset', sublabel: 'Timing-dependent', role: 'effect', col: 2, row: 0 },
    { id: 'quality', label: 'Subjective Quality', sublabel: 'Evidence mixed', role: 'effect', col: 2, row: 1 },
  ],
  edges: [
    { from: 'choice', to: 'melatonin' },
    { from: 'choice', to: 'valerian' },
    { from: 'melatonin', to: 'onset' },
    { from: 'valerian', to: 'quality' },
  ],
}

const theaninePathway: PathwayDiagramData = {
  id: 'l-theanine-calm-sleep',
  title: 'L-Theanine for Calm Alertness',
  summary:
    'L-theanine is better understood as a relaxation and arousal-modulation compound than as a direct sedative.',
  nodes: [
    { id: 'theanine', label: 'L-Theanine', sublabel: '100-200 mg', role: 'compound', col: 0, row: 0 },
    { id: 'gaba', label: 'GABA/Glutamate', sublabel: 'Modulation', role: 'target', col: 1, row: 0 },
    { id: 'alpha', label: 'Alpha Activity', sublabel: 'Relaxed wakefulness', role: 'mechanism', col: 2, row: 0 },
    { id: 'calm', label: 'Calm', sublabel: 'Not heavy sedation', role: 'effect', col: 3, row: 0 },
  ],
  edges: [
    { from: 'theanine', to: 'gaba' },
    { from: 'gaba', to: 'alpha' },
    { from: 'alpha', to: 'calm' },
  ],
}

const stackPathway: PathwayDiagramData = {
  id: 'magnesium-melatonin-stack',
  title: 'A Conservative Magnesium + Melatonin Stack',
  summary:
    'The practical stack separates baseline mineral support from occasional circadian-timing support instead of escalating both at once.',
  nodes: [
    { id: 'baseline', label: 'Baseline', sublabel: 'Sleep hygiene first', role: 'compound', col: 0, row: 0 },
    { id: 'mag', label: 'Magnesium', sublabel: 'Evening quality support', role: 'target', col: 1, row: 0 },
    { id: 'mel', label: 'Melatonin', sublabel: 'Occasional timing support', role: 'target', col: 1, row: 1 },
    { id: 'review', label: 'Review Response', sublabel: 'Dose, grogginess, timing', role: 'mechanism', col: 2, row: 0 },
    { id: 'stop', label: 'Keep or Stop', sublabel: 'Use the minimum effective plan', role: 'effect', col: 3, row: 0 },
  ],
  edges: [
    { from: 'baseline', to: 'mag' },
    { from: 'baseline', to: 'mel' },
    { from: 'mag', to: 'review' },
    { from: 'mel', to: 'review' },
    { from: 'review', to: 'stop' },
  ],
}

export const sleepArticleContent: Record<string, SleepArticleContent> = {
  'sleep-best-supplements': {
    slug: 'sleep-best-supplements',
    eyebrow: 'Sleep cluster cornerstone',
    tlDr: [
      'Start by naming the sleep problem. Melatonin is mainly a timing signal, magnesium is more relevant to tension and sleep quality, and L-theanine is a calming compound rather than a knockout sleep aid.',
      'The evidence is not equal across options. Melatonin has better evidence for sleep onset and circadian timing than valerian; magnesium evidence is promising but small; valerian remains mixed and should be treated cautiously.',
      'Supplements do not fix short sleep opportunity, late caffeine, bright evening light, untreated sleep apnea, or medication side effects. Those are first-order issues.',
    ],
    evidence: evidence(
      'moderate',
      'Moderate Evidence Overall',
      68,
      'Sleep supplements have meaningful but problem-specific human evidence. Effects are usually modest and depend heavily on baseline deficiency, timing, and sleep disorder context.',
      ['Evidence varies sharply by ingredient and sleep problem.', 'Most supplement trials are short and use subjective sleep measures.'],
    ),
    pathway: sleepPathway,
    comparisonRows: [
      {
        name: 'Magnesium',
        evidence: 'Limited to moderate',
        dose: '100-300 mg elemental magnesium in the evening',
        bestFor: 'Tension, low intake, sleep quality support',
        caution: 'Kidney disease, diarrhea-prone users, medication spacing',
        href: '/articles/magnesium-for-sleep/',
      },
      {
        name: 'Melatonin',
        evidence: 'Moderate for sleep onset/timing',
        dose: '0.3-3 mg near bedtime; lower is often enough',
        bestFor: 'Delayed sleep timing, jet lag style schedule issues',
        caution: 'Next-day grogginess, pregnancy, seizure disorders, sedatives',
        href: '/articles/melatonin-vs-valerian/',
      },
      {
        name: 'L-Theanine',
        evidence: 'Limited for sleep; better for calm/stress',
        dose: '100-200 mg when relaxation is the goal',
        bestFor: 'Evening calm without heavy sedation',
        caution: 'May add to blood-pressure-lowering or sedating regimens',
        href: '/articles/l-theanine-for-calm/',
      },
      {
        name: 'Valerian',
        evidence: 'Mixed and inconclusive',
        dose: 'Varies by extract; label-dependent',
        bestFor: 'Users who tolerate herbs and accept uncertainty',
        caution: 'Sedatives, alcohol, pregnancy, liver concerns',
        href: '/articles/melatonin-vs-valerian/',
      },
    ],
    sections: [
      {
        heading: 'Introduction',
        body: [
          'The most useful sleep supplement question is not “what is strongest?” It is “what problem am I trying to solve?” A circadian-timing problem, a wired-but-tired arousal problem, and a low-magnesium-intake problem are different decisions.',
          'This guide keeps the claims narrow. Supplements may support sleep onset, perceived sleep quality, or relaxation in some people. They should not be framed as cures for insomnia, substitutes for medical care, or fixes for poor sleep opportunity.',
        ],
      },
      {
        heading: 'Human evidence',
        body: [
          'Melatonin has the clearest role when the problem is timing: delayed sleep onset, jet-lag-like schedule shifts, or circadian misalignment. Meta-analyses generally find modest improvements, not dramatic sedative effects.',
          'Magnesium trials are smaller. A 2021 review of oral magnesium for insomnia in older adults found only three randomized trials and described the evidence as limited. That is enough to discuss magnesium as a reasonable candidate for some users, but not enough to sell it as a universal sleep solution.',
          'Valerian evidence is mixed. Reviews have found possible subjective sleep-quality signals, but more recent umbrella-level summaries describe the overall evidence as weak or inconclusive.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'For magnesium, focus on elemental magnesium, not capsule weight. A conservative range is 100-300 mg elemental magnesium in the evening, with lower doses favored if bowel tolerance is uncertain.',
          'For melatonin, lower doses are often the rational starting point. Many people escalate too quickly. A practical range is 0.3-3 mg, timed consistently, with attention to next-day grogginess.',
          'For L-theanine, 100-200 mg is commonly used for relaxation. It is not best framed as a direct sleep inducer; it is more useful when mental arousal is the problem.',
        ],
      },
      {
        heading: 'Safety and interactions',
        body: [
          'Do not stack multiple sedating supplements with alcohol, sleep medications, benzodiazepines, opioids, or other central nervous system depressants unless a clinician has reviewed the plan.',
          'Magnesium needs extra caution in kidney disease and should be spaced away from some antibiotics, thyroid medication, and bisphosphonates. Melatonin deserves caution with pregnancy, seizure disorders, anticoagulants, immunosuppressants, and sedating medications.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'Pick melatonin when timing is the core issue. Pick magnesium when tension, low intake, or general sleep quality is the more plausible issue. Pick L-theanine when daytime or evening calm is the need and heavy sedation is not desired.',
          'If stacking, change one variable at a time. A clean experiment is more useful than a complicated stack that makes side effects impossible to interpret.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the best supplement for sleep?',
        answer:
          'There is no single best supplement for sleep. Melatonin fits circadian timing, magnesium may fit tension or low intake, and L-theanine fits calm without heavy sedation. The right choice depends on the sleep problem and safety context.',
      },
      {
        question: 'Should I start with magnesium or melatonin?',
        answer:
          'If the problem is falling asleep because your schedule is shifted, melatonin is more targeted. If the problem is muscle tension, low magnesium intake, or general sleep quality, magnesium may be the more conservative first review.',
      },
      {
        question: 'Can supplements treat insomnia?',
        answer:
          'This site does not frame supplements as insomnia treatments. Persistent insomnia, suspected sleep apnea, restless legs, severe anxiety, medication side effects, or daytime impairment should be discussed with a qualified clinician.',
      },
    ],
    cta: {
      title: 'Start with the safest sleep decision',
      body: 'Use the checklist to separate sleep timing, arousal, medication interactions, and supplement quality before buying anything.',
    },
    references: [
      { label: 'NIH Bookshelf: Melatonin for the Treatment of Insomnia, 2022 update', href: 'https://www.ncbi.nlm.nih.gov/books/NBK605080/' },
      { label: 'Oral magnesium supplementation for insomnia in older adults, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
      { label: 'Valerian evidence overview, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/38359657/' },
    ],
  },
  'magnesium-for-sleep': {
    slug: 'magnesium-for-sleep',
    eyebrow: 'Sleep satellite guide',
    tlDr: [
      'Magnesium is most plausible when poor sleep overlaps with low magnesium intake, muscle tension, or nervous system hyperarousal.',
      'Human sleep evidence exists, but it is small and not definitive. Treat magnesium as a reasonable candidate, not a guaranteed sleep aid.',
      'Glycinate or bisglycinate are often preferred for tolerability; citrate can be useful but is more likely to loosen stools.',
    ],
    evidence: evidence(
      'limited',
      'Limited Human Evidence',
      48,
      'Magnesium has small human sleep trials and a plausible mechanism, but study sizes are limited and outcomes are not consistent enough for strong claims.',
      ['Few sleep-specific randomized trials.', 'Benefits may depend on baseline magnesium status and population.'],
    ),
    pathway: magnesiumPathway,
    sections: [
      {
        heading: 'Introduction',
        body: [
          'Magnesium is involved in hundreds of enzymatic processes, including neuromuscular function and nervous system excitability. That makes it biologically plausible for sleep quality, especially when intake is low.',
          'The practical mistake is treating all magnesium products as the same. Form, elemental dose, and bowel tolerance matter more than the front-label milligram number.',
        ],
      },
      {
        heading: 'Human evidence',
        body: [
          'The best-known randomized trial in older adults with primary insomnia used magnesium supplementation and reported improvements in several sleep measures. The trial was small, so it should inform a cautious hypothesis rather than a broad promise.',
          'A 2021 review found three randomized trials in older adults. That review supports the possibility of benefit but also highlights why the evidence should be graded as limited rather than strong.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'A conservative sleep-oriented range is 100-300 mg elemental magnesium in the evening. Start at the low end if you are sensitive to supplements or have a history of loose stools.',
          'Magnesium glycinate or bisglycinate is usually the cleaner sleep-focused choice. Citrate is more bowel-active. Oxide is inexpensive but often less desirable when tolerability and absorption are priorities.',
        ],
      },
      {
        heading: 'Safety, interactions, and who should avoid it',
        body: [
          'Avoid unsupervised magnesium supplementation in significant kidney disease. Magnesium can accumulate when renal clearance is impaired.',
          'Separate magnesium from tetracycline or fluoroquinolone antibiotics, thyroid medication, and bisphosphonates. The mineral can bind some medications and reduce absorption.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'Choose magnesium before melatonin when the issue feels like body tension, low dietary intake, or poor sleep quality rather than a shifted bedtime clock.',
          'Magnesium can be paired with melatonin, but it is better to test magnesium alone first. If sleep improves, adding another compound may be unnecessary.',
        ],
      },
    ],
    faq: [
      {
        question: 'Which magnesium form is best for sleep?',
        answer:
          'Magnesium glycinate or bisglycinate is usually the most practical sleep-focused form because it is commonly better tolerated. Citrate may be useful but is more likely to cause loose stools.',
      },
      {
        question: 'How much magnesium should I take before bed?',
        answer:
          'A conservative adult range is 100-300 mg elemental magnesium in the evening. The elemental amount matters more than the total compound weight shown on the front of the bottle.',
      },
      {
        question: 'Can magnesium be taken with melatonin?',
        answer:
          'They are often combined, but a cautious approach is to test one variable at a time. Add melatonin only if the remaining problem looks like sleep timing rather than tension or low intake.',
      },
    ],
    productSlug: 'magnesium',
    cta: {
      title: 'Buying magnesium for sleep?',
      body: 'Use form, elemental dose, and tolerability as the filter before comparing brands.',
    },
    references: [
      { label: 'Magnesium insomnia trial, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
      { label: 'Oral magnesium review in older adults, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
    ],
  },
  'melatonin-vs-valerian': {
    slug: 'melatonin-vs-valerian',
    eyebrow: 'Sleep comparison guide',
    tlDr: [
      'Melatonin is a circadian timing signal, not a general-purpose sedative. It fits sleep-onset timing problems better than broad insomnia claims.',
      'Valerian is more uncertain. Some reviews find subjective sleep-quality signals, but the overall evidence remains mixed and inconclusive.',
      'If you use either, avoid combining them with alcohol, sedatives, or sleep medications without medical guidance.',
    ],
    evidence: evidence(
      'mixed',
      'Mixed Evidence',
      50,
      'Melatonin has more consistent support for sleep timing and onset than valerian, while valerian evidence remains inconsistent across reviews.',
      ['Valerian studies vary by extract and outcome.', 'Melatonin effects are usually modest and timing-dependent.'],
    ),
    pathway: melatoninPathway,
    comparisonRows: [
      {
        name: 'Melatonin',
        evidence: 'Moderate for sleep onset/timing',
        dose: '0.3-3 mg',
        bestFor: 'Delayed sleep timing, jet lag style issues',
        caution: 'Grogginess, vivid dreams, medication interactions',
      },
      {
        name: 'Valerian',
        evidence: 'Mixed/inconclusive',
        dose: 'Extract-dependent',
        bestFor: 'Subjective calm or sleep quality experiments',
        caution: 'Sedatives, alcohol, pregnancy, liver concerns',
      },
    ],
    sections: [
      {
        heading: 'Introduction',
        body: [
          'Melatonin and valerian are often shelved next to each other, but they are not interchangeable. Melatonin is a hormone-like timing signal. Valerian is a botanical preparation with variable extracts and mixed evidence.',
          'That distinction matters because “can’t fall asleep at the desired time” is different from “sleep feels light and restless.”',
        ],
      },
      {
        heading: 'Human evidence',
        body: [
          'Melatonin reviews generally show modest improvements in sleep onset latency and total sleep time, with stronger logic when circadian timing is the problem. NIH summaries also note that some insomnia outcomes show no clear difference in certain trials.',
          'Valerian evidence is less settled. Older reviews suggested possible subjective sleep-quality benefits, but more recent summaries describe the evidence base as weak or inconclusive.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'For melatonin, more is not automatically better. Many users should think in the 0.3-3 mg range rather than jumping to high-dose gummies.',
          'For valerian, dosing depends heavily on extract type. If the label does not clearly describe extract strength or serving size, it is hard to compare products responsibly.',
        ],
      },
      {
        heading: 'Safety and interactions',
        body: [
          'Both can add to sedation. Avoid combining with alcohol, sleep medications, benzodiazepines, opioids, or other sedating substances unless a clinician has reviewed the combination.',
          'Melatonin deserves extra caution with pregnancy, seizure disorders, anticoagulants, immunosuppressants, and complex endocrine conditions. Valerian deserves caution with liver concerns and perioperative sedation risk.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'Choose melatonin when timing is the obvious issue: jet lag, delayed bedtime, or a shifted sleep window. Choose valerian only if you accept a less certain evidence base and tolerate botanicals well.',
          'Do not combine melatonin and valerian as a first experiment. If one causes grogginess, you need to know which one did it.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is melatonin stronger than valerian?',
        answer:
          'Stronger is the wrong frame. Melatonin is more targeted for circadian timing and sleep onset. Valerian is a calming herb with mixed and less predictable evidence.',
      },
      {
        question: 'Can I take melatonin and valerian together?',
        answer:
          'Combining them can increase sedation and makes side effects harder to interpret. A conservative approach is to test one at a time and avoid the combination with alcohol or sedating medications.',
      },
      {
        question: 'Which is less likely to cause next-day grogginess?',
        answer:
          'Either can cause grogginess in some users. Melatonin grogginess often relates to dose and timing; valerian response is more product- and person-specific.',
      },
    ],
    productSlug: 'valerian',
    cta: {
      title: 'Choosing between melatonin and valerian?',
      body: 'Match the supplement to the sleep problem instead of stacking sedatives by default.',
    },
    references: [
      { label: 'NIH Bookshelf: Melatonin for insomnia update', href: 'https://www.ncbi.nlm.nih.gov/books/NBK605080/' },
      { label: 'Melatonin meta-analysis, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
      { label: 'Valerian umbrella review, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/38359657/' },
    ],
  },
  'l-theanine-for-calm': {
    slug: 'l-theanine-for-calm',
    eyebrow: 'Sleep satellite guide',
    tlDr: [
      'L-theanine is best framed as calm support, not a heavy sleep inducer.',
      'It may fit people whose sleep problem starts with mental arousal, evening stress, or caffeine sensitivity.',
      'The sleep-specific evidence is still limited, so use modest language and track response rather than expecting a guaranteed effect.',
    ],
    evidence: evidence(
      'limited',
      'Limited Human Evidence',
      46,
      'L-theanine has human trials for stress-related symptoms and emerging sleep research, but sleep-specific evidence is still developing.',
      ['Most evidence is stress/calm focused rather than insomnia focused.', 'Long-term nightly use is less well studied.'],
    ),
    pathway: theaninePathway,
    sections: [
      {
        heading: 'Introduction',
        body: [
          'L-theanine is the amino acid most associated with green tea’s calm-alert profile. It is usually not a knockout sleep supplement. That is the point: it may support relaxation without trying to force sedation.',
          'For sleep, the best-fit user is someone who feels mentally revved up at night but does not want a stronger sedative.',
        ],
      },
      {
        heading: 'Human evidence',
        body: [
          'A randomized placebo-controlled crossover trial found that four weeks of L-theanine affected stress-related symptoms and sleep-related measures in healthy adults. This supports the calm-and-stress framing more than a direct insomnia-treatment claim.',
          'Newer sleep-specific reviews are emerging, but the practical conclusion remains cautious: L-theanine may support sleep quality indirectly by reducing arousal, and the evidence is not as mature as for core sleep-timing interventions.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'A common practical range is 100-200 mg. Some studies use higher daily totals, but higher is not automatically better for a first trial.',
          'For evening calm, take it when mental arousal usually begins rather than waiting until you are already frustrated in bed.',
        ],
      },
      {
        heading: 'Safety and interactions',
        body: [
          'L-theanine is generally well tolerated in short-term studies, but long-term nightly use is less well characterized.',
          'Use extra caution with blood-pressure-lowering medications, sedating medications, pregnancy, breastfeeding, or complex psychiatric medication regimens.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'Compared with melatonin, L-theanine is less about clock timing and more about arousal. Compared with magnesium, it is less mineral/nutrition oriented and more neurochemical relaxation oriented.',
          'It can be paired with magnesium in some routines, but test one change first. If caffeine is the issue, reducing afternoon caffeine usually matters more than adding a nighttime supplement.',
        ],
      },
    ],
    faq: [
      {
        question: 'Does L-theanine make you sleepy?',
        answer:
          'L-theanine is not usually described as a heavy sedative. It is more often used for calm alertness or reduced arousal, which may indirectly help sleep in some people.',
      },
      {
        question: 'When should I take L-theanine for calm?',
        answer:
          'For evening calm, many users trial it 30-90 minutes before bed or when mental arousal starts. Timing should be adjusted conservatively based on response and next-day effects.',
      },
      {
        question: 'Can L-theanine help if caffeine disrupts sleep?',
        answer:
          'It may smooth caffeine-related arousal for some people, but the first intervention is reducing caffeine dose and moving caffeine earlier in the day.',
      },
    ],
    productSlug: 'l-theanine',
    cta: {
      title: 'Need calm without heavy sedation?',
      body: 'Use L-theanine as a calm-support candidate, then compare it with magnesium and sleep timing changes.',
    },
    references: [
      { label: 'L-theanine stress-related symptoms trial, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/31623400/' },
      { label: 'L-theanine and sleep review, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/41176609/' },
    ],
  },
  'sleep-stack-magnesium-melatonin': {
    slug: 'sleep-stack-magnesium-melatonin',
    eyebrow: 'Sleep stack guide',
    tlDr: [
      'A magnesium + melatonin stack should not be the first move for most people. Test the simplest plausible intervention first.',
      'Use magnesium for evening quality/tension logic and melatonin for timing logic. Do not escalate both at once.',
      'Avoid the stack with sedatives, alcohol, pregnancy, kidney disease, seizure disorders, or complex medication regimens unless medically reviewed.',
    ],
    evidence: evidence(
      'limited',
      'Limited Stack Evidence',
      42,
      'Magnesium and melatonin each have human evidence in different sleep contexts, but direct evidence for the two-ingredient stack is limited.',
      ['Direct combination trials are not the basis for most stack claims.', 'Stack response is hard to interpret when multiple variables change together.'],
    ),
    pathway: stackPathway,
    sections: [
      {
        heading: 'Introduction',
        body: [
          'Stacking is attractive because it feels decisive. It is also where supplement decisions get messy. If magnesium, melatonin, late caffeine changes, and a new bedtime all start on the same night, you cannot tell what helped or what caused grogginess.',
          'The conservative stack framework is simple: fix the environment, choose one supplement that matches the problem, track response, and only then consider a second variable.',
        ],
      },
      {
        heading: 'Human evidence',
        body: [
          'Magnesium has limited trial evidence for insomnia symptoms, especially in older adult populations. Melatonin has stronger evidence for sleep onset and timing. That does not automatically prove that the combination is better than either alone.',
          'Most stack claims are extrapolations from separate evidence bases. That is acceptable as a hypothesis, but it should be labeled as a hypothesis.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'A conservative approach is magnesium first: 100-300 mg elemental magnesium in the evening, with a tolerable form. If the remaining issue is clearly timing, trial low-dose melatonin separately.',
          'For melatonin, 0.3-1 mg is often a rational first test before considering higher doses. Higher-dose gummies are common, but common does not mean necessary.',
        ],
      },
      {
        heading: 'Safety and interactions',
        body: [
          'Avoid this stack with alcohol or sedating medications unless reviewed by a clinician. Stop and reassess if next-day grogginess, dizziness, unusual dreams, or gastrointestinal effects appear.',
          'Magnesium needs kidney and medication-spacing caution. Melatonin needs caution with pregnancy, seizure disorders, anticoagulants, immunosuppressants, and endocrine complexity.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'If sleep improves on magnesium alone, do not add melatonin just because it is available. If melatonin works for occasional timing issues, do not turn it into an automatic nightly habit without reassessing.',
          'The best stack is often a non-supplement stack: dim light, earlier caffeine cutoff, consistent wake time, and a single carefully chosen supplement.',
        ],
      },
    ],
    faq: [
      {
        question: 'Can magnesium and melatonin be taken together?',
        answer:
          'They are often used together, but direct stack evidence is limited. A cautious plan tests one variable at a time and avoids the combination with sedatives, alcohol, or complex medical situations.',
      },
      {
        question: 'Should I take magnesium or melatonin first?',
        answer:
          'Start with the ingredient that matches the problem. Magnesium fits tension or low intake; melatonin fits sleep timing. If both seem plausible, magnesium is often the less timing-sensitive first experiment.',
      },
      {
        question: 'What is the biggest mistake with sleep stacks?',
        answer:
          'The biggest mistake is changing too many variables at once. That makes benefits and side effects impossible to interpret and can lead to unnecessary dose escalation.',
      },
    ],
    productSlug: 'magnesium',
    cta: {
      title: 'Build a cleaner sleep experiment',
      body: 'Track one change at a time so you can tell whether magnesium, melatonin, timing, or sleep hygiene made the difference.',
    },
    references: [
      { label: 'Oral magnesium review in older adults, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
      { label: 'Melatonin dose and timing meta-analysis, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/38888087/' },
    ],
  },
  'best-magnesium-for-sleep': {
    slug: 'best-magnesium-for-sleep',
    eyebrow: 'Sleep product guide',
    tlDr: [
      'The best magnesium for sleep is usually the product with the right form, a clear elemental dose, and good tolerability, not the biggest front-label number.',
      'Glycinate or bisglycinate is the default form to compare for sleep. Citrate can work but is more bowel-active; oxide is usually not the first sleep-quality pick.',
      'This guide uses buying criteria and existing product infrastructure. It does not invent review counts, prices, or unsupported rankings.',
    ],
    evidence: evidence(
      'limited',
      'Limited Human Evidence',
      48,
      'Magnesium has plausible mechanisms and small human sleep trials, but product choice should be based on quality criteria rather than exaggerated claims.',
      ['Product labels vary in elemental dose transparency.', 'Sleep effects may depend on baseline intake and tolerance.'],
    ),
    pathway: magnesiumPathway,
    comparisonRows: [
      {
        name: 'Magnesium glycinate / bisglycinate',
        evidence: 'Best sleep-oriented default',
        dose: '100-300 mg elemental magnesium',
        bestFor: 'Tolerability, evening use, tension',
        caution: 'Still can loosen stools in sensitive users',
      },
      {
        name: 'Magnesium citrate',
        evidence: 'Useful but bowel-active',
        dose: '100-200 mg elemental magnesium',
        bestFor: 'Users who also want regularity support',
        caution: 'More likely to cause diarrhea',
      },
      {
        name: 'Magnesium oxide',
        evidence: 'Budget form, less sleep-focused',
        dose: 'Label-dependent',
        bestFor: 'Cost-focused users who tolerate it',
        caution: 'Less desirable when absorption/tolerability matter',
      },
    ],
    sections: [
      {
        heading: 'Introduction',
        body: [
          'A magnesium buying guide should not pretend every bottle is a sleep product. The goal is to find a form and dose that fit an evening routine without causing gastrointestinal problems or medication conflicts.',
          'This page ranks criteria, not fabricated product metrics. If product data is shown, it comes from the site’s existing revenue-product configuration.',
        ],
      },
      {
        heading: 'Buying criteria',
        body: [
          'Look for elemental magnesium clearly stated on the Supplement Facts panel. “1,000 mg magnesium glycinate” is not the same thing as 1,000 mg elemental magnesium.',
          'Prefer glycinate or bisglycinate for sleep-oriented trials. Check serving size, capsules per serving, third-party testing signals, and whether the product includes extra sedating herbs you did not intend to test.',
        ],
      },
      {
        heading: 'Dosage guidance',
        body: [
          'A practical sleep trial is 100-300 mg elemental magnesium in the evening. The lower end is enough for many users to assess tolerability.',
          'Do not combine a high-dose magnesium product with other magnesium-containing laxatives, antacids, or mineral blends without adding up the total intake.',
        ],
      },
      {
        heading: 'Safety and interactions',
        body: [
          'Kidney disease is the main red flag for unsupervised magnesium supplementation. Medication spacing matters for antibiotics, thyroid medication, and bisphosphonates.',
          'Loose stools, cramping, and nausea are signs the dose or form may not fit. A product that disrupts your gut is not a good sleep product.',
        ],
      },
      {
        heading: 'Comparisons and stacking guidance',
        body: [
          'If magnesium does not match your problem, do not force it. Sleep-onset timing may point more toward the melatonin guide; mental arousal may point toward L-theanine or non-supplement sleep hygiene changes.',
          'If you add melatonin later, keep magnesium stable and use a low melatonin dose so you can interpret the response.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is magnesium glycinate better than citrate for sleep?',
        answer:
          'For sleep-oriented use, glycinate or bisglycinate is often the cleaner default because citrate is more bowel-active. Citrate can still be reasonable if regularity support is also desired.',
      },
      {
        question: 'What should I check on a magnesium label?',
        answer:
          'Check elemental magnesium per serving, form, serving size, added ingredients, and quality signals such as third-party testing. Do not rely only on the largest milligram number on the front label.',
      },
      {
        question: 'Should a magnesium sleep product include melatonin?',
        answer:
          'Not by default. Combination products make it harder to know which ingredient helped or caused side effects. A plain magnesium product is easier to test first.',
      },
    ],
    productSlug: 'magnesium',
    cta: {
      title: 'Compare magnesium products carefully',
      body: 'Start with form and elemental dose, then use product links only after the label fits the sleep decision.',
    },
    references: [
      { label: 'Magnesium insomnia trial, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
      { label: 'Oral magnesium review in older adults, PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
    ],
  },
}

export function getSleepArticleContent(slug: string): SleepArticleContent {
  const content = sleepArticleContent[slug]
  if (!content) {
    throw new Error(`Missing sleep article content for ${slug}`)
  }
  return content
}

