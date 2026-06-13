import type {
  StudyDesignFactor,
  StudyDesignSource,
  StudyEvidenceGrade,
} from '@/components/evidence/StudyDesignSnapshot'

/**
 * Optional, per-goal "pivotal study" context that powers a
 * <StudyDesignSnapshot> on a goal page. Keyed by goal slug.
 *
 * This file is the *data*; the component is the *presentation*. Add an entry
 * only when the design facts are accurate and citable. Goals without an entry
 * simply render no snapshot.
 */
export interface GoalPivotalStudy {
  /** What the pivotal evidence centers on, e.g. the lead herb/compound. */
  subject: string
  grade: StudyEvidenceGrade
  summary: string
  gradeRationale: string
  studyType?: string
  population?: string
  participants?: string
  duration?: string
  comparator?: string
  dosing?: string
  design?: StudyDesignFactor[]
  limitations: string[]
  context?: string
  sources?: StudyDesignSource[]
}

export const goalPivotalStudies: Record<string, GoalPivotalStudy> = {
  sleep: {
    subject: 'Ashwagandha (Withania somnifera) for sleep',
    grade: 'Moderate',
    summary:
      'Several small randomized trials and a meta-analysis suggest standardized ashwagandha extract produces a real but modest improvement in sleep quality — most reliably in adults with diagnosed insomnia.',
    gradeRationale:
      'The grade is "Moderate" because the effect is supported by multiple randomized, placebo-controlled trials and a pooled meta-analysis, yet the trials are small, short, use different standardized extracts, and several are manufacturer-funded — so the size of the benefit remains uncertain.',
    studyType: 'Randomized, double-blind, placebo-controlled trials (pooled in a 2021 meta-analysis)',
    population: 'Adults with self-reported poor sleep or diagnosed insomnia',
    participants: 'Typically 50–80 participants per trial (~400 pooled)',
    duration: '6–8 weeks',
    comparator: 'Placebo',
    dosing: '~300–600 mg/day standardized root extract',
    design: [
      { label: 'Primary outcomes', value: 'Sleep quality (PSQI), sleep-onset latency; actigraphy in some trials' },
    ],
    limitations: [
      'Small samples and short durations limit confidence in the effect size.',
      'Many trials use one specific standardized extract, so results may not generalize to all products.',
      'Several studies were funded by extract manufacturers.',
      'Outcomes lean on self-report scales rather than objective sleep measures.',
    ],
    context:
      'Treat ashwagandha as a modest, optional support inside a broader sleep routine — not a replacement for sleep hygiene or for evaluating persistent insomnia with a clinician.',
    sources: [
      { label: 'Cheah et al., 2021 — systematic review & meta-analysis (PLOS ONE)' },
      { label: 'Langade et al., 2021 — RCT in insomnia (Cureus)' },
    ],
  },
}

export function getGoalPivotalStudy(slug: string): GoalPivotalStudy | undefined {
  return goalPivotalStudies[slug]
}
