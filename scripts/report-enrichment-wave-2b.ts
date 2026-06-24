import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type Target = {
  entityType: EntityType
  entitySlug: string
  waveStatus: string
  selectionWhy: string
  highestPriorityMissingTopics: string[]
  criticality: string[]
}

type Submission = {
  submissionId: string
  entityType: string
  entitySlug?: string
  topicType: string
  reviewStatus: string
  editorialStatus?: string
  active: boolean
}

type Normalized = {
  enrichmentId: string
  entityType: EntityType
  entitySlug: string
  topicType: string
}

const ROOT = process.cwd()
const p = (...segments: string[]) => path.join(ROOT, ...segments)
const readJson = <T>(filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
const readJsonl = <T>(filePath: string) => fs.readFileSync(filePath, 'utf8').split('\n').map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l) as T)

const ORIGINAL_BLOCKERS = [
  { entityType: 'herb', entitySlug: 'henbane', blockerClasses: ['duplicate-only source set', 'rollup/public-surface no-op'], endedAtDeltaZeroWhy: 'All wave-2 source candidates for henbane were duplicates of existing registry sources and approved entries were research-gap carryovers that did not expand governed topic coverage breadth.' },
  { entityType: 'herb', entitySlug: 'mandrake-root', blockerClasses: ['needs_metadata source set', 'no promotable enrichment topics'], endedAtDeltaZeroWhy: 'Source candidate intakeTaskId did not match queue metadata in wave-2, so no new source was promotable and no new governed entry was authored for the target.' },
  { entityType: 'compound', entitySlug: 'cbd', blockerClasses: ['needs_metadata source set', 'submission blocked by framing/governance'], endedAtDeltaZeroWhy: 'Wave-2 candidate metadata mismatch prevented source promotion and no compliant non-duplicative submission made it through review for new governed coverage.' },
  { entityType: 'compound', entitySlug: 'luteolin', blockerClasses: ['needs_metadata source set', 'no promotable enrichment topics'], endedAtDeltaZeroWhy: 'Wave-2 source candidate metadata mismatch blocked promotion and left no approved topic entry to increase governed coverage.' },
  { entityType: 'herb', entitySlug: 'calliandra-anomala', blockerClasses: ['duplicate-only source set', 'no promotable source candidates'], endedAtDeltaZeroWhy: 'The only wave-2 candidate was already present in source registry, leaving no promotable source and no governance-ready enrichment entry.' },
  { entityType: 'herb', entitySlug: 'alectra-sessiliflora', blockerClasses: ['duplicate-only source set', 'no promotable source candidates'], endedAtDeltaZeroWhy: 'Wave-2 mechanism candidate was duplicate against registry, and no alternate promotable candidate was available in the same cycle.' },
]

const WAVE2B_TARGET_KEYS = new Set(['herb:mandrake-root', 'compound:cbd', 'compound:luteolin'])

const key = (entityType: string, entitySlug: string) => `${entityType}:${entitySlug}`

function coverage(entries: Normalized[], entityType: EntityType, entitySlug: string) {
  const rows = entries.filter(entry => entry.entityType === entityType && entry.entitySlug === entitySlug)
  return {
    governedEntries: rows.length,
    topicCoverage: {
      evidence: rows.filter(entry => ['supported_use', 'unsupported_or_unclear_use', 'conflict_note', 'research_gap'].includes(entry.topicType)).length,
      safety: rows.filter(entry => ['interaction', 'contraindication', 'adverse_effect', 'pregnancy_note', 'lactation_note', 'pediatric_note', 'geriatric_note', 'condition_caution', 'surgery_caution', 'medication_class_caution', 'population_specific_note', 'dosage_context'].includes(entry.topicType)).length,
      mechanism: rows.filter(entry => ['mechanism', 'pathway', 'receptor_activity', 'enzyme_interaction', 'transporter_interaction'].includes(entry.topicType)).length,
      constituent: rows.filter(entry => ['constituent', 'constituent_relationship', 'herb_compound_link', 'compound_origin_note'].includes(entry.topicType)).length,
    },
  }
}

