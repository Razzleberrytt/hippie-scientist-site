import {
  evidenceConsistencyLabel,
  evidenceRelationshipLabel,
  evidenceSourceUrl,
  evidenceStudyClassDefinition,
  formatEvidenceStudyClass,
  normalizeEvidenceStudyClass,
  summarizeEvidenceStudies,
  type EvidenceConfidence,
  type EvidenceRelationship,
  type EvidenceStudyClass,
  type EvidenceStudyRecord,
} from '@/lib/evidence-study'
import StudyClassFilterControls from './StudyClassFilterControls'

export interface Citation {
  id?: string
  title: string
  pmid?: string
  doi?: string
  url?: string
  year?: number | string
  authors?: string
  journal?: string
  studyType?: string
  evidenceClass?: EvidenceStudyClass
  sampleSize?: string | number
  dose?: string
  duration?: string
  population?: string
  outcome?: string
  result?: string
  limitation?: string
  relationship?: EvidenceRelationship
  confidence?: EvidenceConfidence
  statisticalConsistency?: string
  effectSize?: string
  confidenceInterval?: string
  statisticalSignificance?: string
  absoluteDifference?: string
  clinicalMagnitude?: string
  replication?: string
  extractName?: string
  ingredients?: string[]
  conditions?: string[]
  safetyOutcome?: string
}

interface Props {
  citations: Citation[]
  conclusion?: string
  evidenceGrade?: string
  confidence?: EvidenceConfidence
  whatWouldChangeConclusion?: string
}

const STUDY_CLASS_ORDER: EvidenceStudyClass[] = [
  'meta_analysis',
  'systematic_review',
  'randomized_controlled_trial',
  'controlled_trial',
  'observational',
  'case_report',
  'narrative_review',
  'mechanistic',
  'animal',
  'in_vitro',
  'other',
]
const VISIBLE_ROWS = 6

function normalizedStudy(citation: Citation): EvidenceStudyRecord {
  const evidenceClass = citation.evidenceClass || normalizeEvidenceStudyClass(citation.studyType)
  return {
    id: citation.id || citation.pmid || citation.doi || citation.url || citation.title,
    title: citation.title,
    authors: citation.authors,
    journal: citation.journal,
    year: citation.year,
    pmid: citation.pmid,
    doi: citation.doi,
    url: citation.url,
    studyType: citation.studyType,
    evidenceClass,
    sampleSize: citation.sampleSize,
    dose: citation.dose,
    duration: citation.duration,
    population: citation.population,
    outcome: citation.outcome,
    result: citation.result,
    limitation: citation.limitation,
    relationship: citation.relationship || 'background',
    confidence: citation.confidence || 'unknown',
    statisticalConsistency: citation.statisticalConsistency,
    effectSize: citation.effectSize,
    confidenceInterval: citation.confidenceInterval,
    statisticalSignificance: citation.statisticalSignificance,
    absoluteDifference: citation.absoluteDifference,
    clinicalMagnitude: citation.clinicalMagnitude,
    replication: citation.replication,
    extractName: citation.extractName,
    ingredients: citation.ingredients,
    conditions: citation.conditions,
    safetyOutcome: citation.safetyOutcome,
  }
}

