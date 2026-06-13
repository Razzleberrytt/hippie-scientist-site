export type GoalFaqItem = {
  question: string
  answer: string
}

export type GoalDosingNote = {
  compound: string
  note: string
}

export type GoalEvidenceRow = {
  compound: string
  evidence: string
  humanData: string
  limitation: string
}

export type GoalContentExtension = {
  faqItems: GoalFaqItem[]
  dosingNotes: GoalDosingNote[]
  evidenceRows: GoalEvidenceRow[]
  safetyBullets: string[]
}

const sharedSafety = [
  'Review prescription medications, pregnancy or breastfeeding, and chronic conditions before starting any supplement.',
  'Avoid stacking multiple sedating or serotonergic products without clinician guidance.',
  'Start one change at a time so you can observe tolerance and sleep or mood effects.',
]

export const goalContentBySlug: Record<string, GoalContentExtension> = {
  sleep: {
    faqItems: [
      {
        question: 'What is the best evidence-based supplement for sleep onset?',
        answer:
          'Melatonin has the strongest human evidence for circadian timing and sleep-onset support, but grogginess and vivid dreams are common reasons people stop. Magnesium and L-theanine are often used for wind-down support when timing or racing thoughts are the main issue — evidence is more limited and population-dependent.',
      },
      {
        question: 'How do melatonin, valerian, and magnesium compare for sleep?',
        answer:
          'Melatonin acts as a hormonal timing signal to reset your body clock. Valerian root is a traditional GABAergic herb that helps reduce sleep latency over weeks of consistent daily use. Magnesium glycinate provides baseline mineral support to help physically relax muscles and the nervous system. Read our detailed Melatonin vs Valerian vs Magnesium guide in the comparisons section.',
      },
      {
        question: 'Are sleep supplements safe to combine with prescription sleep aids?',
        answer:
          'Combining sedating supplements with prescription hypnotics, benzodiazepines, or alcohol can increase oversedation risk. This page is educational only; medication changes require a qualified clinician or pharmacist.',
      },
      {
        question: 'How long before bed should I take sleep supplements?',
        answer:
          'Melatonin and L-theanine are often taken 30–60 minutes before bed; magnesium glycinate is commonly used in the evening. Onset varies by product form, dose, and individual response — verify the label and adjust conservatively.',
      },
      {
        question: 'Why do some sleep aids cause next-day grogginess?',
        answer:
          'Residual melatonin, antihistamine-like sedatives, or dose stacking can impair morning alertness. Lower doses, earlier timing, and avoiding poly-sedative stacks often reduce grogginess — discuss persistent symptoms with a clinician.',
      },
    ],
    dosingNotes: [
      { compound: 'Melatonin', note: 'Often 0.3–3 mg for timing support; lower doses may reduce morning grogginess. Confirm product label.' },
      { compound: 'Magnesium (glycinate)', note: 'Evening doses per label; titrate slowly if GI tolerance is an issue.' },
      { compound: 'L-Theanine', note: 'Commonly 100–200 mg before bed; subtle alone — often paired with caffeine earlier in the day, not at night.' },
      { compound: 'Valerian Root', note: 'Typically 300–600 mg of standardized extract (0.8% valerenic acids) taken 30–60 minutes before bedtime.' },
    ],
    evidenceRows: [
      { compound: 'Melatonin', evidence: 'Strong for circadian timing', humanData: 'Multiple RCTs', limitation: 'Weaker for chronic insomnia as monotherapy' },
      { compound: 'Magnesium', evidence: 'Limited to moderate', humanData: 'Mixed populations', limitation: 'Benefit may depend on baseline status' },
      { compound: 'L-Theanine', evidence: 'Moderate for relaxation', humanData: 'Smaller trials', limitation: 'Subtle for severe insomnia' },
      { compound: 'Valerian Root', evidence: 'Limited to moderate', humanData: 'Subjective scales', limitation: 'Requires 2–4 weeks for cumulative effect; strong odor' },
    ],
    safetyBullets: [
      ...sharedSafety,
      'Use caution with autoimmune conditions and melatonin; avoid driving if oversedated.',
    ],
  },
  stress: {
    faqItems: [
      {
        question: 'Ashwagandha vs L-theanine vs magnesium — which fits my stress pattern?',
        answer:
          'Ashwagandha is an adaptogen suited for long-term HPA-axis regulation and lowering chronic cortisol. L-Theanine is an amino acid that provides rapid, acute stress buffering and daytime calm within 30–90 minutes. Magnesium glycinate provides basic daily mineral support for physical tension and evening recovery. Compare these three in our dedicated comparison guide.',
      },
      {
        question: 'Ashwagandha vs rhodiola — which has better stress evidence?',
        answer:
          'Ashwagandha has moderate-to-strong human data for subjective stress and anxiety scales in several trials. Rhodiola is moderate for fatigue under stress with more trial variability. Choice depends on whether you need calming recovery vs performance-under-pressure support.',
      },
      {
        question: 'Can adaptogens be used long term?',
        answer:
          'Human trials vary in duration; long-term safety is not uniformly established for every extract. Periodic reassessment with a clinician is prudent, especially with thyroid, autoimmune, or psychiatric conditions.',
      },
      {
        question: 'Why do some people feel emotionally flat on ashwagandha?',
        answer:
          'Anhedonia or emotional blunting is a commonly reported reason people discontinue ashwagandha. If mood changes occur, stop and discuss with a clinician.',
      },
    ],
    dosingNotes: [
      { compound: 'Ashwagandha (KSM-66 / Shoden)', note: 'Follow extract-specific label ranges; often studied over 4–8 weeks.' },
      { compound: 'Rhodiola', note: 'Morning dosing common; avoid late day if sleep is sensitive.' },
      { compound: 'L-Theanine', note: 'Acute use 100–200 mg; often combined with caffeine for focus-stress balance.' },
    ],
    evidenceRows: [
      { compound: 'Ashwagandha', evidence: 'Moderate to strong', humanData: 'RCTs for stress/anxiety', limitation: 'Thyroid and pregnancy cautions' },
      { compound: 'Rhodiola', evidence: 'Moderate', humanData: 'Fatigue/stress trials', limitation: 'Bipolar-spectrum caution' },
      { compound: 'L-Theanine', evidence: 'Moderate acute', humanData: 'Stress under pressure', limitation: 'Subtle as monotherapy' },
    ],
    safetyBullets: [
      ...sharedSafety,
      'Ashwagandha: review thyroid meds, pregnancy, and autoimmune context.',
    ],
  },
  anxiety: {
    faqItems: [
      {
        question: 'Are natural options a substitute for anxiety treatment?',
        answer:
          'No. This page compares educational options for everyday tension — not panic disorder, GAD, or trauma-related anxiety, which require professional care.',
      },
      {
        question: 'Is kava effective for social anxiety?',
        answer:
          'Kava has moderate human evidence for general anxiety in some trials, but liver risk and motor impairment require strict product quality and abstinence from alcohol.',
      },
      {
        question: 'Can L-theanine help racing thoughts at night?',
        answer:
          'L-theanine is often used for cognitive quieting without strong sedation; evidence is moderate for relaxation-related outcomes but may be too subtle for severe insomnia or panic.',
      },
    ],
    dosingNotes: [
      { compound: 'L-Theanine', note: '100–400 mg/day split possible; start low.' },
      { compound: 'Ashwagandha', note: 'Extract-specific; allow weeks for cortisol-related endpoints.' },
      { compound: 'Kava', note: 'Only reputable CO2 or aqueous extracts; avoid if liver disease or heavy alcohol use.' },
    ],
    evidenceRows: [
      { compound: 'Ashwagandha', evidence: 'Moderate to strong', humanData: 'Anxiety scales', limitation: 'Not for acute panic' },
      { compound: 'Kava', evidence: 'Moderate to strong', humanData: 'GAD contexts in trials', limitation: 'Hepatotoxicity risk' },
      { compound: 'L-Theanine', evidence: 'Moderate', humanData: 'Acute stress paradigms', limitation: 'Mild effect size' },
    ],
    safetyBullets: [
      ...sharedSafety,
      'Kava: liver monitoring; no alcohol. Serotonergic stacks need professional review.',
    ],
  },
  focus: {
    faqItems: [
      {
        question: 'Caffeine vs L-theanine vs bacopa — how do they differ for focus?',
        answer:
          'Caffeine is a fast-acting stimulant that blocks adenosine for quick wakefulness. L-Theanine smooths out caffeine jitters, promoting calm attention when paired. Bacopa is a non-stimulant adaptogen that takes 4–12 weeks of daily dosing to build memory and learning rates. See our dedicated 3-way focus comparison guide.',
      },
      {
        question: 'What is the best non-stimulant focus supplement?',
        answer:
          'L-theanine (often with caffeine) and rhodiola are common non-stimulant or low-stimulant choices. Bacopa targets memory over weeks, not acute focus.',
      },
      {
        question: 'Will caffeine help focus without side effects?',
        answer:
          'Caffeine has strong acute evidence for vigilance but commonly disrupts sleep and increases anxiety in sensitive users. Pairing with L-theanine is a frequent strategy to smooth stimulation.',
      },
    ],
    dosingNotes: [
      { compound: 'Caffeine', note: 'Dose by tolerance; avoid late-day use if sleep is a goal.' },
      { compound: 'L-Theanine', note: 'Often 2:1 theanine:caffeine ratio in studies; adjust individually.' },
      { compound: 'Bacopa', note: 'Weeks-long protocols; GI upset can occur early.' },
    ],
    evidenceRows: [
      { compound: 'Caffeine', evidence: 'Strong acute', humanData: 'Vigilance RCTs', limitation: 'Sleep and anxiety tradeoffs' },
      { compound: 'L-Theanine', evidence: 'Moderate', humanData: 'Attention with caffeine', limitation: 'Subtle alone' },
      { compound: 'Rhodiola', evidence: 'Moderate', humanData: 'Fatigue under stress', limitation: 'Overstimulation in some users' },
      { compound: 'Bacopa Monnieri', evidence: 'Moderate', humanData: 'Learning/memory RCTs', limitation: 'Takes 4–12 weeks; potential GI upset' },
    ],
    safetyBullets: sharedSafety,
  },
}

export function getGoalContentExtension(slug: string): GoalContentExtension | null {
  return goalContentBySlug[slug] ?? null
}

export function getGoalFaqItems(
  slug: string,
  fallback: GoalFaqItem[],
): GoalFaqItem[] {
  const extension = goalContentBySlug[slug]
  if (extension?.faqItems.length) return extension.faqItems
  return fallback
}