const SLEEP_PROBLEMS = new Set([
  'sleep_onset',
  'sleep_quality',
  'night_waking',
  'racing_mind',
  'relaxation',
])

export function normalizeEvidenceProblemKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const SLEEP_PROBLEM_LABELS = {
  sleep_onset: {
    title: 'Sleep onset',
    description: 'Trouble getting sleepy or shifting into bedtime.',
  },
  sleep_quality: {
    title: 'Sleep quality',
    description: 'Light, unrefreshing, or inconsistent sleep.',
  },
  night_waking: {
    title: 'Night waking',
    description: 'Waking during the night or struggling to return to sleep.',
  },
  racing_mind: {
    title: 'Racing mind',
    description: 'Mental noise, tension, or bedtime rumination.',
  },
  relaxation: {
    title: 'Relaxation',
    description: 'A gentler wind-down target before stronger sedating approaches.',
  },
}

const STRESS_PROBLEMS = new Set([
  'acute_stress',
  'stress_reactivity',
  'baseline_tension',
  'stress_sleep_spillover',
  'cognitive_stress_load',
])

const STRESS_PROBLEM_LABELS = {
  acute_stress: {
    title: 'Acute stress',
    description: 'Short-term spikes in tension, pressure, or overwhelm.',
  },
  stress_reactivity: {
    title: 'Stress reactivity',
    description: 'Feeling easily triggered with stronger physical or emotional responses.',
  },
  baseline_tension: {
    title: 'Baseline tension',
    description: 'Persistent background strain that does not fully reset.',
  },
  stress_sleep_spillover: {
    title: 'Stress-sleep spillover',
    description: 'Stress carrying into bedtime, sleep continuity, or next-day recovery.',
  },
  cognitive_stress_load: {
    title: 'Cognitive stress load',
    description: 'Rumination, cognitive fatigue, or pressure-linked focus disruption.',
  },
}

const ANXIETY_PROBLEMS = new Set([
  'situational_nervousness',
  'physical_tension',
  'racing_thoughts',
  'anticipatory_worry',
])

const ANXIETY_PROBLEM_LABELS = {
  situational_nervousness: {
    title: 'Situational nervousness',
    description: 'Nervousness or anxiety tied to specific events, triggers, or performance situations.',
  },
  physical_tension: {
    title: 'Physical tension',
    description: 'Somatic anxiety patterns including muscle tightness, shallow breathing, or restlessness.',
  },
  racing_thoughts: {
    title: 'Racing thoughts',
    description: 'Mental loops, intrusive thoughts, or cognitive over-activity that worsen anxiety.',
  },
  anticipatory_worry: {
    title: 'Anticipatory worry',
    description: 'Future-focused worry patterns that escalate before anticipated events or decisions.',
  },
}

export const EVIDENCE_ENGINE_GOALS = [
  {
    goal: 'sleep',
    problemField: 'sleep_problem',
    problemAliases: ['sleep_problem', 'sleep problem'],
    problemSheetCandidates: null,
    claimSheetCandidates: ['Sleep Evidence Claims'],
    sourceSheetCandidates: ['Sleep Evidence Sources'],
    safetySheetCandidates: ['Sleep Safety Notes'],
    fallbackProblemLabels: SLEEP_PROBLEM_LABELS,
    validProblems: SLEEP_PROBLEMS,
    defaultDecisionGroup: 'Other sleep support',
    config: {
      heroHeadline: 'I want better sleep. What does the evidence actually support?',
      heroCta: 'Start with the sleep problem',
      orientationHeading: 'Start by naming the sleep problem',
      orientationSubtext: 'The same ingredient can look useful or weak depending on whether the issue is timing, mental arousal, waking, or general sleep quality.',
      safetyHeading: 'Sleep supplement decisions change when risk context changes',
      safetyBody: 'Do not use supplements to mask loud snoring, witnessed apnea, severe daytime sleepiness, persistent insomnia, chest symptoms, or complex medication situations.',
    },
  },
  {
    goal: 'stress',
    problemField: 'stress_problem',
    problemAliases: ['stress_problem', 'stress problem', 'problem'],
    problemSheetCandidates: ['Stress OutcomeProblems', 'Stress Outcome Problems'],
    claimSheetCandidates: ['Stress Evidence Claims'],
    sourceSheetCandidates: ['Stress Evidence Sources'],
    safetySheetCandidates: ['Stress Safety Notes'],
    fallbackProblemLabels: STRESS_PROBLEM_LABELS,
    validProblems: STRESS_PROBLEMS,
    defaultDecisionGroup: 'Other stress support',
    config: {
      heroHeadline: 'I want calmer stress response. What does the evidence actually support?',
      heroCta: 'Start with the stress pattern',
      orientationHeading: 'Start by naming the stress pattern',
      orientationSubtext: 'The same ingredient can look useful or weak depending on acute pressure, baseline tension, reactivity, and sleep spillover.',
      safetyHeading: 'Stress-support decisions change when risk context changes',
      safetyBody: 'Do not use supplements to mask persistent panic symptoms, severe mood instability, unsafe medication interactions, or other complex clinical situations.',
    },
  },
  {
    goal: 'anxiety',
    problemField: 'anxiety_problem',
    problemAliases: ['anxiety_problem', 'anxiety problem', 'problem'],
    problemSheetCandidates: ['Anxiety OutcomeProblems', 'Anxiety Outcome Problems'],
    claimSheetCandidates: ['Anxiety Evidence Claims'],
    sourceSheetCandidates: ['Anxiety Evidence Sources'],
    safetySheetCandidates: ['Anxiety Safety Notes'],
    fallbackProblemLabels: ANXIETY_PROBLEM_LABELS,
    validProblems: ANXIETY_PROBLEMS,
    defaultDecisionGroup: 'Other anxiety support',
    config: {
      heroHeadline: 'I want calmer anxiety support. What does the evidence actually support?',
      heroCta: 'Start with the anxiety pattern',
      orientationHeading: 'Start by naming the anxiety pattern',
      orientationSubtext: 'The same ingredient can look useful or weak depending on generalized tension, situational triggers, social pressure, physical symptoms, and sleep interference.',
      safetyHeading: 'Anxiety-support decisions change when risk context changes',
      safetyBody: 'Do not use supplements to mask persistent panic disorders, severe anxiety, medication interactions, or other complex clinical situations.',
    },
  },
]

export function getEvidenceEngineGoalConfigs() {
  return EVIDENCE_ENGINE_GOALS
}

export function getEvidenceEngineGoalConfig(goal) {
  return EVIDENCE_ENGINE_GOALS.find((config) => config.goal === goal)
}
