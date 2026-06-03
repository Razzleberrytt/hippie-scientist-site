#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { countBootstrapSources, sourceCountBuckets } from './source-normalization.mjs'

const ROOT = process.cwd()
const DETERMINISTIC_MODEL_VERSION = 'indexability-rescue-wave-v2'

const QUALITY_THRESHOLDS = {
  minDescriptionLength: 30,
  minSources: 2,
  minEffects: 1,
  minCompletenessScore: 0.4,
  minSlugLength: 2,
}

const PLACEHOLDER_PATTERNS = [
  /\bno direct\b/i,
  /\bcontextual inference\b/i,
  /\bnot established\b/i,
  /\binsufficient data\b/i,
  /\bunknown\b/i,
  /\[object\s+object\]/i,
  /\bplaceholder\b/i,
]

const NAN_PATTERN = /(^|[^a-z0-9])nan([^a-z0-9]|$)/i
const INVALID_NAME_PATTERN = /^(?:nan|null|undefined|n\/a)$/i
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/
const VALID_NAME_CHARS = /^[\p{L}\p{N}][\p{L}\p{N}\s\-,'()./]*[\p{L}\p{N})]$/u

const asArray = value => (Array.isArray(value) ? value : [])
const asText = value => String(value || '').trim()

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function writeJson(relativePath, data) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function writeText(relativePath, text) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function countSources(record) {
  return countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
}

function countEffects(record) {
  return asArray(record?.effects)
    .map(asText)
    .filter(Boolean)
    .filter(text => !NAN_PATTERN.test(text))
    .filter(text => !PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))).length
}

function collectTextFields(record) {
  const textFields = [
    record?.name,
    record?.latin,
    record?.description,
    record?.summary,
    record?.mechanism,
    record?.duration,
    record?.traditionalUse,
    record?.safetyNotes,
  ]

  return [...textFields, ...asArray(record?.effects), ...asArray(record?.contraindications), ...asArray(record?.interactions)]
    .map(asText)
    .filter(Boolean)
    .join(' ')
}

function hasPlaceholderText(record) {
  const corpus = collectTextFields(record)
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(corpus))
}

function hasNanArtifacts(record) {
  const nameField = asText(record?.name)
  if (!nameField) return true
  if (INVALID_NAME_PATTERN.test(nameField)) return true
  return NAN_PATTERN.test(nameField)
}

function hasUsableDescription(record) {
  const narrative = [record?.description, record?.summary, record?.mechanism]
    .map(asText)
    .filter(Boolean)
    .join(' ')
  if (narrative.length < QUALITY_THRESHOLDS.minDescriptionLength) return false
  if (NAN_PATTERN.test(narrative)) return false
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(narrative))) return false
  return true
}

function hasValidName(record) {
  const name = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
  const slug = slugify(record?.slug || name || record?.id)
  if (!name || !slug) return false
  if (INVALID_NAME_PATTERN.test(name)) return false
  if (slug.length < QUALITY_THRESHOLDS.minSlugLength) return false
  if (!VALID_NAME_CHARS.test(name)) return false
  if (NAN_PATTERN.test(name)) return false
  if (/^\[object\s+object\]$/i.test(name)) return false
  if (NUMERIC_ONLY_NAME.test(name)) return false
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(name))) return false
  return true
}

function scoreRecord(record) {
  const sourceCount = countSources(record)
  const effectCount = countEffects(record)
  const hasMechanism = asText(record?.mechanism).length > 0 ? 1 : 0
  const hasDescription = hasUsableDescription(record) ? 1 : 0
  const hasContraindications = asArray(record?.contraindications).map(asText).filter(Boolean).length > 0 ? 1 : 0
  return sourceCount * 3 + effectCount + hasMechanism * 2 + hasDescription * 2 + hasContraindications
}

function auditEntity(record, type) {
  const name = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
  const slug = slugify(record?.slug || name || record?.id)

  const flags = {
    hasValidName: hasValidName(record),
    hasUsableDescription: hasUsableDescription(record),
    hasPlaceholderText: hasPlaceholderText(record),
    hasNanArtifacts: hasNanArtifacts(record),
    sourceCount: countSources(record),
    effectCount: countEffects(record),
  }

  const completenessScore = scoreRecord(record)
  const exclusionReasons = []
  if (!flags.hasValidName) exclusionReasons.push('invalidNameOrSlug')
  if (!flags.hasUsableDescription) exclusionReasons.push('weakDescription')
  if (flags.hasPlaceholderText) exclusionReasons.push('placeholderText')
  if (flags.hasNanArtifacts) exclusionReasons.push('nanArtifacts')
  if (flags.effectCount < QUALITY_THRESHOLDS.minEffects) exclusionReasons.push('insufficientEffects')
  if (flags.sourceCount < QUALITY_THRESHOLDS.minSources && completenessScore < QUALITY_THRESHOLDS.minCompletenessScore) {
    exclusionReasons.push('insufficientEvidenceOrCompleteness')
  }

  return {
    entityType: type,
    entitySlug: slug,
    displayName: asText(record?.displayName || record?.commonName || record?.name || record?.latin || slug),
    flags,
    completenessScore,
    exclusionReasons,
    passesIndexThreshold:
      flags.hasValidName &&
      flags.hasUsableDescription &&
      !flags.hasPlaceholderText &&
      !flags.hasNanArtifacts &&
      flags.effectCount >= QUALITY_THRESHOLDS.minEffects,
  }
}