function StudyTypeBadge({ study }: { study: EvidenceStudyRecord }) {
  const type = formatEvidenceStudyClass(study.evidenceClass)
  const lower = type.toLowerCase()
  let classes = 'border-stone-300/50 bg-stone-50 text-stone-700 dark:border-stone-200/20 dark:bg-stone-300/10 dark:text-stone-100'

  if (study.evidenceClass === 'randomized_controlled_trial' || study.evidenceClass === 'controlled_trial') {
    classes = 'border-emerald-600/25 bg-emerald-50 text-emerald-800 dark:border-emerald-200/20 dark:bg-emerald-300/10 dark:text-emerald-100'
  } else if (study.evidenceClass === 'meta_analysis' || study.evidenceClass === 'systematic_review') {
    classes = 'border-blue-600/25 bg-blue-50 text-blue-800 dark:border-blue-200/20 dark:bg-blue-300/10 dark:text-blue-100'
  } else if (study.evidenceClass === 'observational') {
    classes = 'border-violet-600/25 bg-violet-50 text-violet-800 dark:border-violet-200/20 dark:bg-violet-300/10 dark:text-violet-100'
  } else if (lower.includes('mechanistic') || study.evidenceClass === 'in_vitro') {
    classes = 'border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-amber-100'
  } else if (study.evidenceClass === 'animal') {
    classes = 'border-orange-400/30 bg-orange-50/70 text-orange-700 dark:border-orange-200/20 dark:bg-orange-300/10 dark:text-orange-100'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${classes}`}>
      {type}
    </span>
  )
}

function RelationshipBadge({ relationship }: { relationship: EvidenceRelationship }) {
  const tone = relationship === 'supports'
    ? 'border-emerald-600/20 bg-emerald-50 text-emerald-800'
    : relationship === 'contradicts'
      ? 'border-rose-600/20 bg-rose-50 text-rose-800'
      : relationship === 'mixed' || relationship === 'no_clear_effect'
        ? 'border-amber-600/20 bg-amber-50 text-amber-800'
        : 'border-stone-300/60 bg-stone-50 text-stone-700'

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {evidenceRelationshipLabel(relationship)}
    </span>
  )
}

function sortByStudyType(a: EvidenceStudyRecord, b: EvidenceStudyRecord) {
  const aRank = STUDY_CLASS_ORDER.indexOf(a.evidenceClass)
  const bRank = STUDY_CLASS_ORDER.indexOf(b.evidenceClass)
  return aRank - bRank
}

function citationKey(citation: EvidenceStudyRecord, index: number) {
  return citation.id || citation.pmid || citation.doi || citation.url || citation.title || index
}

function previewText(study: EvidenceStudyRecord) {
  return [
    study.population && `Population: ${study.population}`,
    study.dose && `Dose: ${study.dose}`,
    study.duration && `Duration: ${study.duration}`,
    study.outcome && `Outcome: ${study.outcome}`,
    study.result && `Result: ${study.result}`,
    study.effectSize && `Effect size: ${study.effectSize}`,
    study.confidenceInterval && `CI: ${study.confidenceInterval}`,
    study.clinicalMagnitude && `Magnitude: ${study.clinicalMagnitude}`,
    study.replication && `Replication: ${study.replication}`,
    study.limitation && `Limitation: ${study.limitation}`,
  ].filter(Boolean).join(' • ')
}

function QuantitativeContext({ study }: { study: EvidenceStudyRecord }) {
  const rows = [
    study.effectSize && ['Effect size', study.effectSize],
    study.confidenceInterval && ['Confidence interval', study.confidenceInterval],
    study.absoluteDifference && ['Absolute difference', study.absoluteDifference],
    study.statisticalSignificance && ['Statistical significance', study.statisticalSignificance],
    study.clinicalMagnitude && ['Magnitude', study.clinicalMagnitude],
    study.replication && ['Replication', study.replication],
  ].filter((row): row is [string, string] => Boolean(row))

  if (!rows.length) return null

  return (
    <dl className="mt-2 space-y-1 border-t border-brand-900/10 pt-2 text-[10px] leading-4 text-muted dark:border-white/10">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-1.5">
          <dt className="font-semibold text-ink">{label}:</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function StudyRow({ study, index }: { study: EvidenceStudyRecord; index: number }) {
  const sourceUrl = evidenceSourceUrl(study)
  const sourceLabel = study.pmid ? 'PubMed' : study.doi ? 'DOI' : sourceUrl ? 'Source' : ''
  const preview = previewText(study)

  return (
    <tr
      key={citationKey(study, index)}
      data-study-class={study.evidenceClass}
      className="border-t border-brand-900/10 dark:border-white/10"
    >
      <td className="min-w-[260px] px-3 py-3 align-top sm:px-4">
        <p className="text-[13px] font-semibold leading-snug text-ink">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={preview || undefined}
              className="hover:text-brand-700 hover:underline dark:hover:text-brand-100"
            >
              {study.title}
            </a>
          ) : study.title}
        </p>
        {(study.authors || study.journal || study.year) && (
          <p className="mt-0.5 text-[11px] text-muted">
            {[study.authors, study.journal, study.year ? String(study.year) : ''].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <RelationshipBadge relationship={study.relationship} />
          {study.extractName ? <span className="text-[10px] font-medium text-muted">Extract: {study.extractName}</span> : null}
        </div>
        {study.limitation ? (
          <p className="mt-2 text-[11px] leading-5 text-muted"><strong>Limitation:</strong> {study.limitation}</p>
        ) : null}
      </td>
      <td className="min-w-[190px] px-3 py-3 align-top sm:px-4">
        <StudyTypeBadge study={study} />
        <p className="mt-2 max-w-[250px] text-[10px] leading-4 text-muted">
          {evidenceStudyClassDefinition(study.evidenceClass).plainEnglish}
        </p>
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top text-[12px] text-muted sm:px-4">
        {study.sampleSize ? `n=${study.sampleSize}` : '—'}
      </td>
      <td className="min-w-[150px] px-3 py-3 align-top text-[12px] leading-5 text-muted sm:px-4">{study.dose || '—'}</td>
      <td className="min-w-[130px] px-3 py-3 align-top text-[12px] leading-5 text-muted sm:px-4">{study.duration || '—'}</td>
      <td className="min-w-[190px] px-3 py-3 align-top text-[12px] leading-5 text-muted sm:px-4">{study.population || '—'}</td>
      <td className="min-w-[180px] px-3 py-3 align-top text-[12px] leading-5 text-muted sm:px-4">{study.outcome || '—'}</td>
      <td className="min-w-[240px] px-3 py-3 align-top text-[12px] leading-5 text-muted sm:px-4">
        {study.result || '—'}
        {study.statisticalConsistency ? <p className="mt-1 text-[10px] text-muted">{study.statisticalConsistency}</p> : null}
        <QuantitativeContext study={study} />
      </td>
      <td className="px-3 py-3 text-right align-top sm:px-4">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-100"
          >
            {sourceLabel} →
          </a>
        ) : <span className="text-xs text-muted">—</span>}
      </td>
    </tr>
  )
}

export default function ShowMeTheStudies({
  citations,
  conclusion,
  evidenceGrade,
  confidence,
  whatWouldChangeConclusion,
}: Props) {
  if (!citations || citations.length === 0) return null

  const studies = citations.map(normalizedStudy).sort(sortByStudyType)
  const metrics = summarizeEvidenceStudies(studies)
  const classCounts = new Map<EvidenceStudyClass, number>()
  for (const study of studies) classCounts.set(study.evidenceClass, (classCounts.get(study.evidenceClass) || 0) + 1)
  const availableClasses = STUDY_CLASS_ORDER.filter((studyClass) => classCounts.has(studyClass))
  const visible = studies.slice(0, VISIBLE_ROWS)
  const overflow = studies.slice(VISIBLE_ROWS)

  const participantLabel = metrics.studiesWithParticipantCounts > 0
    ? `~${metrics.approximateParticipants.toLocaleString()} participants across ${metrics.studiesWithParticipantCounts} human sources with reported N`
    : 'Participant totals not consistently reported'
  const namedExtracts = [...new Set(studies.map(study => study.extractName).filter((value): value is string => Boolean(value)))]
  const evidenceSnapshot = conclusion || [
    `This table contains ${metrics.totalStudies} structured source${metrics.totalStudies === 1 ? '' : 's'}, including ${metrics.humanTrials} human trial${metrics.humanTrials === 1 ? '' : 's'}.`,
    metrics.studiesWithParticipantCounts > 0
      ? `Across ${metrics.studiesWithParticipantCounts} human source${metrics.studiesWithParticipantCounts === 1 ? '' : 's'} with a reported sample size, the approximate participant total is ${metrics.approximateParticipants.toLocaleString()}; overlapping publications may include some of the same people.`
      : 'A reliable participant total cannot be calculated because sample size is not consistently structured in the cited sources.',
    `The structured direction is ${evidenceConsistencyLabel(metrics.consistency).toLowerCase()}: ${metrics.supportive} supporting, ${metrics.mixed} mixed, ${metrics.contradicting} contradicting, and ${metrics.noClearEffect} no-clear-effect source relationships.`,
  ].join(' ')
  const hasDisagreement = metrics.mixed > 0 || metrics.contradicting > 0 || metrics.noClearEffect > 0

  return (
    <details
      data-study-summaries-root
      className="group/studies overflow-hidden rounded-2xl border-2 border-brand-900/10 bg-[var(--surface-card)] p-0 shadow-none backdrop-blur-none dark:border-white/10"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 bg-brand-50/70 px-4 py-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 dark:bg-[var(--surface-subtle)]">
        <span>
          <span className="block text-sm font-bold text-ink">Clinical Study Summaries ({citations.length})</span>
          <span className="mt-0.5 block text-[11px] leading-5 text-muted">
            {metrics.humanTrials} human trial{metrics.humanTrials === 1 ? '' : 's'} · {participantLabel} · {evidenceConsistencyLabel(metrics.consistency)}
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-brand-500 transition-transform group-open/studies:rotate-180">v</span>
      </summary>

      {availableClasses.length > 1 ? (
        <div className="border-t border-brand-900/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <StudyClassFilterControls
            total={studies.length}
            classes={availableClasses.map((studyClass) => ({
              value: studyClass,
              label: formatEvidenceStudyClass(studyClass),
              count: classCounts.get(studyClass) || 0,
            }))}
          />
          <noscript>
            <p className="mt-2 text-[11px] text-muted">Study filters require JavaScript; all study rows remain available below.</p>
          </noscript>
        </div>
      ) : null}

      <div className="grid gap-3 border-t border-brand-900/10 bg-white/80 p-4 md:grid-cols-2 dark:border-white/10 dark:bg-white/5">
        <div className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">What the evidence actually shows</p>
          <p className="mt-2 text-sm leading-6 text-ink">{evidenceSnapshot}</p>
          {namedExtracts.length > 0 ? (
            <p className="mt-2 text-xs leading-5 text-amber-900 dark:text-amber-100">
              <strong>Form limitation:</strong> Some findings concern named preparations ({namedExtracts.slice(0, 3).join(', ')}{namedExtracts.length > 3 ? ', …' : ''}); those results should not automatically be generalized to every product sold under the ingredient name.
            </p>
          ) : null}
          <p className="mt-2 text-xs font-semibold text-ink">
            {evidenceGrade ? `Evidence grade: ${evidenceGrade}` : 'Evidence grade: see the profile-level grade above'}
            {' · '}
            {confidence ? `Confidence: ${confidence}` : 'Confidence: not separately assigned'}
          </p>
        </div>
        <div className="rounded-xl border border-brand-900/10 bg-white p-4 dark:bg-white/5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">What would change our conclusion?</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {whatWouldChangeConclusion || 'Larger, well-controlled human trials using comparable populations, doses, preparations, and clinically meaningful outcomes could materially strengthen or weaken this conclusion. Replication in a different population or a high-quality synthesis resolving current disagreement could also materially change confidence.'}
          </p>
        </div>
      </div>

      {hasDisagreement ? (
        <div className="border-t border-amber-700/20 bg-amber-50 px-4 py-4 dark:bg-amber-300/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-900 dark:text-amber-100">Where studies disagree</p>
          <p className="mt-2 text-sm leading-6 text-amber-950 dark:text-amber-50">
            The structured evidence is not uniform: {metrics.supportive} source relationship{metrics.supportive === 1 ? '' : 's'} support{metrics.supportive === 1 ? 's' : ''} the conclusion, {metrics.mixed} are mixed, {metrics.contradicting} contradict it, and {metrics.noClearEffect} report no clear effect. Differences in population, dose or preparation, duration, outcome definition, and study design can produce genuinely different results; inspect the rows below rather than treating the studies as one averaged vote.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto border-t border-brand-900/10 dark:border-white/10">
        <table className="w-full min-w-[1600px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--surface-card)] text-[10px] font-bold uppercase tracking-wider text-muted">
              <th className="px-3 py-2 sm:px-4">Study</th>
              <th className="px-3 py-2 sm:px-4">Design</th>
              <th className="px-3 py-2 sm:px-4">N</th>
              <th className="px-3 py-2 sm:px-4">Dose</th>
              <th className="px-3 py-2 sm:px-4">Duration</th>
              <th className="px-3 py-2 sm:px-4">Population</th>
              <th className="px-3 py-2 sm:px-4">Outcome</th>
              <th className="px-3 py-2 sm:px-4">Result &amp; magnitude</th>
              <th className="px-3 py-2 text-right sm:px-4">Source</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((study, index) => <StudyRow key={citationKey(study, index)} study={study} index={index} />)}
          </tbody>
        </table>
      </div>

      {overflow.length > 0 && (
        <details
          data-study-overflow
          className="group border-x-0 border-b-0 border-t border-brand-900/10 bg-transparent p-0 shadow-none backdrop-blur-none dark:border-white/10"
        >
          <summary className="flex cursor-pointer select-none items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-100 dark:hover:text-white">
            <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">▶</span>
            <span data-study-overflow-label>Show {overflow.length} more stud{overflow.length === 1 ? 'y' : 'ies'}</span>
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] border-collapse text-left text-sm">
              <tbody>
                {overflow.map((study, index) => <StudyRow key={citationKey(study, index)} study={study} index={index} />)}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </details>
  )
}
