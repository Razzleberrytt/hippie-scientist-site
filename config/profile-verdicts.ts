/**
 * Editorial verdict overlay for herb/compound profiles.
 *
 * This is an OPT-IN editorial layer, keyed by slug. It is NOT workbook data and
 * never overrides structured facts — the workbook remains the source of truth
 * for evidence grades, safety flags, dosing, etc. This file only holds the
 * curated editorial *judgement* (recommendation, best/not-ideal framing,
 * a better alternative, comparison routing, bottom line) that data alone
 * cannot express.
 *
 * A profile with no entry here still renders a derived decision surface
 * (evidence + safety + intent-based "continue reading") — see
 * `lib/profile-decision.ts`. Adding an entry upgrades that profile to a full
 * Scientific Verdict with zero template changes.
 *
 * Rules:
 * - Never invent facts. Only summarize what the profile/article already supports.
 * - Keep it honest: use "No" / "Situation-dependent" and a real "not ideal for".
 * - Educational framing only — no dosing directives, no medical advice, and
 *   never tell anyone to start or stop a prescribed medication.
 * - `betterAlternative.href` and every `comparisons[].href` must be a real route.
 *   The list of verified comparison routes is checked in when entries are added.
 */

export type ProfileVerdictOverlay = {
  recommendation: 'Yes' | 'Maybe' | 'No' | 'Situation-dependent'
  /** One-line confidence read (e.g. "Moderate — several human trials, small sizes"). */
  confidence?: string
  bestFor: string[]
  notIdealFor: string[]
  onset?: string
  evaluationWindow?: string
  bottomLine: string
  /** Short safety flag surfaced with the verdict (educational, not exhaustive). */
  safetyNote?: string
  /** One line on the strength/shape of the evidence base. */
  evidenceNote?: string
  /**
   * Structured "why is the evidence graded this way" explainer, rendered via the
   * shared `EvidenceConfidence` component. Use it on the highest-value profiles
   * to turn a bare grade into a calibrated, honest read. Never fabricate reasons.
   */
  evidenceConfidence?: {
    grade: string
    whyNotHigher: string[]
    whyNotLower?: string[]
    practicalTakeaway: string
  }
  betterAlternative?: { label: string; href: string; reason?: string }
  /**
   * The single safest "start here" guide for this profile's primary goal — the
   * decision-graph entry point (problem → hub → *this guide* → verdict). Rendered
   * as a prominent "Start here" step. Must be a real route.
   */
  primaryGuide?: { label: string; href: string }
  /**
   * "Compare before choosing" routing. Only surface comparison guides that
   * actually exist. `when` describes the reader for whom the comparison matters.
   */
  comparisons?: { label: string; href: string; when: string }[]
}