function topicCandidates(record) {
  return {
    evidence: countSources(record),
    mechanism: asText(record?.mechanism).length,
    safety:
      asArray(record?.contraindications).length +
      asArray(record?.interactions).length +
      asText(record?.safetyNotes).length,
    constituent: asArray(record?.constituents).length,
    dosage: asText(record?.duration).length + asText(record?.dosage).length,
    traditionalUse: asText(record?.traditionalUse).length,
  }
}

function inferMissingTopics(audit, record) {
  const topics = new Set()
  const topicSignals = topicCandidates(record)

  if (audit.exclusionReasons.includes('weakDescription')) {
    topics.add('evidence')
    topics.add('mechanism')
  }
  if (audit.exclusionReasons.includes('insufficientEffects')) {
    topics.add('evidence')
    topics.add('safety')
  }
  if (audit.exclusionReasons.includes('placeholderText')) {
    topics.add('evidence')
    topics.add('safety')
  }

  if (topicSignals.mechanism < QUALITY_THRESHOLDS.minDescriptionLength) topics.add('mechanism')
  if (topicSignals.safety === 0) topics.add('safety')
  if (topicSignals.constituent === 0) topics.add('constituent')
  if (topicSignals.dosage === 0) topics.add('dosage')
  if (topicSignals.traditionalUse === 0 && audit.entityType === 'herb') topics.add('traditional-use')

  const ordered = ['safety', 'evidence', 'mechanism', 'constituent', 'dosage', 'traditional-use']
  return ordered.filter(topic => topics.has(topic)).slice(0, 4)
}

function inferSourceGapTypes(audit, topics) {
  const gapTypes = new Set()
  if (audit.exclusionReasons.includes('placeholderText')) gapTypes.add('placeholder-claims-need-verifiable-sources')
  if (audit.exclusionReasons.includes('insufficientEffects')) gapTypes.add('insufficient-clinical-or-observational-support')
  if (topics.includes('mechanism')) gapTypes.add('mechanism-evidence-gap')
  if (topics.includes('safety')) gapTypes.add('safety-evidence-gap')
  if (topics.includes('constituent')) gapTypes.add('constituent-evidence-gap')
  if (topics.includes('evidence')) gapTypes.add('summary-evidence-gap')
  return [...gapTypes].slice(0, 4)
}

function buildCandidateLookup(sourceCandidates) {
  const lookup = new Map()
  for (const candidate of sourceCandidates) {
    const intake = asText(candidate?.intakeTaskId).toLowerCase()
    const slugMatch = /wp_(?:herb|compound)_([a-z0-9_]+?)_/u.exec(intake)
    if (!slugMatch) continue
    const slug = slugMatch[1].replace(/_/g, '-')
    if (!lookup.has(slug)) lookup.set(slug, [])
    lookup.get(slug).push(candidate)
  }
  return lookup
}

function estimatedPromotableSourceCount(entitySlug, candidatesBySlug) {
  const rows = candidatesBySlug.get(entitySlug) || []
  return rows.filter(row => ['approved_for_registry', 'draft_candidate'].includes(row?.reviewStatus)).length
}

function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)
}

function inferGovernedCoverageStatus(audit) {
  if (audit.exclusionReasons.includes('invalidNameOrSlug') || audit.exclusionReasons.includes('nanArtifacts')) {
    return 'identity-corrupted'
  }
  if (audit.exclusionReasons.length === 0) return 'sufficient'
  if (audit.flags.sourceCount < QUALITY_THRESHOLDS.minSources) return 'blocked'
  return 'partial-blocked'
}

function inferSafetyCriticality(topics) {
  if (topics.includes('safety')) return 'safety-critical'
  if (topics.includes('evidence')) return 'evidence-critical'
  return 'standard'
}

function inferNextAction(target) {
  if (target.blockedForHumanReview) return 'human-review-required-before-any-source-work'
  if (target.estimatedPromotableSourceCount === 0) return 'source-discovery-workpack'
  if (target.estimatedPromotableSourceCount > 0 && target.currentGovernedCoverageStatus !== 'sufficient') {
    return 'source-promotion-then-enrichment-batch'
  }
  return 'enrichment-batch'
}

