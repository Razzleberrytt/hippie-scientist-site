import type { Goal, GoalOption } from '@/data/goals'
import type {
  GoalContentExtension,
  GoalDosingNote,
  GoalEvidenceRow,
  GoalFaqItem,
} from '@/data/goal-content'

const FAQ_OVERRIDES: Record<string, Record<string, string>> = {
  sleep: {
    'What is the best evidence-based supplement for sleep onset?':
      'Melatonin has evidence for circadian-timing problems and may modestly shorten sleep-onset latency in some people, but clinical guidelines do not recommend it as a general treatment for chronic insomnia. Evidence for magnesium, L-Theanine, and valerian is more limited or inconsistent. Match any trial to the specific sleep problem and review safety before combining products.',
    'How do melatonin, valerian, and magnesium compare for sleep?':
      'Melatonin is a circadian timing signal and has the clearest role when sleep timing is the problem, such as jet lag or a delayed sleep schedule. Evidence for valerian in insomnia is inconsistent. Magnesium is essential for nerve and muscle function, but supplemental magnesium is not established as a general insomnia treatment. Use the detailed comparison to review evidence and safety rather than assuming these options are interchangeable.',
    'How long before bed should I take sleep supplements?':
      'Timing varies by ingredient, formulation, dose, and the sleep problem being targeted. Melatonin timing is especially context-dependent because it affects circadian timing. Follow product- or study-specific instructions and avoid assuming one universal pre-bed timing rule for all sleep supplements.',
    'Why do some sleep aids cause next-day grogginess?':
      'Melatonin and other sedating products can contribute to next-day drowsiness in some people, and combining multiple sedating products makes the cause harder to identify. If morning impairment is persistent or significant, stop the new product and review the situation with a qualified health professional.',
  },
  stress: {
    'Ashwagandha vs L-Theanine vs Magnesium — which fits my stress pattern?':
      'Some ashwagandha preparations have supportive human evidence for stress symptoms, but studies are often small and use different preparations, and long-term safety is not well established. L-Theanine and magnesium have different evidence bases and should not be ranked from mechanism or onset claims alone. Compare the profile evidence, dose/form, cautions, and medication context for each option.',
    'Ashwagandha vs rhodiola — which has better stress evidence?':
      'Ashwagandha has supportive human evidence for stress with important study and preparation differences. Rhodiola has a separate, variable evidence base for stress-related fatigue and performance outcomes. There is not a single head-to-head evidence ranking that makes one the default choice; compare the exact outcome, preparation, safety profile, and study quality.',
    'Why do some people feel emotionally flat on ashwagandha?':
      'New mood or emotional changes after starting a supplement deserve attention, but emotional blunting is not established as a common ashwagandha adverse effect in major clinical evidence summaries. If a meaningful mood change begins after starting a product, stop the new product and discuss it with a qualified health professional.',
  },
  anxiety: {
    'Is kava effective for social anxiety?':
      'Kava has been studied for anxiety, but current evidence does not establish it as a reliable treatment for social anxiety, and findings in generalized anxiety disorder have been mixed. Rare but potentially severe liver injury and additive sedation are important parts of the decision.',
    'Can L-Theanine help racing thoughts at night?':
      'Direct evidence for L-Theanine specifically treating racing thoughts at night is lacking. A 2026 meta-analysis found a short-term attention signal and a modest acute-stress effect, while anxiety findings were inconsistent overall. Those results do not establish reliable anxiety relief or a predictable calming onset.',
  },
  focus: {
    'Caffeine vs L-Theanine vs Bacopa — how do they differ for focus?':
      'Caffeine has strong evidence for an acute attention effect in healthy adults. L-Theanine alone and with caffeine has task-specific cognitive and mood findings, but the size and direction of effects vary and it should not be assumed to reliably eliminate caffeine jitters. Bacopa has repeated-dose evidence centered more on memory than immediate focus, so these options are not interchangeable.',
    'What is the best non-stimulant focus supplement?':
      'There is no evidence-based universal best non-stimulant focus supplement. L-Theanine has task-specific attention findings, rhodiola has a separate evidence base centered on fatigue and performance under stress, and Bacopa is studied mainly with repeated dosing for memory outcomes. Match the option to the exact outcome rather than ranking them as one category.',
    'Will caffeine help focus without side effects?':
      'A 2025 meta-analysis of placebo-controlled trials found that caffeine acutely improved attention in healthy adults, but response and adverse effects vary with dose and individual sensitivity. L-Theanine plus caffeine may alter selected attention or mood outcomes, but it is not established as a guaranteed way to prevent caffeine-related jitters or sleep disruption.',
  },
}