function run() {
  const wave2Targets = readJson<{ targets: Target[] }>(p('ops', 'reports', 'enrichment-wave-2-targets.json')).targets
  const wave2bTargets = wave2Targets.filter(t => WAVE2B_TARGET_KEYS.has(key(t.entityType, t.entitySlug))).map(t => ({ ...t, waveStatus: 'wave-2b-retargeted', selectionWhy: t.entitySlug === 'mandrake-root' ? 'Metadata-fixable wave-2 candidate with promotable non-duplicate systematic safety evidence.' : t.entitySlug === 'cbd' ? 'Metadata-fixable non-duplicate mechanism candidate with governance-safe research-gap framing.' : 'Metadata-fixable non-duplicate interaction/safety candidate likely to produce immediate governed delta.' }))

  const sourceRegistry = readJson<any[]>(p('public', 'data', 'source-registry.json'))
  const submissions = readJson<Submission[]>(p('ops', 'enrichment-submissions.json'))
  const allGoverned = readJsonl<Normalized>(p('public', 'data', 'enrichment-submissions-governed-input.jsonl'))
  const beforeGoverned = allGoverned.filter(e => !e.enrichmentId.startsWith('enr_wave2b-'))
  const wave2bCandidateIds = ['cand_wave2-mandrake-clinical-toxicology-2023', 'cand_wave2-cbd-pharmacology-atlas-2025', 'cand_wave2-luteolin-ddi-safety-2024']

  const approvedSources = sourceRegistry.filter(source => source.active && String(source.notes || '').includes('Promoted via source-wave-2 review') && wave2bCandidateIds.some(id => String(source.notes || '').includes(`candidateSourceId=${id}`)))

  const approvedEntries = submissions.filter(s => s.submissionId.startsWith('sub_wave2b-') && s.reviewStatus === 'approved_for_rollup' && s.active && (s.editorialStatus === 'approved' || s.editorialStatus === 'published'))

  const coverageDeltas = wave2bTargets.map(t => {
    const before = coverage(beforeGoverned, t.entityType, t.entitySlug)
    const after = coverage(allGoverned, t.entityType, t.entitySlug)
    return { entityType: t.entityType, entitySlug: t.entitySlug, beforeGovernedEntries: before.governedEntries, afterGovernedEntries: after.governedEntries, deltaGovernedEntries: after.governedEntries - before.governedEntries, beforeTopicCoverage: before.topicCoverage, afterTopicCoverage: after.topicCoverage }
  })

  const remaining = wave2Targets.map(t => {
    const after = coverage(allGoverned, t.entityType, t.entitySlug).topicCoverage
    const unresolved = t.highestPriorityMissingTopics.filter(topic => topic === 'evidence' ? after.evidence === 0 : topic === 'safety' ? after.safety === 0 : topic === 'mechanism' ? after.mechanism === 0 : topic === 'constituent' ? after.constituent === 0 : true)
    return { entityType: t.entityType, entitySlug: t.entitySlug, unresolvedCriticalTopics: unresolved, stillBlockedFromStrongCoverage: unresolved.length > 0 }
  })

  const blockerReport = { generatedAt: new Date().toISOString(), deterministicModelVersion: 'enrichment-wave-2-blockers-v1', failedWaveTargetCount: ORIGINAL_BLOCKERS.length, blockersByTarget: ORIGINAL_BLOCKERS }
  const targetReport = { generatedAt: new Date().toISOString(), deterministicModelVersion: 'enrichment-wave-2b-targets-v1', targets: wave2bTargets }
  const summary = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-wave-2b-summary-v1',
    originalWave2BlockersPath: 'ops/reports/enrichment-wave-2-blockers.json',
    wave2bTargets: wave2bTargets.map(t => ({ entityType: t.entityType, entitySlug: t.entitySlug, selectionWhy: t.selectionWhy, highestPriorityMissingTopics: t.highestPriorityMissingTopics })),
    approvedNewSourceCount: approvedSources.length,
    approvedNewSourceIds: approvedSources.map(s => s.sourceId),
    approvedPromotedNewEnrichmentEntryCount: approvedEntries.length,
    approvedPromotedSubmissionIds: approvedEntries.map(s => s.submissionId),
    coverageDeltas,
    remainingUnresolvedCriticalGapsAfterWave2b: remaining,
  }

  const md = ['# Enrichment Wave 2b', '', `Generated: ${summary.generatedAt}`, '', '## Original wave-2 blocker classification', ...ORIGINAL_BLOCKERS.map(r => `- ${r.entityType}:${r.entitySlug} => ${r.blockerClasses.join('; ')}. ${r.endedAtDeltaZeroWhy}`), '', '## Retargeted wave-2b entities', ...wave2bTargets.map(r => `- ${r.entityType}:${r.entitySlug} — ${r.selectionWhy}`), '', '## Execution totals', `- Approved new source count: ${summary.approvedNewSourceCount}`, `- Approved/promoted new enrichment entry count: ${summary.approvedPromotedNewEnrichmentEntryCount}`, '', '## Coverage deltas (wave-2b targets)', ...coverageDeltas.map(r => `- ${r.entityType}:${r.entitySlug} governed entries ${r.beforeGovernedEntries} -> ${r.afterGovernedEntries} (delta ${r.deltaGovernedEntries})`), '', '## Remaining unresolved critical gaps after wave-2b', ...remaining.map(r => `- ${r.entityType}:${r.entitySlug}: ${r.unresolvedCriticalTopics.join(', ') || 'none'}`)]

  fs.writeFileSync(p('ops', 'reports', 'enrichment-wave-2-blockers.json'), JSON.stringify(blockerReport, null, 2) + '\n')
  fs.writeFileSync(p('ops', 'reports', 'enrichment-wave-2b-targets.json'), JSON.stringify(targetReport, null, 2) + '\n')
  fs.writeFileSync(p('ops', 'reports', 'enrichment-wave-2b.json'), JSON.stringify(summary, null, 2) + '\n')
  fs.writeFileSync(p('ops', 'reports', 'enrichment-wave-2b.md'), md.join('\n') + '\n')
  console.log('Wrote ops/reports/enrichment-wave-2-blockers.json')
  console.log('Wrote ops/reports/enrichment-wave-2b-targets.json')
  console.log('Wrote ops/reports/enrichment-wave-2b.json')
  console.log('Wrote ops/reports/enrichment-wave-2b.md')
}

run()
