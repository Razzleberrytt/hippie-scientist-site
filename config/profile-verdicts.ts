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
  betterAlternative?: { label: string; href: string; reason?: string }
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
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for acute, in-the-moment calm',
    },
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
    evidenceNote: 'Several human trials for fatigue and stress, but heterogeneous extracts and small samples.',
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
    betterAlternative: {
      label: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      reason: 'for chronic baseline stress',
    },
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
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for lower-risk everyday calm',
    },
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
    evidenceNote: 'Small randomized trials for anxiety and sleep; effects are modest.',
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
    safetyNote: 'Most people overshoot the dose; more is not better. Use lowest effective amount and involve a clinician for children.',
    evidenceNote: 'Robust for circadian rhythm timing; effect on general insomnia is small.',
    betterAlternative: {
      label: 'Magnesium',
      href: '/compounds/magnesium/',
      reason: 'for relaxation-type sleep trouble',
    },
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
  },

  creatine: {
    recommendation: 'Yes',
    confidence: 'Strong for muscle; emerging and promising for cognition',
    bestFor: ['Cognitive support under sleep deprivation', 'Strength and training output', 'A high-safety daily staple'],
    notIdealFor: ['A same-day focus stimulant', 'Anyone expecting a fast mental "lift"'],
    onset: 'Days to a few weeks (tissue saturation)',
    evaluationWindow: '2–4 weeks',
    bottomLine:
      'One of the safest, best-evidenced supplements there is — long proven for training, and increasingly interesting for cognition under stress and sleep loss.',
    safetyNote: 'Very well tolerated; stay hydrated. Discuss with a clinician if you have kidney disease.',
    evidenceNote: 'Overwhelming evidence for physical performance; cognitive evidence is newer but growing.',
  },
}

// Slug aliases — a few botanicals are indexed under a herb page with a
// botanical record slug, while the common-name compound page is a noindex
// canonical redirect. Map both so the verdict resolves whichever slug the
// template passes.
PROFILE_VERDICTS.kava = PROFILE_VERDICTS['piper-methysticum']
PROFILE_VERDICTS.passionflower = PROFILE_VERDICTS['passiflora-incarnata']

export function getProfileVerdict(slug: string): ProfileVerdictOverlay | undefined {
  return PROFILE_VERDICTS[slug]
}