const EVIDENCE_OVERRIDES: Record<string, Record<string, Partial<GoalEvidenceRow>>> = {
  sleep: {
    Magnesium: {
      evidence: 'Limited / heterogeneous',
      humanData: 'Small interventional studies',
      limitation: 'Larger randomized trials are needed; benefit may depend on baseline magnesium status',
    },
    'L-Theanine': {
      evidence: 'Limited / mixed for sleep',
      humanData: 'Small RCTs; mostly subjective outcomes',
      limitation: 'Pure L-Theanine data and optimal dose and duration remain uncertain',
    },
    'Valerian Root': {
      evidence: 'Inconsistent / insufficient',
      humanData: 'Small and mixed studies',
      limitation: 'Not recommended for chronic insomnia by AASM; long-term safety is uncertain',
    },
  },
  stress: {
    Ashwagandha: {
      evidence: 'Supportive human evidence for stress',
      humanData: 'Small trials using varied preparations',
      limitation: 'Preparation-specific results; long-term safety is uncertain',
    },
    Rhodiola: {
      evidence: 'Variable / outcome-specific',
      humanData: 'Stress-fatigue and performance trials',
      limitation: 'Product-specific studies do not establish a general stress treatment',
    },
    'L-Theanine': {
      evidence: 'Limited / mixed for stress',
      humanData: 'Acute stress and attention paradigms',
      limitation: 'Acute-stress effect is modest and bias-sensitive; anxiety findings are inconsistent',
    },
  },
  anxiety: {
    Ashwagandha: {
      evidence: 'Supportive but heterogeneous',
      humanData: 'Repeated-dose stress and anxiety trials',
      limitation: 'Extract and population differences limit generalization; not an acute panic treatment',
    },
    Kava: {
      evidence: 'Mixed / safety-limited',
      humanData: 'Anxiety trials with inconsistent GAD findings',
      limitation: 'Rare serious liver injury and sedative interactions materially affect risk',
    },
    'L-Theanine': {
      evidence: 'Inconsistent for anxiety',
      humanData: '31-trial 2026 meta-analysis',
      limitation: 'Attention and acute-stress signals do not establish an anxiety treatment',
    },
  },
  focus: {
    Caffeine: {
      evidence: 'Strong acute attention evidence',
      humanData: '31 placebo-controlled trials in healthy adults',
      limitation: 'Dose-response and sleep or anxiety tradeoffs vary by person',
    },
    'L-Theanine': {
      evidence: 'Task-specific / mixed',
      humanData: 'Randomized attention and mood studies',
      limitation: 'Not established as a stand-alone focus treatment or guaranteed caffeine smoother',
    },
    Rhodiola: {
      evidence: 'Variable / outcome-specific',
      humanData: 'Fatigue and performance studies',
      limitation: 'Not established as a general attention treatment',
    },
    'Bacopa Monnieri': {
      evidence: 'Repeated-dose memory evidence',
      humanData: 'Longer-term randomized trials',
      limitation: 'Not an acute focus aid; results are extract- and outcome-specific',
    },
  },
}

const DOSING_OVERRIDES: Record<string, Record<string, string>> = {
  sleep: {
    'L-Theanine':
      'Sleep trials have used varied L-Theanine doses, formulations, and durations. Current reviews do not establish one optimal dose or a universal pre-bed timing rule.',
    'Valerian Root':
      'Research has used varied valerian preparations and doses, but evidence for insomnia remains inconsistent. Do not treat a commonly used dose as proof of effectiveness; follow the product label and review sedative interactions.',
  },
  stress: {
    'L-Theanine':
      'Trial doses and outcomes vary. Do not infer a predictable stress-relief onset from the dose alone; review the specific evidence and product label.',
  },
  anxiety: {
    'L-Theanine':
      'Trials have used varied doses and populations, and current pooled evidence does not establish a standard anxiety-treatment dose or predictable onset.',
    Ashwagandha:
      'Ashwagandha trial doses are extract-specific and should not be generalized across products; review the exact preparation, label, and safety context.',
    Kava:
      'Do not select a kava dose or extract type from efficacy claims alone. Rare serious liver injury and additive sedation make medication, alcohol, liver-health, and product-quality context important.',
  },
  focus: {
    'L-Theanine':
      'Studies use varied L-Theanine and caffeine doses. A fixed theanine-to-caffeine ratio is not established as a universal focus strategy.',
  },
}

const QUICK_PICK_OVERRIDES: Record<string, Goal['quickPicks']> = {
  sleep: [
    { need: 'Circadian timing questions', option: 'Melatonin', slug: 'melatonin' },
    { need: 'Review L-Theanine sleep evidence', option: 'L-Theanine', slug: 'l-theanine' },
    { need: 'Review magnesium sleep evidence', option: 'Magnesium', slug: 'magnesium' },
  ],
  stress: [
    { need: 'Repeated-dose stress evidence', option: 'Ashwagandha', slug: 'ashwagandha' },
    { need: 'Fatigue and performance evidence', option: 'Rhodiola', slug: 'rhodiola' },
    { need: 'Acute-stress research', option: 'L-Theanine', slug: 'l-theanine' },
  ],
  anxiety: [
    { need: 'Review short-term L-Theanine evidence', option: 'L-Theanine', slug: 'l-theanine' },
    { need: 'Review repeated-dose evidence', option: 'Ashwagandha', slug: 'ashwagandha' },
    { need: 'Review higher-risk herbal evidence', option: 'Kava', slug: 'kava' },
  ],
  focus: [
    { need: 'Task-specific attention evidence', option: 'L-Theanine', slug: 'l-theanine' },
    { need: 'Fatigue and stress-performance evidence', option: 'Rhodiola', slug: 'rhodiola' },
    { need: 'Established acute alertness', option: 'Caffeine', slug: 'caffeine' },
  ],
}