export const PROFILE_VERDICTS: Record<string, ProfileVerdictOverlay> = {
  // ══ Stress / Adaptogens (herbs) ═══════════════════════════════════════════
  ashwagandha: {
    recommendation: 'Yes',
    confidence: 'Moderate–strong — the most-replicated adaptogen in human trials',
    bestFor: [
      'Chronic stress with anxiety',
      'Stress-related sleep disruption',
      'High cortisol — feeling "wired but tired"',
    ],
    notIdealFor: [
      'Acute anxiety or panic (works over weeks, not minutes)',
      'A same-night sleep aid',
      'Pregnancy, thyroid disease, or use with sedatives',
    ],
    onset: 'Gradual — first shifts in 2–4 weeks',
    evaluationWindow: '6–8 weeks',
    bottomLine:
      'The best-studied adaptogen for chronic stress — it lowers cortisol and eases stress-related sleep over weeks. Not a quick fix, and the wrong tool for acute anxiety.',
    safetyNote:
      'Discuss with a clinician first if you have thyroid disease, are pregnant, or take sedatives; rare liver-injury reports exist.',
    evidenceNote: 'Multiple randomized trials for stress and cortisol, though many are small and industry-funded.',
    evidenceConfidence: {
      grade: 'Moderate–high',
      whyNotHigher: [
        'Many trials are small and industry-funded',
        'Extracts and doses differ between studies',
        'Long-term (12+ month) safety data is limited',
      ],
      whyNotLower: [
        'Several randomized, placebo-controlled trials exist',
        'Results point consistently toward lower stress and cortisol',
        'Short-term tolerability is well characterized in healthy adults',
      ],
      practicalTakeaway:
        'Reasonable to try for chronic stress over 6–8 weeks. It is a support, not a treatment for a diagnosed anxiety or mood disorder — involve a clinician for those.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for acute, in-the-moment calm',
    },
    primaryGuide: { label: 'Ashwagandha for anxiety & stress', href: '/guides/anxiety/ashwagandha-for-anxiety/' },
    comparisons: [
      {
        label: 'Ashwagandha vs. Rhodiola',
        href: '/guides/compare/rhodiola-vs-ashwagandha/',
        when: 'stress comes with fatigue and burnout, not just tension',
      },
      {
        label: 'Ashwagandha vs. CBD for anxiety',
        href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
        when: 'anxiety is your main target',
      },
      {
        label: 'Ashwagandha vs. L-theanine vs. Magnesium',
        href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
        when: 'deciding where to start for stress and sleep',
      },
    ],
  },

  rhodiola: {
    recommendation: 'Maybe',
    confidence: 'Modest — promising for fatigue, mixed and smaller for mood',
    bestFor: [
      'Stress paired with fatigue or burnout',
      'Mental tiredness and low drive',
      'Daytime energy without stimulants',
    ],
    notIdealFor: [
      'Night-time calm or sleep (it can be activating)',
      'Acute anxiety',
      'Bipolar spectrum conditions without guidance',
    ],
    onset: 'Days to ~2 weeks',
    evaluationWindow: '3–6 weeks',
    bottomLine:
      'A daytime adaptogen aimed at stress-driven fatigue rather than tension. Take it earlier in the day — it can be too activating for evening use.',
    safetyNote:
      'Can be over-stimulating and disrupt sleep if taken late; discuss with a clinician if you have a bipolar-spectrum condition or take stimulants or antidepressants.',
    evidenceNote: 'Several human trials for fatigue and stress, but heterogeneous extracts and small samples.',
    evidenceConfidence: {
      grade: 'Limited–moderate',
      whyNotHigher: [
        'Extracts and rosavin/salidroside content vary widely between products',
        'Trials are small and results are inconsistent',
        'Strongest signal is for fatigue, weaker for mood or anxiety',
      ],
      whyNotLower: [
        'Several human trials point toward reduced fatigue under stress',
        'A plausible mechanism and a long traditional-use history',
      ],
      practicalTakeaway:
        'Reasonable to try for stress-driven fatigue, taken earlier in the day. Treat it as mild support, not a primary treatment for a mood or anxiety condition.',
    },
    primaryGuide: { label: 'Best adaptogens for stress', href: '/guides/anxiety/best-adaptogens-for-stress/' },
    comparisons: [
      {
        label: 'Rhodiola vs. Ashwagandha',
        href: '/guides/compare/rhodiola-vs-ashwagandha/',
        when: 'choosing between energizing and calming adaptogens',
      },
    ],
  },

  saffron: {
    recommendation: 'Maybe',
    confidence: 'Moderate for mood — a genuinely interesting evidence base',
    bestFor: ['Low mood and mild depressive symptoms', 'Mood support with a food-grade botanical'],
    notIdealFor: ['Acute anxiety relief', 'A sleep aid', 'Replacing prescribed treatment'],
    onset: '2–4 weeks',
    evaluationWindow: '6–8 weeks',
    bottomLine:
      'One of the more compelling botanicals for mild low mood, with several controlled trials. It works slowly and is a support, not a substitute for care.',
    safetyNote: 'High doses can cause side effects; keep to culinary/standardized amounts and involve a clinician for depression.',
    evidenceNote: 'Multiple randomized trials for depressive symptoms, mostly small and short.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Trials are small, short, and often industry-linked',
        'Standardized extracts differ from culinary saffron',
        'Long-term data is limited',
      ],
      whyNotLower: [
        'Multiple randomized, placebo-controlled trials for mild low mood',
        'Effects are directionally consistent across studies',
      ],
      practicalTakeaway:
        'A reasonable food-grade option for mild low mood over 6–8 weeks. It is a support, not a substitute for care — involve a clinician for depression.',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
    comparisons: [
      {
        label: 'Beyond ashwagandha: other anxiolytics',
        href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
        when: 'mood overlaps with anxiety',
      },
    ],
  },

  // ══ Calm / Anxiety (compounds + herbs) ════════════════════════════════════
  'l-theanine': {
    recommendation: 'Yes',
    confidence: 'Moderate — consistent small trials for acute calm and attention',
    bestFor: [
      'Caffeine jitters',
      'Racing thoughts at bedtime',
      'Mild situational anxiety (presentations, exams)',
      'Calm focus without sedation',
    ],
    notIdealFor: ['Severe insomnia', 'Panic attacks', 'Chronic baseline stress alone'],
    onset: '30–40 minutes',
    evaluationWindow: 'Same day to 2 weeks',
    bottomLine:
      'A strong first choice for calm without sedation — smoothing caffeine and quieting a busy mind. Not the best primary tool for chronic stress or severe anxiety.',
    safetyNote: 'Among the best-tolerated options here; still pair with care if you take sedatives or blood-pressure medication.',
    evidenceNote: 'Small human trials for stress reactivity and attention; effects are real but modest.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Most trials are small and short',
        'Effect sizes are modest',
        'Benefits are clearest when paired with caffeine, less so alone',
      ],
      whyNotLower: [
        'Multiple human trials point the same direction',
        'The mechanism (alpha-wave activity, glutamate modulation) is plausible',
        'One of the best-tolerated options with a wide safety margin',
      ],
      practicalTakeaway:
        'A sensible first thing to try for situational calm or caffeine jitters. It is not a treatment for a diagnosed anxiety disorder.',
    },
    betterAlternative: {
      label: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      reason: 'for chronic baseline stress',
    },
    primaryGuide: { label: 'L-theanine for anxiety & calm', href: '/guides/anxiety/l-theanine-for-anxiety/' },
    comparisons: [
      {
        label: 'L-theanine + caffeine for focus',
        href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
        when: 'you pair it with coffee for work',
      },
      {
        label: 'Ashwagandha vs. L-theanine vs. Magnesium',
        href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
        when: 'deciding where to start for stress',
      },
    ],
  },

  // Keyed by botanical slug: the indexed page is the herb (/herbs/kava/), whose
  // record slug is `piper-methysticum`. The `kava` compound page is a noindex
  // canonical redirect. An alias below also maps the `kava` slug.
  'piper-methysticum': {
    recommendation: 'Situation-dependent',
    confidence: 'Moderate for anxiety — but the safety profile drives the verdict',
    bestFor: ['Short-term situational anxiety', 'Acute tension when non-sedating options fall short'],
    notIdealFor: [
      'Daily long-term use',
      'Anyone with liver concerns or on hepatotoxic medications',
      'Combining with alcohol or sedatives',
    ],
    onset: '30–60 minutes',
    evaluationWindow: 'Short-term, occasional use only',
    bottomLine:
      'Genuinely effective for acute anxiety, but liver-safety concerns make it a short-term, carefully-sourced choice rather than a daily habit.',
    safetyNote:
      'Rare but serious liver injury is reported. Avoid with alcohol, other sedatives, or existing liver conditions; involve a clinician.',
    evidenceNote: 'Meta-analyses support short-term anxiolytic effects; safety signals limit routine use.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Rare but serious liver-injury reports shape the risk picture',
        'Long-term daily-use safety data is limited',
        'Product quality (cultivar, extraction) varies widely',
      ],
      whyNotLower: [
        'Multiple randomized trials and meta-analyses show a real anxiolytic effect',
        'Short-term effects are relatively fast and consistent',
        'Water-extracted noble cultivars have a better-understood safety profile',
      ],
      practicalTakeaway:
        'For occasional, short-term situational anxiety with a carefully sourced product — not a daily habit. Avoid with alcohol, sedatives, or existing liver concerns, and involve a clinician.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for lower-risk everyday calm',
    },
    primaryGuide: { label: 'Anxiolytics beyond ashwagandha', href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/' },
    comparisons: [
      {
        label: 'Kava vs. alcohol',
        href: '/guides/compare/kava-vs-alcohol/',
        when: 'using it to unwind socially',
      },
      {
        label: 'Beyond ashwagandha: other anxiolytics',
        href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
        when: 'you want a lower-risk daily option',
      },
    ],
  },

  lavender: {
    recommendation: 'Maybe',
    confidence: 'Moderate — standardized oral preparations have real trial support',
    bestFor: ['Mild-to-moderate everyday anxiety', 'Restlessness with a low-risk profile'],
    notIdealFor: ['Panic or severe anxiety', 'A reliable sleep sedative on its own'],
    onset: '1–2 weeks',
    evaluationWindow: '4–6 weeks',
    bottomLine:
      'Standardized oral lavender has surprisingly solid trials for mild anxiety and is well tolerated. Aromatherapy effects are gentler and less consistent.',
    evidenceNote: 'Randomized trials of standardized oral lavender show anxiolytic effects comparable to low-dose reference agents.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'The good evidence is for one standardized oral preparation, not lavender generally',
        'Aromatherapy evidence is much weaker',
        'Most trials are short',
      ],
      whyNotLower: [
        'Randomized trials show a real anxiolytic effect for standardized oral lavender',
        'It is well tolerated with a low-risk profile',
      ],
      practicalTakeaway:
        'A reasonable low-risk option for mild everyday anxiety if you use a standardized oral product. Not a substitute for care in severe anxiety.',
    },
    primaryGuide: { label: 'Best herbs for anxiety', href: '/guides/anxiety/best-herbs-for-anxiety/' },
    comparisons: [
      {
        label: 'Beyond ashwagandha: other anxiolytics',
        href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
        when: 'comparing gentle daytime calming options',
      },
    ],
  },

  'lemon-balm': {
    recommendation: 'Maybe',
    confidence: 'Early — small trials, promising for mild stress',
    bestFor: ['Mild stress and restlessness', 'Gentle evening wind-down', 'Pairing in a calming stack'],
    notIdealFor: ['Significant anxiety or insomnia alone', 'Fast, strong relief'],
    onset: '30–60 minutes (acute); days for daily use',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'A gentle calming herb best used for mild stress or as part of a stack. Real but subtle — do not expect heavy sedation.',
    evidenceNote: 'Small human trials suggest mild mood and stress benefits; evidence base is thin.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Human trials are few, small, and short',
        'Many studies use lemon balm inside a blend, not alone',
      ],
      whyNotLower: [
        'The small trials that exist point toward mild stress and mood benefit',
        'Long traditional use and a benign safety profile',
      ],
      practicalTakeaway:
        'Best treated as a gentle, low-stakes option or stack ingredient for mild stress — not a primary intervention for significant anxiety or insomnia.',
    },
    primaryGuide: { label: 'Best herbs for anxiety', href: '/guides/anxiety/best-herbs-for-anxiety/' },
    comparisons: [
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'you want it mainly for sleep',
      },
      {
        label: 'Beyond ashwagandha: other anxiolytics',
        href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
        when: 'comparing gentle calming herbs',
      },
    ],
  },

  // Keyed by botanical slug: the indexed page is the herb
  // (/herbs/passionflower/), whose record slug is `passiflora-incarnata`. Alias
  // below also maps the `passionflower` slug.
  'passiflora-incarnata': {
    recommendation: 'Maybe',
    confidence: 'Early–moderate — a handful of supportive small trials',
    bestFor: ['Mild anxiety with restlessness', 'Occasional trouble winding down at night'],
    notIdealFor: ['Severe insomnia', 'Panic attacks', 'A same-strength benzodiazepine substitute'],
    onset: '30–60 minutes',
    evaluationWindow: '1–4 weeks',
    bottomLine:
      'A mild, calming herb with modest trial support for anxiety and sleep onset. Best as a gentle option or stack ingredient, not a heavyweight sedative.',
    safetyNote:
      'Can add to the sedation of alcohol or other sleep aids; avoid in pregnancy and discuss with a clinician before combining with sedatives.',
    evidenceNote: 'Small randomized trials for anxiety and sleep; effects are modest.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Trials are small and often combine passionflower with other herbs',
        'Preparations and doses vary',
        'Effects are modest',
      ],
      whyNotLower: [
        'A few randomized trials support mild anxiety and sleep-onset benefit',
        'Long traditional use and good tolerability',
      ],
      practicalTakeaway:
        'A gentle option for mild anxiety or trouble winding down, best as a stack ingredient rather than a stand-alone fix for significant insomnia.',
    },
    primaryGuide: { label: 'Best herbs for anxiety', href: '/guides/anxiety/best-herbs-for-anxiety/' },
    comparisons: [
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'choosing a sleep-onset aid',
      },
      {
        label: 'Beyond ashwagandha: other anxiolytics',
        href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
        when: 'anxiety is the main target',
      },
    ],
  },

  chamomile: {
    recommendation: 'Maybe',
    confidence: 'Early — some trial support for generalized anxiety',
    bestFor: ['Mild everyday anxiety', 'A calming evening ritual', 'Very gentle wind-down'],
    notIdealFor: ['Strong sedation for insomnia', 'Ragweed-allergic individuals'],
    onset: '30–45 minutes',
    evaluationWindow: '2–8 weeks',
    bottomLine:
      'Gentle and pleasant, with a little trial support for generalized anxiety. Effects are subtle — value it as a low-risk ritual rather than a strong sleep aid.',
    safetyNote: 'Can trigger reactions in people allergic to ragweed/daisy family; may interact with anticoagulants.',
    evidenceNote: 'Limited randomized trials for generalized anxiety; sleep evidence is weaker.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Only a handful of trials, mostly small',
        'Sleep evidence is weaker than the (already limited) anxiety evidence',
      ],
      whyNotLower: [
        'One reasonable trial supports a mild effect on generalized anxiety',
        'Very low risk for most people and a pleasant daily ritual',
      ],
      practicalTakeaway:
        'Value it as a calming, low-risk ritual for mild anxiety rather than a reliable sleep aid. Skip it if you are allergic to the ragweed/daisy family.',
    },
    primaryGuide: { label: 'Best herbs for anxiety', href: '/guides/anxiety/best-herbs-for-anxiety/' },
    comparisons: [
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'you want it mainly for sleep',
      },
    ],
  },

  // ══ Sleep (compounds + herbs) ═════════════════════════════════════════════
  magnesium: {
    recommendation: 'Yes',
    confidence: 'Moderate — strongest when correcting low intake, softer otherwise',
    bestFor: ['General relaxation and sleep support', 'Correcting a low-magnesium diet', 'A low-risk nightly base'],
    notIdealFor: ['A fast knockout sedative', 'Severe insomnia on its own'],
    onset: 'Days to a couple of weeks',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'A sensible, low-risk foundation for sleep and relaxation — especially if intake is low. The specific form matters more than most people realize.',
    safetyNote: 'Generally well tolerated; high doses loosen stools. Caution with kidney impairment.',
    evidenceNote: 'Evidence is strongest for repletion; benefits in already-replete people are smaller.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'The strongest results are in people who were low to begin with',
        'Trials use different forms, doses, and populations',
        'Effects on sleep are real but modest, not dramatic',
      ],
      whyNotLower: [
        'Human trials support relaxation and sleep-quality benefits',
        'The mechanism is well understood',
        'Very favorable safety and cost',
      ],
      practicalTakeaway:
        'A low-risk nightly foundation worth trying, especially if dietary intake is low. Pick the form deliberately and give it a couple of weeks.',
    },
    primaryGuide: { label: 'Magnesium for sleep', href: '/guides/sleep/magnesium-for-sleep/' },
    comparisons: [
      {
        label: 'Which magnesium for sleep?',
        href: '/guides/sleep/best-magnesium-for-sleep/',
        when: 'you are not sure which form to buy',
      },
      {
        label: 'Magnesium vs. melatonin',
        href: '/guides/sleep/magnesium-vs-melatonin/',
        when: 'choosing your primary sleep aid',
      },
      {
        label: 'Magnesium forms compared',
        href: '/guides/sleep/magnesium-types-for-sleep/',
        when: 'glycinate vs. citrate vs. threonate matters to you',
      },
    ],
  },

  'magnesium-glycinate': {
    recommendation: 'Yes',
    confidence: 'Moderate — the best-tolerated form for nightly use',
    bestFor: ['Nightly relaxation and sleep support', 'People who get loose stools from other forms', 'A gentle evening base'],
    notIdealFor: ['A same-night sedative', 'Severe insomnia alone'],
    onset: 'Days to a couple of weeks',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'The form most people should reach for at night — well absorbed and gentle on the gut. A steady base layer rather than a knockout.',
    safetyNote: 'Very well tolerated; still use caution with kidney impairment.',
    evidenceNote: 'Glycinate is favored for tolerability; head-to-head sleep data across forms is limited.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Little head-to-head trial data pits glycinate against other forms',
        'Most magnesium sleep evidence is not form-specific',
        'Effects are modest, not sedative-strength',
      ],
      whyNotLower: [
        'Magnesium repletion has real, well-understood benefits',
        'Glycinate is reliably well absorbed and gentle on the gut',
        'Very favorable safety and cost',
      ],
      practicalTakeaway:
        'The most sensible default form for a nightly base — gentle and easy to tolerate. Judge it over a couple of weeks rather than in one night.',
    },
    primaryGuide: { label: 'Best magnesium for sleep', href: '/guides/sleep/best-magnesium-for-sleep/' },
    comparisons: [
      {
        label: 'Magnesium forms compared',
        href: '/guides/sleep/magnesium-types-for-sleep/',
        when: 'weighing glycinate against other forms',
      },
      {
        label: 'Magnesium vs. melatonin',
        href: '/guides/sleep/magnesium-vs-melatonin/',
        when: 'choosing your primary sleep aid',
      },
    ],
  },

  melatonin: {
    recommendation: 'Situation-dependent',
    confidence: 'Strong for timing (jet lag, delayed sleep phase); weak for general insomnia',
    bestFor: ['Jet lag', 'Delayed sleep phase / shifted clock', 'Resetting a disrupted schedule'],
    notIdealFor: ['Staying asleep through the night', 'Everyday "can\'t switch off" insomnia', 'A relaxation aid'],
    onset: '30–60 minutes (timing-dependent)',
    evaluationWindow: 'A few nights for circadian use',
    bottomLine:
      'A timing signal, not a sedative. Excellent for jet lag and shifted clocks at low doses; underwhelming for ordinary insomnia, where lower doses often beat higher ones.',
    safetyNote: 'Most people overshoot the dose; more is not better and can cause next-day grogginess. Use the lowest effective amount and involve a clinician for children or ongoing use.',
    evidenceNote: 'Robust for circadian rhythm timing; effect on general insomnia is small.',
    evidenceConfidence: {
      grade: 'Moderate — split by use case',
      whyNotHigher: [
        'For ordinary insomnia the benefit is small (often minutes)',
        'Over-the-counter doses are frequently far higher than needed',
        'Long-term and pediatric data are limited',
      ],
      whyNotLower: [
        'Strong, consistent evidence for circadian uses (jet lag, delayed sleep phase)',
        'The mechanism (circadian signaling) is well understood',
        'Short-term use is well tolerated in healthy adults',
      ],
      practicalTakeaway:
        'Best matched to a timing problem, at the lowest effective dose. If the issue is "can\'t switch off," a relaxation-first option often fits better. Involve a clinician for children or ongoing use.',
    },
    betterAlternative: {
      label: 'Magnesium',
      href: '/compounds/magnesium/',
      reason: 'for relaxation-type sleep trouble',
    },
    primaryGuide: { label: 'Best supplements for sleep', href: '/guides/sleep/best-supplements-for-sleep/' },
    comparisons: [
      {
        label: 'Magnesium vs. melatonin',
        href: '/guides/sleep/magnesium-vs-melatonin/',
        when: 'unsure which fits your sleep problem',
      },
      {
        label: 'Melatonin vs. valerian vs. magnesium',
        href: '/guides/compare/melatonin-vs-valerian-vs-magnesium-for-sleep/',
        when: 'comparing the main sleep options',
      },
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'deciding between herbs and a hormone',
      },
    ],
  },

  glycine: {
    recommendation: 'Maybe',
    confidence: 'Early — a few small but interesting sleep-quality trials',
    bestFor: ['Improving perceived sleep quality', 'Feeling less groggy the next morning', 'A low-risk add-on'],
    notIdealFor: ['Severe insomnia alone', 'A strong sedative effect'],
    onset: 'Same night to a few nights',
    evaluationWindow: '1–2 weeks',
    bottomLine:
      'An inexpensive, well-tolerated add-on with small trials suggesting better sleep quality and morning alertness. Subtle, not sedating.',
    evidenceNote: 'A handful of small trials on sleep quality; evidence base is limited.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Only a few small trials, several from the same group',
        'Effects are subtle and subjective',
      ],
      whyNotLower: [
        'The small trials that exist point toward better sleep quality and morning alertness',
        'Very low risk and inexpensive',
      ],
      practicalTakeaway:
        'A cheap, low-risk add-on worth a short trial for sleep quality — not a stand-alone fix for significant insomnia.',
    },
    primaryGuide: { label: 'Best supplements for sleep', href: '/guides/sleep/best-supplements-for-sleep/' },
    comparisons: [
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'building a low-risk sleep stack',
      },
    ],
  },

  valerian: {
    recommendation: 'Maybe',
    confidence: 'Mixed — some positive trials, inconsistent overall',
    bestFor: ['Trouble falling asleep', 'People wanting a traditional herbal sedative', 'Occasional use'],
    notIdealFor: ['Reliable, predictable results', 'Fast onset the very first night', 'Use with sedatives or alcohol'],
    onset: 'Often builds over several days to 2 weeks',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'The classic sleep herb, but the evidence is genuinely mixed and effects vary between people and products. Worth a fair trial; do not expect consistency.',
    safetyNote: 'Avoid combining with alcohol or other sedatives; some report grogginess.',
    evidenceNote: 'Trials conflict, partly due to variable extract quality.',
    evidenceConfidence: {
      grade: 'Limited — mixed',
      whyNotHigher: [
        'Trials genuinely conflict',
        'Extract quality and dose vary widely between products',
        'Effects are inconsistent between people',
      ],
      whyNotLower: [
        'Some randomized trials do show a sleep-onset benefit',
        'Long traditional use with an acceptable short-term safety profile',
      ],
      practicalTakeaway:
        'Worth a fair trial for trouble falling asleep, but manage expectations — results vary. Avoid combining with alcohol or other sedatives.',
    },
    primaryGuide: { label: 'Best herbs for sleep', href: '/guides/sleep/best-herbs-for-sleep/' },
    comparisons: [
      {
        label: 'Melatonin vs. valerian vs. magnesium',
        href: '/guides/compare/melatonin-vs-valerian-vs-magnesium-for-sleep/',
        when: 'comparing the main sleep options',
      },
      {
        label: 'Sleep herbs vs. melatonin',
        href: '/guides/sleep/sleep-herbs-vs-melatonin/',
        when: 'choosing between herbs and a hormone',
      },
    ],
  },

  // ══ Focus / Cognition (compounds + herbs) ═════════════════════════════════
  caffeine: {
    recommendation: 'Yes',
    confidence: 'Strong — the best-evidenced cognitive stimulant there is',
    bestFor: ['Alertness and reaction time', 'Pushing through low-energy focus windows', 'Pre-workout drive'],
    notIdealFor: ['Anxiety-prone users at higher doses', 'Late-day use if sleep matters', 'Calm, jitter-free focus alone'],
    onset: '15–45 minutes',
    evaluationWindow: 'Immediate',
    bottomLine:
      'The most reliable cognitive enhancer available — the real questions are dose, timing, and tolerance. Pairing it with L-theanine smooths the jitters.',
    safetyNote: 'Late or high doses wreck sleep and can amplify anxiety; taper rather than stack endlessly.',
    evidenceNote: 'Extensive human evidence for alertness and performance.',
    evidenceConfidence: {
      grade: 'Strong',
      whyNotHigher: [
        'Tolerance builds, so the benefit shrinks with habitual use',
        'The effect is alertness, not deep cognition or learning',
      ],
      whyNotLower: [
        'Large, consistent human evidence for alertness and reaction time',
        'A well-understood mechanism and dose-response',
      ],
      practicalTakeaway:
        'The most reliable focus tool — manage dose and timing, keep it out of the late afternoon, and pair with L-theanine if it makes you jittery.',
    },
    primaryGuide: { label: 'L-theanine + caffeine for focus', href: '/guides/focus/l-theanine-vs-caffeine-for-focus/' },
    comparisons: [
      {
        label: 'Caffeine + L-theanine for focus',
        href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
        when: 'jitters or crashes are a problem',
      },
      {
        label: 'Caffeine vs. L-theanine vs. Bacopa',
        href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
        when: 'building a focus stack',
      },
    ],
  },

  bacopa: {
    recommendation: 'Maybe',
    confidence: 'Moderate for memory — but only with patience',
    bestFor: ['Long-term memory and learning', 'Consistent daily use over months', 'Non-stimulant cognitive support'],
    notIdealFor: ['Same-day focus or alertness', 'Anyone wanting fast results', 'Sensitive stomachs (take with food)'],
    onset: 'Weeks — meaningful effects around 8–12 weeks',
    evaluationWindow: '8–12 weeks',
    bottomLine:
      'A genuine memory herb, but it rewards patience — the trials that work run for months. Useless as a same-day focus tool.',
    safetyNote: 'Can cause GI upset; take with food. May interact with thyroid and sedative medications.',
    evidenceNote: 'Multiple trials show memory benefits over 12 weeks; short-term effects are negligible.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Benefits only appear after ~8–12 weeks of daily use',
        'Effect sizes are modest and mostly on memory/recall',
        'Extracts (e.g. standardized bacosides) differ between products',
      ],
      whyNotLower: [
        'Multiple randomized trials show real memory benefits over 12 weeks',
        'A plausible mechanism and long traditional use',
      ],
      practicalTakeaway:
        'Worth it only if you will commit to daily use for 2–3 months for memory and learning. Useless as a same-day focus tool, and take it with food.',
    },
    primaryGuide: { label: 'Best nootropics for focus', href: '/guides/focus/best-nootropics-for-focus/' },
    comparisons: [
      {
        label: 'Caffeine vs. L-theanine vs. Bacopa',
        href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
        when: 'deciding fast vs. slow cognitive support',
      },
    ],
  },

  'l-tyrosine': {
    recommendation: 'Situation-dependent',
    confidence: 'Narrow — helps under acute stress/sleep loss, not baseline',
    bestFor: ['Cognition under acute stress', 'Sleep-deprived performance windows', 'Demanding, high-pressure tasks'],
    notIdealFor: ['Everyday focus at baseline', 'A general nootropic', 'Reliable mood or motivation lift'],
    onset: '30–60 minutes',
    evaluationWindow: 'Situational — judge per use',
    bottomLine:
      'A precursor that mainly helps when stress or sleep loss has drained you — it restores rather than boosts. Little to offer a well-rested baseline.',
    safetyNote: 'Caution with thyroid conditions and MAOI medications; involve a clinician.',
    evidenceNote: 'Human trials show benefits specifically under acute stressors, not at baseline.',
    evidenceConfidence: {
      grade: 'Limited — situational',
      whyNotHigher: [
        'Benefits show up under acute stress or sleep loss, not at baseline',
        'Trials are small and task-specific',
      ],
      whyNotLower: [
        'Controlled studies do show a real effect under demanding, stressful conditions',
        'A clear, plausible mechanism (dopamine/noradrenaline precursor)',
      ],
      practicalTakeaway:
        'Save it for genuinely draining, high-pressure or sleep-deprived days. It restores depleted performance rather than lifting a well-rested baseline.',
    },
    primaryGuide: { label: 'Best supplements for focus', href: '/guides/focus/best-supplements-for-focus/' },
  },

  creatine: {
    recommendation: 'Yes',
    confidence: 'Strong for muscle; emerging and promising for cognition',
    bestFor: ['Cognitive support under sleep deprivation', 'Strength and training output', 'A high-safety daily staple'],
    notIdealFor: ['A same-day focus stimulant', 'Anyone expecting a fast mental "lift"'],
    onset: 'Days to a few weeks (tissue saturation)',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'One of the safest, best-evidenced supplements there is — long established for training, and increasingly interesting for cognition under stress and sleep loss.',
    safetyNote: 'Very well tolerated; stay hydrated. Discuss with a clinician if you have kidney disease.',
    evidenceNote: 'Extensive evidence for physical performance; cognitive evidence is newer but growing.',
    evidenceConfidence: {
      grade: 'Strong for training; emerging for cognition',
      whyNotHigher: [
        'The cognitive evidence is newer and mostly under stress or sleep deprivation',
        'It is not a same-day mental "lift"',
      ],
      whyNotLower: [
        'One of the most-studied supplements, with extensive safety and performance data',
        'A clear energy-metabolism mechanism, plus growing cognitive trials',
      ],
      practicalTakeaway:
        'A very safe daily staple. Expect reliable training benefits; treat the cognitive upside — clearest when sleep-deprived — as a promising bonus.',
    },
    primaryGuide: { label: 'Best supplements for focus', href: '/guides/focus/best-supplements-for-focus/' },
  },

  // ══ Batch 2 — next 10 money-cluster overlays ══════════════════════════════
  // ── Anxiety / mood ────────────────────────────────────────────────────────
  '5-htp': {
    recommendation: 'Situation-dependent',
    confidence: 'Limited — small trials for mood and appetite, real interaction risk',
    bestFor: ['Low mood tied to low serotonin', 'Appetite and emotional-eating support', 'Occasional help falling asleep'],
    notIdealFor: [
      'Anyone taking an SSRI, SNRI, MAOI, triptan, or other serotonergic drug',
      'A primary anxiety tool',
      'Long-term daily use without guidance',
    ],
    onset: 'Days to a few weeks',
    evaluationWindow: '4–6 weeks',
    bottomLine:
      'A serotonin precursor with small trials for mood, appetite, and sleep onset — but its interaction with antidepressants is the headline. Treat it as short-term and clinician-guided, not a casual daily habit.',
    safetyNote:
      'Serotonin-syndrome risk when combined with SSRIs, SNRIs, MAOIs, triptans, or other serotonergic medication; discuss with a clinician before use.',
    evidenceNote: 'Some small human trials for depression and appetite; safety concerns limit routine use.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Trials are small and short',
        'The interaction risk with antidepressants is significant',
        'Long-term safety data is thin',
      ],
      whyNotLower: [
        'A clear mechanism (serotonin precursor)',
        'Some randomized evidence for mood and appetite',
      ],
      practicalTakeaway:
        'Only consider it if you are not on any serotonergic medication, for short-term use, ideally with a clinician. For everyday calm, a lower-risk option fits better.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for lower-risk everyday calm',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
  },

  gaba: {
    recommendation: 'Maybe',
    confidence: 'Limited — whether oral GABA reaches the brain is debated',
    bestFor: ['Mild situational stress', 'A low-risk thing to try for tension', 'Pairing in a calming stack'],
    notIdealFor: ['Significant anxiety or insomnia', 'Anyone wanting a reliable, predictable effect'],
    onset: '30–60 minutes (if it works for you)',
    evaluationWindow: '1–2 weeks',
    bottomLine:
      'Supplemental GABA is popular, but whether much of it crosses the blood–brain barrier is genuinely unsettled — some report calm, possibly via the gut. A low-risk experiment, not a dependable tool.',
    safetyNote: 'Generally well tolerated; can add to the effect of sedatives.',
    evidenceNote: 'Small trials and a debated mechanism; effects are inconsistent.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'It is unclear how much oral GABA reaches the brain',
        'Trials are small and mixed',
      ],
      whyNotLower: [
        'A few small studies report reduced stress markers',
        'A gut–brain pathway is plausible, and the risk is low',
      ],
      practicalTakeaway:
        'Fine as a low-stakes experiment for mild tension. If you want better-evidenced calm, start elsewhere.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for better-evidenced calm without sedation',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
  },

  inositol: {
    recommendation: 'Maybe',
    confidence: 'Limited–moderate — some panic/anxiety trials, but at large doses',
    bestFor: ['Panic and anxiety symptoms', 'Mood support', 'PCOS-related metabolic goals (myo-inositol)'],
    notIdealFor: ['Fast, in-the-moment relief', 'Anyone wanting a small, convenient dose'],
    onset: '2–4 weeks',
    evaluationWindow: '4–6 weeks',
    bottomLine:
      'One of the more interesting options for panic and anxiety, with some randomized support — but effective doses are large (grams), which is the practical catch.',
    safetyNote: 'Usually well tolerated; high doses can cause mild GI upset. Involve a clinician for a diagnosed condition.',
    evidenceNote: 'Small randomized trials for panic and anxiety; effective doses are high.',
    evidenceConfidence: {
      grade: 'Limited–moderate',
      whyNotHigher: [
        'Trials are small',
        'Effective doses are large and inconvenient',
        'Results vary by condition',
      ],
      whyNotLower: [
        'Several randomized trials support a real effect on panic and anxiety',
        'A plausible mechanism and a benign safety profile',
      ],
      practicalTakeaway:
        'Reasonable to try over several weeks for panic-type anxiety if you can tolerate the large dose. Not a fast-acting rescue tool.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for acute, in-the-moment calm',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
  },

  'n-acetylcysteine': {
    recommendation: 'Situation-dependent',
    confidence: 'Emerging — best evidence is for compulsive behaviors, not general anxiety',
    bestFor: ['Compulsive behaviors (hair-pulling, skin-picking)', 'Glutathione / antioxidant support', 'An adjunct alongside professional care'],
    notIdealFor: ['Everyday anxiety, sleep, or focus', 'A fast calming agent', 'A stand-alone treatment'],
    onset: 'Weeks',
    evaluationWindow: '8–12 weeks',
    bottomLine:
      'NAC is a glutathione precursor whose most interesting mental-health evidence is for compulsive behaviors — not general calm. Think of it as a targeted adjunct, not an anxiety or focus staple.',
    safetyNote: 'Generally well tolerated; can cause GI upset. Discuss with a clinician if you take other medication.',
    evidenceNote: 'Emerging trials for compulsive/repetitive behaviors; broader mental-health evidence is mixed.',
    evidenceConfidence: {
      grade: 'Limited–moderate (narrow)',
      whyNotHigher: [
        'The strongest signal is narrow (compulsive behaviors), not general anxiety',
        'Broader psychiatric trials are mixed',
      ],
      whyNotLower: [
        'Several randomized trials support a role in compulsive behaviors',
        'A well-understood biochemical mechanism and good tolerability',
      ],
      practicalTakeaway:
        'Consider it as an adjunct for compulsive behaviors with professional guidance. It is not the tool for everyday stress, sleep, or focus.',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
  },

  apigenin: {
    recommendation: 'Maybe',
    confidence: 'Preliminary — mostly preclinical, little human data on isolated apigenin',
    bestFor: ['Mild pre-sleep calm', 'Exploring chamomile’s active flavonoid', 'A gentle stack ingredient'],
    notIdealFor: ['Significant insomnia or anxiety', 'Anyone expecting real sedation'],
    onset: '~1 hour',
    evaluationWindow: '1–2 weeks',
    bottomLine:
      'Apigenin is the flavonoid behind chamomile’s calming reputation, but most evidence is preclinical — as an isolated supplement it is a gentle experiment, not a proven sleep aid.',
    evidenceNote: 'Largely preclinical; human data on isolated apigenin is sparse.',
    evidenceConfidence: {
      grade: 'Preliminary',
      whyNotHigher: [
        'Most evidence is animal/cell, not human',
        'Little data on isolated apigenin as a supplement',
      ],
      whyNotLower: [
        'A plausible mechanism and the long track record of chamomile',
        'Low risk at culinary/supplemental amounts',
      ],
      practicalTakeaway:
        'A low-stakes option for mild pre-sleep calm. For better-evidenced help, magnesium or L-theanine are stronger starting points.',
    },
    betterAlternative: {
      label: 'Magnesium',
      href: '/compounds/magnesium/',
      reason: 'for a better-evidenced, low-risk sleep base',
    },
    primaryGuide: { label: 'Natural sleep aids that work', href: '/guides/sleep/best-natural-sleep-aids-that-work/' },
  },

  taurine: {
    recommendation: 'Maybe',
    confidence: 'Limited — calming evidence is thin; most data is in other domains',
    bestFor: ['Mild calming as part of a stack', 'Energy-formula and exercise contexts', 'A low-risk amino acid to try'],
    notIdealFor: ['A primary anxiety, sleep, or focus intervention', 'Anyone expecting a strong effect'],
    onset: 'Variable',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'Taurine is a well-tolerated amino acid with inhibitory, calming activity, but the human evidence for stress or focus specifically is thin — it is a supporting player, not a headliner.',
    safetyNote: 'Very well tolerated at common doses.',
    evidenceNote: 'Most human evidence is cardiovascular/exercise-related; calming evidence is limited.',
    evidenceConfidence: {
      grade: 'Limited',
      whyNotHigher: [
        'Little direct human evidence for anxiety or focus',
        'Most trials are in unrelated domains',
      ],
      whyNotLower: [
        'A plausible calming (inhibitory) mechanism',
        'An excellent safety and tolerability profile',
      ],
      practicalTakeaway:
        'Fine as a low-risk supporting ingredient. If calm focus is the goal, a better-evidenced option should lead.',
    },
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for better-evidenced calm focus',
    },
    primaryGuide: { label: 'Natural anxiety & mood relief', href: '/guides/anxiety/natural-anxiety-relief/' },
  },

  // ── Stress / adaptogens ───────────────────────────────────────────────────
  'tongkat-ali': {
    recommendation: 'Maybe',
    confidence: 'Limited–moderate — small trials for stress and hormonal markers',
    bestFor: ['Stress paired with fatigue or low drive', 'Male vitality and energy interest', 'Stress–hormone balance'],
    notIdealFor: [
      'Acute anxiety or a same-day calm',
      'A sleep aid',
      'Hormone-sensitive conditions without medical guidance',
    ],
    onset: '2–4 weeks',
    evaluationWindow: '4–8 weeks',
    bottomLine:
      'A traditional adaptogen with small trials suggesting it eases stress and nudges hormonal markers — promising but under-studied, and product quality varies a lot.',
    safetyNote:
      'Product adulteration is a known issue; choose tested brands. Use caution with hormone-sensitive conditions and discuss with a clinician if you take medication.',
    evidenceNote: 'Small human trials for stress, mood, and testosterone; larger, independent studies are lacking.',
    evidenceConfidence: {
      grade: 'Limited–moderate',
      whyNotHigher: [
        'Trials are small and often industry-linked',
        'Product quality and standardization vary widely',
        'Independent replication is limited',
      ],
      whyNotLower: [
        'Several randomized trials point toward reduced stress and improved hormonal markers',
        'A coherent adaptogenic rationale',
      ],
      practicalTakeaway:
        'Reasonable to trial for stress-with-fatigue over several weeks using a tested product. For the best-studied stress adaptogen, start with ashwagandha.',
    },
    betterAlternative: {
      label: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      reason: 'for the best-studied stress adaptogen',
    },
    primaryGuide: { label: 'Best adaptogens for stress', href: '/guides/anxiety/best-adaptogens-for-stress/' },
  },

  phosphatidylserine: {
    recommendation: 'Maybe',
    confidence: 'Limited–moderate — older cognition trials plus some cortisol data',
    bestFor: ['Stress-related cortisol', 'Cognitive support with aging', 'Exercise-stress recovery'],
    notIdealFor: ['Acute anxiety', 'Same-day focus', 'Young, healthy users expecting large gains'],
    onset: 'Weeks',
    evaluationWindow: '6–12 weeks',
    bottomLine:
      'Phosphatidylserine has older trials for memory and some data on blunting stress cortisol — a plausible, low-risk option, though much of the best evidence used formulations no longer common.',
    safetyNote: 'Generally well tolerated; discuss with a clinician if you take blood thinners.',
    evidenceNote: 'Some cognition and cortisol trials, several older and small; soy-derived differs from earlier bovine sources.',
    evidenceConfidence: {
      grade: 'Limited–moderate',
      whyNotHigher: [
        'Much of the strongest data is older and used different source material',
        'Modern soy-derived trials are smaller',
        'Effects are modest',
      ],
      whyNotLower: [
        'Multiple trials support memory and stress-cortisol benefits',
        'A clear role in cell-membrane and neuronal function',
      ],
      practicalTakeaway:
        'A reasonable, low-risk trial for stress-cortisol or age-related cognition over 6–12 weeks. Not a fast focus tool.',
    },
    betterAlternative: {
      label: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      reason: 'for the best-studied cortisol/stress option',
    },
    primaryGuide: { label: 'Best nootropics for focus', href: '/guides/focus/best-nootropics-for-focus/' },
  },

  // ── Focus / cognition ─────────────────────────────────────────────────────
  // Keyed by botanical slug: the indexed page is the herb
  // (/herbs/hericium-erinaceus/), the canonical for Lion's Mane. Alias below
  // also maps the `lions-mane` slug.
  'hericium-erinaceus': {
    recommendation: 'Maybe',
    confidence: 'Limited–moderate — small human trials, mostly preclinical mechanism',
    bestFor: ['Long-term cognitive support', 'A non-stimulant nootropic', 'Mood and nerve-health interest'],
    notIdealFor: ['Same-day focus or alertness', 'Anyone wanting fast, strong effects', 'Mushroom allergy'],
    onset: 'Weeks',
    evaluationWindow: '8–12 weeks',
    bottomLine:
      'Lion’s mane is the most interesting food-grade nootropic mushroom, with small human trials hinting at cognition and mood benefits — but it works slowly and the evidence is still early.',
    safetyNote: 'Generally well tolerated; avoid if you have a mushroom allergy.',
    evidenceNote: 'A few small human trials for cognition and mood; much of the mechanism work is preclinical.',
    evidenceConfidence: {
      grade: 'Limited–moderate',
      whyNotHigher: [
        'Human trials are small and short',
        'Much of the exciting nerve-growth work is preclinical',
      ],
      whyNotLower: [
        'A few randomized human trials show mild cognitive and mood benefits',
        'A plausible mechanism and a benign, food-grade safety profile',
      ],
      practicalTakeaway:
        'Worth a patient 8–12 week trial for long-term cognitive support. Do not expect a same-day lift — pair with caffeine/L-theanine for that.',
    },
    betterAlternative: {
      label: 'Caffeine + L-theanine',
      href: '/compounds/caffeine/',
      reason: 'for same-day focus',
    },
    primaryGuide: { label: 'Best nootropics for focus', href: '/guides/focus/best-nootropics-for-focus/' },
  },

  citicoline: {
    recommendation: 'Maybe',
    confidence: 'Moderate — some decent trials for attention and cognition',
    bestFor: ['Attention and focus support', 'Cognitive support with aging', 'A non-stimulant nootropic base'],
    notIdealFor: ['A same-day stimulant lift', 'Anyone expecting dramatic effects'],
    onset: 'Days to weeks',
    evaluationWindow: '4–8 weeks',
    bottomLine:
      'Citicoline (CDP-choline) is among the better-evidenced nootropics for attention, with real if modest trial support — a sensible non-stimulant option for sustained focus.',
    safetyNote: 'Generally well tolerated.',
    evidenceNote: 'Several human trials for attention and cognition; effects are modest.',
    evidenceConfidence: {
      grade: 'Moderate',
      whyNotHigher: [
        'Effect sizes are modest',
        'Some trials are industry-funded',
        'Benefits are clearest in attention and cognitive aging, less so in healthy young adults',
      ],
      whyNotLower: [
        'Multiple randomized trials support attention and cognitive benefits',
        'A clear mechanism (a choline and membrane-phospholipid source) and good tolerability',
      ],
      practicalTakeaway:
        'A reasonable non-stimulant pick for sustained attention over several weeks. Pair with caffeine/L-theanine if you also want an immediate lift.',
    },
    betterAlternative: {
      label: 'Caffeine + L-theanine',
      href: '/compounds/caffeine/',
      reason: 'for immediate, same-day focus',
    },
    primaryGuide: { label: 'Best nootropics for focus', href: '/guides/focus/best-nootropics-for-focus/' },
  },
}

// Slug aliases — a few botanicals are indexed under a herb page with a
// botanical record slug, while the common-name compound page is a noindex
// canonical redirect. Map both so the verdict resolves whichever slug the
// template passes.
PROFILE_VERDICTS.kava = PROFILE_VERDICTS['piper-methysticum']
PROFILE_VERDICTS.passionflower = PROFILE_VERDICTS['passiflora-incarnata']
// Lion's Mane: the indexed canonical is the herb `hericium-erinaceus`; the
// `lions-mane` page canonicalizes to it. Map both.
PROFILE_VERDICTS['lions-mane'] = PROFILE_VERDICTS['hericium-erinaceus']

export function getProfileVerdict(slug: string): ProfileVerdictOverlay | undefined {
  return PROFILE_VERDICTS[slug]
}