function buildWorkpack(target) {
  const scopeId = `${target.entityType}_${target.entitySlug.replace(/-/g, '_')}`
  const mechanismTask = target.entityType === 'compound' ? 'mechanism-compound' : 'mechanism-herb'
  if (target.blockedForHumanReview) {
    return {
      workpackType: 'human-review-blocker',
      workpackId: `idx_rescue_hr_${scopeId}`,
      lane: 'C',
      blockedForHumanReview: true,
      objective: 'Resolve identity/name integrity before source or enrichment operations.',
      suggestedCommands: ['npm run report:indexability-rescue'],
      deliverables: ['Manual identity remediation decision record'],
    }
  }

  if (target.recommendedNextAction === 'source-discovery-workpack') {
    return {
      workpackType: 'source-discovery',
      workpackId: `idx_rescue_sd_${scopeId}`,
      lane: 'B',
      blockedForHumanReview: false,
      objective: 'Discover candidate sources for highest-priority missing topics without altering gate rules.',
      suggestedCommands: ['npm run report:indexability-rescue', 'npm run report:source-intake-queue'],
      deliverables: ['Candidate additions in ops/source-candidates.json'],
    }
  }

  if (target.recommendedNextAction === 'source-promotion-then-enrichment-batch') {
    return {
      workpackType: 'source-promotion-and-enrichment',
      workpackId: `idx_rescue_sp_${scopeId}`,
      lane: 'B',
      blockedForHumanReview: false,
      objective: 'Promote promotable candidates, then enqueue governed enrichment batch work.',
      suggestedCommands: [
        'npm run report:indexability-rescue',
        'npm run enrichment:plan -- --task sources --batch-size 10 --dry-run',
        'npm run enrichment:run -- --task sources --batch-size 10 --dry-run',
      ],
      deliverables: ['Promoted source candidates and planned enrichment run manifest'],
    }
  }

  return {
    workpackType: 'enrichment-batch',
    workpackId: `idx_rescue_eb_${scopeId}`,
    lane: 'A',
    blockedForHumanReview: false,
    objective: 'Execute governed enrichment with existing promoted source coverage.',
    suggestedCommands: [
      'npm run report:indexability-rescue',
      `npm run enrichment:plan -- --task ${mechanismTask} --batch-size 10 --dry-run`,
      `npm run enrichment:run -- --task ${mechanismTask} --batch-size 10 --dry-run`,
      'npm run enrichment:validate:dry',
    ],
    deliverables: ['Batch manifest and validated patch set'],
  }
}