const OPTION_OVERRIDES: Record<string, Record<string, Partial<GoalOption>>> = {
  sleep: {
    magnesium: {
      bestFor: 'Reviewing magnesium status, intake, and sleep evidence',
      speed: 'No established universal sleep onset',
      evidence: 'Limited / heterogeneous for sleep',
    },
    'l-theanine': {
      bestFor: 'Reviewing short-term sleep and relaxation research',
      speed: 'No established universal calming onset',
      evidence: 'Limited / mixed for sleep',
    },
    melatonin: {
      bestFor: 'Circadian timing and sleep-schedule questions',
      speed: 'Timing is circadian-context dependent',
      evidence: 'Strongest for circadian timing; limited for chronic insomnia treatment',
    },
    'lemon-balm': {
      bestFor: 'Reviewing preliminary anxiety- and sleep-related evidence',
      speed: 'No established universal onset',
      evidence: 'Limited; often studied in small or combination trials',
    },
  },
  stress: {
    ashwagandha: {
      bestFor: 'Reviewing repeated-dose stress research',
      speed: 'Repeated-dose studies; not an acute stress aid',
      evidence: 'Supportive but heterogeneous for stress',
    },
    rhodiola: {
      bestFor: 'Reviewing fatigue and performance-under-stress research',
      speed: 'Study-dependent; not a universal acute effect',
      evidence: 'Variable / outcome-specific',
    },
    'l-theanine': {
      bestFor: 'Reviewing acute-stress and attention paradigms',
      speed: 'No established predictable stress-relief onset',
      evidence: 'Limited / mixed for stress',
    },
  },
  anxiety: {
    'l-theanine': {
      bestFor: 'Reviewing short-term stress and attention evidence',
      speed: 'No established predictable anxiety-relief onset',
      evidence: 'Inconsistent for anxiety',
      avoidIf: 'Review medication, blood-pressure, and sedative context before combining products',
    },
    ashwagandha: {
      bestFor: 'Reviewing repeated-dose stress and anxiety studies',
      speed: 'Repeated-dose studies; not an acute panic treatment',
      evidence: 'Supportive but heterogeneous',
    },
    kava: {
      bestFor: 'Reviewing mixed anxiety evidence with higher safety burden',
      speed: 'No reliable treatment onset established',
      evidence: 'Mixed / safety-limited',
      risk: 'Moderate to high',
      avoidIf: 'Liver disease, alcohol, sedatives, pregnancy, or activities requiring unimpaired alertness',
      form: 'Product quality and preparation matter; do not infer safety from extract type alone',
    },
  },
  focus: {
    'l-theanine': {
      bestFor: 'Task-specific attention research, including caffeine combinations',
      speed: 'Single-dose studies assess effects within hours; personal onset is not established',
      evidence: 'Task-specific / mixed',
    },
    rhodiola: {
      bestFor: 'Fatigue and performance under stress',
      speed: 'Study-dependent; not an established acute focus aid',
      evidence: 'Variable / outcome-specific',
    },
    caffeine: {
      evidence: 'Strong acute attention evidence',
    },
    bacopa: {
      bestFor: 'Repeated-dose memory and learning research',
      evidence: 'Repeated-dose memory evidence; not an acute focus aid',
    },
  },
}

function publicFaq(slug: string, item: GoalFaqItem): GoalFaqItem {
  const answer = FAQ_OVERRIDES[slug]?.[item.question]
  return answer ? { ...item, answer } : item
}

function publicEvidenceRow(slug: string, row: GoalEvidenceRow): GoalEvidenceRow {
  const override = EVIDENCE_OVERRIDES[slug]?.[row.compound]
  return override ? { ...row, ...override } : row
}

function publicDosingNote(slug: string, note: GoalDosingNote): GoalDosingNote {
  const override = DOSING_OVERRIDES[slug]?.[note.compound]
  return override ? { ...note, note: override } : note
}

export function getPublicGoal(goal: Goal): Goal {
  const optionOverrides = OPTION_OVERRIDES[goal.slug] ?? {}
  const quickPicks = QUICK_PICK_OVERRIDES[goal.slug]

  return {
    ...goal,
    quickPicks: (quickPicks ?? goal.quickPicks).map((pick) => ({ ...pick })),
    options: goal.options.map((option) => ({
      ...option,
      ...(optionOverrides[option.slug] ?? {}),
    })),
    relatedGoals: [...goal.relatedGoals],
  }
}

export function getPublicGoalContentExtension(
  slug: string,
  content: GoalContentExtension,
): GoalContentExtension {
  return {
    ...content,
    faqItems: content.faqItems.map((item) => publicFaq(slug, item)),
    evidenceRows: content.evidenceRows.map((row) => publicEvidenceRow(slug, row)),
    dosingNotes: content.dosingNotes.map((note) => publicDosingNote(slug, note)),
  }
}
