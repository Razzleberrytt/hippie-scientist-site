/**
 * Canonical study-class contract.
 *
 * `claims.json` records the design of the study behind each claim in a free
 * text `evidence_tier` field. 512 claims currently carry ~140 distinct
 * spellings of roughly a dozen real designs — `RCT`,
 * `randomized_double_blind_placebo_controlled_trial`, and
 * `randomized double-blind placebo-controlled trial` are the same design
 * written three ways, and `needs_classification` is used 91 times.
 *
 * Evidence weighting cannot be computed from strings like that, so every value
 * collapses into one canonical class with an explicit evidence rank. Classes
 * are ordered by the standard evidence hierarchy; `rank` rises with strength so
 * callers can compare designs numerically.
 */

export const STUDY_CLASSES = [
  'meta-analysis',
  'systematic-review',
  'rct',
  'controlled-trial',
  'uncontrolled-trial',
  'observational',
  'case-report',
  'narrative-review',
  'regulatory-guidance',
  'animal',
  'in-vitro',
  'unclassified',
] as const

export type StudyClass = (typeof STUDY_CLASSES)[number]

export type StudyClassInfo = {
  /** Reader-facing label. */
  label: string
  /** Higher is stronger evidence. `unclassified` is deliberately 0. */
  rank: number
  /** True when the design measures an outcome in people. */
  human: boolean
  /** True when the design can support a causal claim. */
  interventional: boolean
}

export const STUDY_CLASS_INFO: Record<StudyClass, StudyClassInfo> = {
  'meta-analysis': { label: 'Meta-analysis', rank: 9, human: true, interventional: false },
  'systematic-review': { label: 'Systematic review', rank: 8, human: true, interventional: false },
  rct: { label: 'Randomized controlled trial', rank: 7, human: true, interventional: true },
  'controlled-trial': { label: 'Controlled trial', rank: 6, human: true, interventional: true },
  'uncontrolled-trial': { label: 'Uncontrolled trial', rank: 5, human: true, interventional: true },
  observational: { label: 'Observational study', rank: 4, human: true, interventional: false },
  'case-report': { label: 'Case report', rank: 2, human: true, interventional: false },
  'narrative-review': { label: 'Narrative review', rank: 3, human: false, interventional: false },
  'regulatory-guidance': { label: 'Regulatory or official guidance', rank: 3, human: false, interventional: false },
  animal: { label: 'Animal study', rank: 1, human: false, interventional: true },
  'in-vitro': { label: 'In vitro study', rank: 1, human: false, interventional: true },
  unclassified: { label: 'Unclassified', rank: 0, human: false, interventional: false },
}

/**
 * Ordered most specific first. A value naming several designs is scored by the
 * strongest one it names, because "systematic review and meta-analysis of
 * randomized trials" is a meta-analysis regardless of what follows.
 */
const CLASS_PATTERNS: [RegExp, StudyClass][] = [
  [/\bmeta[-\s]?anal/i, 'meta-analysis'],
  [/\bumbrella review\b/i, 'meta-analysis'],
  [/\bsystematic[-\s]?review|\bsystematic\b.*\breview\b|\bcochrane\b/i, 'systematic-review'],
  [/\brandomi[sz]ed\b|\brct\b|\bdouble[-\s]?blind\b|\btriple[-\s]?blind\b|\bdouble[-\s]?masked\b|\bplacebo[-\s]?controlled\b/i, 'rct'],
  [/\bcontrolled (trial|study)\b|\bcrossover (trial|study)\b/i, 'controlled-trial'],
  [/\bin[-\s]?vitro\b|\bcell[-\s]?culture\b/i, 'in-vitro'],
  [/\banimal\b|\brodent\b|\bmurine\b|\bin[-\s]?vivo\b|\bpreclinical\b/i, 'animal'],
  [/\bcase (report|series)\b/i, 'case-report'],
  [/\bcohort\b|\bcross[-\s]?sectional\b|\bepidemiolog|\bobservational\b|\bexposure assessment\b/i, 'observational'],
  [/\bfda\b|\befsa\b|\bregulatory\b|\bofficial\b|\bfact sheet\b|\bposition\b|\bguidance\b|\bmonograph\b/i, 'regulatory-guidance'],
  [/\bnarrative\b/i, 'narrative-review'],
  // Generic trial wording, only after every specific design has been ruled out.
  [/\bclinical trial\b|\bintervention(al)? (trial|study)\b|\bhuman (trial|study|trials)\b|\bpilot\b|\btrials?\b/i, 'uncontrolled-trial'],
  [/\bclinical\b|\breview\b|\bevidence\b/i, 'narrative-review'],
]

/**
 * Values that explicitly record the absence of a classification. These must not
 * be pattern-matched — `needs_classification` contains no design information,
 * and `evidence_summary` describes the row's format, not a study.
 */
const UNCLASSIFIED_VALUES = new Set([
  'needs_classification',
  'evidence_summary',
  'clinical_study_needs_specific_design',
  '',
])

export function isStudyClass(value: unknown): value is StudyClass {
  return STUDY_CLASSES.includes(value as StudyClass)
}

/**
 * Map any recorded study-design string onto the canonical class.
 *
 * Returns `unclassified` rather than guessing when the source carries no design
 * information, so downstream weighting can tell "we know it is weak" apart from
 * "we do not know what this is".
 */
export function normalizeStudyClass(raw: unknown): StudyClass {
  const value = String(raw ?? '').trim()
  if (!value) return 'unclassified'
  if (isStudyClass(value)) return value

  const lowered = value.toLowerCase()
  if (UNCLASSIFIED_VALUES.has(lowered)) return 'unclassified'
  // Governance holds describe a publishing decision, not a study design.
  if (lowered.startsWith('blocked')) return 'unclassified'

  // The same design is recorded both as prose and as a snake_case key. `_` is a
  // word character, so `\bofficial\b` cannot match `official_nutrient_fact_sheet`
  // until separators are unified.
  const searchable = lowered.replace(/[_/+]+/g, ' ')

  for (const [pattern, studyClass] of CLASS_PATTERNS) {
    if (pattern.test(searchable)) return studyClass
  }

  return 'unclassified'
}

export function studyClassRank(studyClass: StudyClass): number {
  return STUDY_CLASS_INFO[studyClass].rank
}

export function isHumanStudyClass(studyClass: StudyClass): boolean {
  return STUDY_CLASS_INFO[studyClass].human
}

/** The strongest class present, or `unclassified` when the list is empty. */
export function strongestStudyClass(classes: readonly StudyClass[]): StudyClass {
  return classes.reduce<StudyClass>(
    (best, current) => (studyClassRank(current) > studyClassRank(best) ? current : best),
    'unclassified',
  )
}