function toMarkdown(report) {
  const lines = []
  lines.push('# Indexability Rescue Wave')
  lines.push('')
  lines.push(`- Generated at: ${report.generatedAt}`)
  lines.push(`- Deterministic model version: ${report.deterministicModelVersion}`)
  lines.push(`- Candidate count: ${report.summary.totalTargets}`)
  lines.push(`- Blocked for human review: ${report.summary.blockedForHumanReview}`)
  lines.push(`- Deterministic target hash: ${report.summary.deterministicTargetHash}`)
  lines.push('')

  lines.push('## Workflow queues')
  lines.push('')

  const sections = [
    ['Source discovery workpacks', report.queues.sourceDiscovery],
    ['Source promotion first', report.queues.sourcePromotion],
    ['Direct enrichment batches', report.queues.enrichmentBatch],
    ['Human review blockers', report.queues.humanReview],
  ]

  for (const [label, queue] of sections) {
    lines.push(`### ${label}`)
    lines.push('')
    lines.push('| Rank | Type | Slug | Failing reasons | Missing topics | Promotable sources | Next action |')
    lines.push('| --- | --- | --- | --- | --- | ---: | --- |')
    queue.forEach((target, index) => {
      lines.push(
        `| ${index + 1} | ${target.entityType} | ${target.entitySlug} | ${target.currentFailingReasons.join(', ')} | ${target.highestPriorityMissingTopics.join(', ')} | ${target.estimatedPromotableSourceCount} | ${target.recommendedNextAction} |`,
      )
    })
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function run() {
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const sourceCandidates = readJson('ops/source-candidates.json')

  const candidatesBySlug = buildCandidateLookup(sourceCandidates)
  const herbSourceBuckets = sourceCountBuckets(herbs.map(record => [record?.sources, record?.source, record?.references, record?.citations]))
  const compoundSourceBuckets = sourceCountBuckets(
    compounds.map(record => [record?.sources, record?.source, record?.references, record?.citations]),
  )

  const blockedRecords = [
    ...herbs.map(record => ({ entityType: 'herb', record })),
    ...compounds.map(record => ({ entityType: 'compound', record })),
  ]
    .map(({ entityType, record }) => ({
      entityType,
      record,
      audit: auditEntity(record, entityType),
    }))
    .filter(item => !item.audit.passesIndexThreshold)

  const targets = blockedRecords
    .map(({ entityType, record, audit }) => {
      const highestPriorityMissingTopics = inferMissingTopics(audit, record)
      const sourceGapTypes = inferSourceGapTypes(audit, highestPriorityMissingTopics)
      const blockedForHumanReview = audit.exclusionReasons.includes('invalidNameOrSlug') || audit.exclusionReasons.includes('nanArtifacts')
      const target = {
        entityType,
        entitySlug: audit.entitySlug,
        currentFailingReasons: audit.exclusionReasons,
        highestPriorityMissingTopics,
        sourceGapTypes,
        estimatedPromotableSourceCount: estimatedPromotableSourceCount(audit.entitySlug, candidatesBySlug),
        currentGovernedCoverageStatus: inferGovernedCoverageStatus(audit),
        recommendedNextAction: 'pending',
        safetyCriticality: inferSafetyCriticality(highestPriorityMissingTopics),
        blockedForHumanReview,
      }
      target.recommendedNextAction = inferNextAction(target)
      target.workpack = buildWorkpack(target)
      return target
    })
    .sort((a, b) => {
      if (a.blockedForHumanReview !== b.blockedForHumanReview) return a.blockedForHumanReview ? 1 : -1
      if (a.estimatedPromotableSourceCount !== b.estimatedPromotableSourceCount) {
        return b.estimatedPromotableSourceCount - a.estimatedPromotableSourceCount
      }
      return `${a.entityType}:${a.entitySlug}`.localeCompare(`${b.entityType}:${b.entitySlug}`)
    })

  const deterministicTargetHash = stableHash(
    targets.map(target => ({
      entityType: target.entityType,
      entitySlug: target.entitySlug,
      currentFailingReasons: target.currentFailingReasons,
      highestPriorityMissingTopics: target.highestPriorityMissingTopics,
      sourceGapTypes: target.sourceGapTypes,
      estimatedPromotableSourceCount: target.estimatedPromotableSourceCount,
      currentGovernedCoverageStatus: target.currentGovernedCoverageStatus,
      recommendedNextAction: target.recommendedNextAction,
      safetyCriticality: target.safetyCriticality,
      blockedForHumanReview: target.blockedForHumanReview,
      workpackType: target.workpack.workpackType,
    })),
  )

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: DETERMINISTIC_MODEL_VERSION,
    sources: {
      qualityGateScript: 'scripts/quality-gate-data.mjs',
      sourceCandidates: 'ops/source-candidates.json',
    },
    summary: {
      totalTargets: targets.length,
      deterministicTargetHash,
      blockedForHumanReview: targets.filter(target => target.blockedForHumanReview).length,
      sourceDiscoveryQueue: targets.filter(target => target.recommendedNextAction === 'source-discovery-workpack').length,
      sourcePromotionQueue: targets.filter(target => target.recommendedNextAction === 'source-promotion-then-enrichment-batch').length,
      enrichmentBatchQueue: targets.filter(target => target.recommendedNextAction === 'enrichment-batch').length,
    },
    targets,
    queues: {
      sourceDiscovery: targets.filter(target => target.recommendedNextAction === 'source-discovery-workpack').slice(0, 100),
      sourcePromotion: targets.filter(target => target.recommendedNextAction === 'source-promotion-then-enrichment-batch').slice(0, 100),
      enrichmentBatch: targets.filter(target => target.recommendedNextAction === 'enrichment-batch').slice(0, 100),
      humanReview: targets.filter(target => target.blockedForHumanReview).slice(0, 100),
    },
  }

  writeJson('ops/targets/indexability-rescue-wave.json', {
    generatedAt: report.generatedAt,
    deterministicModelVersion: report.deterministicModelVersion,
    deterministicTargetHash,
    targets: report.targets,
    summary: report.summary,
  })
  writeText('ops/reports/indexability-rescue-wave.md', toMarkdown(report))

  console.log(`[report-indexability-rescue-wave] wrote ops/targets/indexability-rescue-wave.json (${targets.length} targets)`)
  console.log('[report-indexability-rescue-wave] wrote ops/reports/indexability-rescue-wave.md')
  console.log(
    `[report-indexability-rescue-wave] herbs normalized-sources zero=${herbSourceBuckets.zero} one=${herbSourceBuckets.one} twoPlus=${herbSourceBuckets.twoOrMore}`
  )
  console.log(
    `[report-indexability-rescue-wave] compounds normalized-sources zero=${compoundSourceBuckets.zero} one=${compoundSourceBuckets.one} twoPlus=${compoundSourceBuckets.twoOrMore}`
  )
}

run()
