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
  stress: {
    subject: 'Ashwagandha (Withania somnifera) for stress resilience',
    grade: 'Moderate',
    summary:
      'Multiple randomized, double-blind, placebo-controlled trials suggest standardized ashwagandha root extract significantly reduces subjective stress and anxiety scores, while lowering salivary and serum cortisol levels over 4 to 8 weeks.',
    gradeRationale:
      'The evidence is graded "Moderate to Strong" because the effect is replicated across multiple independent, placebo-controlled trials using standardized extracts (such as KSM-66 or Shoden). However, long-term safety studies beyond 8 weeks are limited, and some trials have small cohorts or manufacturer funding.',
    studyType: 'Randomized, double-blind, placebo-controlled trials',
    population: 'Healthy adults experiencing high self-reported stress',
    participants: 'Typically 60–120 participants per trial',
    duration: '8 weeks',
    comparator: 'Placebo',
    dosing: '300–600 mg/day of standardized extract',
    design: [
      { label: 'Primary outcomes', value: 'Perceived Stress Scale (PSS-10), Hamilton Anxiety Rating Scale (HAM-A), serum cortisol' },
    ],
    limitations: [
      'Most trials are short-term (8 weeks max), leaving long-term safety unquantified.',
      'Manufacturer funding in several key clinical trials.',
      'Thyroid-stimulating potential requires careful screening.',
    ],
    context:
      'Ashwagandha is an effective baseline adaptogen for chronic cortisol-driven stress, but should be cycled and avoided in pregnancy, thyroid conditions, or autoimmune disease.',
    sources: [
      { label: 'Chandrasekhar et al., 2012 — RCT on stress/anxiety (Indian J Psychol Med)' },
      { label: 'Salve et al., 2019 — RCT on stress and cortisol (Cureus)' },
    ],
  },
  focus: {
    subject: 'Caffeine and L-Theanine combination for cognitive focus',
    grade: 'Moderate',
    summary:
      'Multiple randomized, crossover trials suggest that combining caffeine with L-theanine improves reaction time, word recognition, and rapid visual information processing, while significantly reducing the jitteriness and blood pressure spikes commonly caused by caffeine alone.',
    gradeRationale:
      'The evidence is graded "Moderate" because the synergy is demonstrated in multiple placebo-controlled crossover trials in healthy young adults. However, the studies are largely short-term (single-dose acute testing), leaving long-term cognitive adaptation and tolerance effects less clear.',
    studyType: 'Randomized, double-blind, placebo-controlled, crossover trials',
    population: 'Healthy young adults',
    participants: 'Typically 20–30 participants per trial',
    duration: 'Acute single-dose testing (measured 1–3 hours post-ingestion)',
    comparator: 'Placebo, Caffeine alone, L-Theanine alone',
    dosing: 'Typically 50–100 mg Caffeine paired with 100–200 mg L-Theanine (1:2 ratio)',
    design: [
      { label: 'Primary outcomes', value: 'Rapid visual information processing (RVIP), reaction time, alert/calm subjective scales' },
    ],
    limitations: [
      'Acute, single-day designs do not prove long-term safety or cognitive enhancement.',
      'Small cohort sizes in crossover trials.',
      'Highly dependent on individual caffeine tolerance.',
    ],
    context:
      'The caffeine and L-theanine stack is an exceptionally well-supported strategy for immediate, clean attention, but should be avoided close to bedtime.',
    sources: [
      { label: 'Owen et al., 2008 — Crossover trial on cognitive performance (Nutr Neurosci)' },
      { label: 'Giesbrecht et al., 2010 — Crossover trial on focus and alertness (Nutr Neurosci)' },
    ],
  },
}

export function getGoalPivotalStudy(slug: string): GoalPivotalStudy | undefined {
  return goalPivotalStudies[slug]
}
