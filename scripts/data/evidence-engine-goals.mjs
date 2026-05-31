const SLEEP_PROBLEMS = new Set([
  'sleep_onset',
  'sleep_quality',
  'night_waking',
  'racing_mind',
  'relaxation',
])

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
  },
]

export function getEvidenceEngineGoalConfigs() {
  return EVIDENCE_ENGINE_GOALS
}

export function getEvidenceEngineGoalConfig(goal) {
  return EVIDENCE_ENGINE_GOALS.find((config) => config.goal === goal)
}
