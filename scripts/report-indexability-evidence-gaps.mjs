#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

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

const RECOMMENDED_SOURCE_CLASSES = [
  'systematic-review-meta-analysis',
  'randomized-human-trial',
  'observational-human-evidence',
  'preclinical-mechanistic-study',
  'regulatory-agency-monograph-guidance',
  'traditional-use-monograph',
]

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
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function writeText(relativePath, text) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function countSources(record) {
  return asArray(record?.sources)
    .map(item => (typeof item === 'string' ? item : item?.url || item?.title || ''))
    .map(asText)
    .filter(Boolean).length
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

function probeValue(value, fieldPath, out) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      out.missingFields.push(fieldPath)
      return
    }
    value.forEach((item, index) => probeValue(item, `${fieldPath}[${index}]`, out))
    return
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      out.missingFields.push(fieldPath)
      return
    }
    entries.forEach(([key, nested]) => probeValue(nested, `${fieldPath}.${key}`, out))
    return
  }

  const text = asText(value)
  if (!text) {
    out.missingFields.push(fieldPath)
    return
  }

  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))) {
    out.placeholderFields.push(fieldPath)
  }
  if (NAN_PATTERN.test(text) || INVALID_NAME_PATTERN.test(text) || /^\[object\s+object\]$/i.test(text)) {
    out.nanArtifactFields.push(fieldPath)
  }
}

function collectFieldDefects(record) {
  const out = {
    placeholderFields: [],
    nanArtifactFields: [],
    missingFields: [],
    weakNarrativeFields: [],
  }

  const inspectFields = [
    'name',
    'displayName',
    'latin',
    'description',
    'summary',
    'mechanism',
    'traditionalUse',
    'duration',
    'effects',
    'contraindications',
    'interactions',
    'safetyNotes',
    'dosage',
    'sources',
  ]

  for (const field of inspectFields) {
    probeValue(record?.[field], field, out)
  }

  const narrativeFields = ['description', 'summary', 'mechanism']
  for (const field of narrativeFields) {
    const text = asText(record?.[field])
    if (!text || text.length < QUALITY_THRESHOLDS.minDescriptionLength) {
      out.weakNarrativeFields.push(field)
      continue
    }
    if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text)) || NAN_PATTERN.test(text)) {
      out.weakNarrativeFields.push(field)
    }
  }

  out.placeholderFields = [...new Set(out.placeholderFields)].sort()
  out.nanArtifactFields = [...new Set(out.nanArtifactFields)].sort()
  out.missingFields = [...new Set(out.missingFields)].sort()
  out.weakNarrativeFields = [...new Set(out.weakNarrativeFields)].sort()
  return out
}

function buildSourceSignals(entityType, record, sourceRegistry, sourceCandidates) {
  const name = asText(record?.name || record?.displayName)
  const slug = slugify(record?.slug || name || record?.id)
  const needleParts = [name.toLowerCase(), slug.replace(/-/g, ' ')].filter(Boolean)

  const inTitle = value => {
    const hay = asText(value).toLowerCase()
    return needleParts.some(part => part && hay.includes(part))
  }

  const registryHits = sourceRegistry.filter(item => inTitle(item?.title) || inTitle(item?.shortTitle))
  const candidateHits = sourceCandidates.filter(item => {
    const intake = asText(item?.intakeTaskId).toLowerCase()
    const forType = entityType === 'herb' ? intake.includes('wp_herb_') : intake.includes('wp_compound_')
    return forType && (inTitle(item?.title) || intake.includes(slug))
  })

  return {
    registryHits: registryHits.length,
    candidateHits: candidateHits.length,
    candidateApprovedHits: candidateHits.filter(item => item?.reviewStatus === 'approved_for_registry').length,
  }
}

function classifyPatchScope(failReasons, defects) {
  const touchesTopLevel =
    defects.placeholderFields.some(path => !path.startsWith('sources')) ||
    defects.nanArtifactFields.some(path => !path.startsWith('sources')) ||
    defects.weakNarrativeFields.length > 0
  const touchesResearch = failReasons.includes('insufficientEvidenceOrCompleteness') || failReasons.includes('insufficientEffects')
  const corrupted = failReasons.includes('invalidNameOrSlug') || failReasons.includes('nanArtifacts')

  if (corrupted && (defects.nanArtifactFields.some(field => field.startsWith('name')) || defects.nanArtifactFields.includes('displayName'))) {
    return 'blocked / human review needed'
  }
  if (touchesTopLevel && touchesResearch) return 'both'
  if (touchesResearch) return 'researchEnrichment only'
  return 'top-level summary fields only'
}

function recommendSourceClasses(failReasons, defects) {
  const out = new Set()
  if (failReasons.includes('weakDescription') || failReasons.includes('insufficientEffects')) {
    out.add('systematic-review-meta-analysis')
    out.add('randomized-human-trial')
  }
  if (
    failReasons.includes('insufficientEffects') ||
    defects.placeholderFields.some(field => field.startsWith('interactions') || field.startsWith('contraindications') || field.startsWith('safetyNotes'))
  ) {
    out.add('observational-human-evidence')
    out.add('regulatory-agency-monograph-guidance')
  }
  if (defects.weakNarrativeFields.includes('mechanism') || defects.placeholderFields.some(field => field.startsWith('mechanism'))) {
    out.add('preclinical-mechanistic-study')
  }
  if (defects.placeholderFields.some(field => field.startsWith('traditionalUse'))) {
    out.add('traditional-use-monograph')
  }

  if (out.size === 0) {
    out.add('systematic-review-meta-analysis')
    out.add('observational-human-evidence')
  }

  return RECOMMENDED_SOURCE_CLASSES.filter(sourceClass => out.has(sourceClass))
}

function computePriorityScore(audit, defects, sourceSignals, entityType) {
  let score = 0

  const nearPass = Math.max(0, 30 - audit.exclusionReasons.length * 8)
  score += nearPass

  const seoImpact = entityType === 'herb' ? 20 : 14
  score += seoImpact

  const safetySignals =
    defects.placeholderFields.filter(field => /contraindications|interactions|safetyNotes|adverse/i.test(field)).length +
    defects.missingFields.filter(field => /contraindications|interactions|safetyNotes|adverse/i.test(field)).length
  score += Math.min(20, safetySignals * 4)

  const sourceProbability = Math.min(30, sourceSignals.registryHits * 2 + sourceSignals.candidateHits * 3 + sourceSignals.candidateApprovedHits * 3)
  score += sourceProbability

  if (audit.exclusionReasons.includes('invalidNameOrSlug')) score -= 25
  if (audit.exclusionReasons.includes('nanArtifacts')) score -= 20

  return Math.max(0, Math.min(100, Math.round(score)))
}

function likelyFixableBySourceDiscoveryAlone(audit, defects) {
  if (audit.exclusionReasons.includes('invalidNameOrSlug') || audit.exclusionReasons.includes('nanArtifacts')) return false
  if (defects.nanArtifactFields.some(field => field.startsWith('name') || field.startsWith('displayName') || field.startsWith('slug'))) {
    return false
  }
  return true
}

function estimateSourcesNeeded(audit, defects) {
  let needed = 2
  if (audit.exclusionReasons.includes('insufficientEffects')) needed += 1
  if (audit.exclusionReasons.includes('weakDescription')) needed += 1
  if (defects.placeholderFields.some(field => field.startsWith('mechanism'))) needed += 1
  return Math.max(2, Math.min(5, needed))
}

function buildBlockedRecord(entityType, record, audit, sourceRegistry, sourceCandidates) {
  const defects = collectFieldDefects(record)
  const sourceSignals = buildSourceSignals(entityType, record, sourceRegistry, sourceCandidates)
  const sourceDiscoveryOnly = likelyFixableBySourceDiscoveryAlone(audit, defects)
  const recommendedSourceClasses = recommendSourceClasses(audit.exclusionReasons, defects)
  const priorityScore = computePriorityScore(audit, defects, sourceSignals, entityType)

  return {
    entityType,
    entitySlug: audit.entitySlug,
    displayName: audit.displayName,
    failingReasons: audit.exclusionReasons,
    failingFields: {
      placeholderFields: defects.placeholderFields,
      nanArtifactFields: defects.nanArtifactFields,
      missingFields: defects.missingFields,
      weakNarrativeFields: defects.weakNarrativeFields,
    },
    likelyFixableBySourceDiscoveryAlone: sourceDiscoveryOnly,
    likelySourceClassesNeeded: recommendedSourceClasses,
    recommendedPriorityScore: priorityScore,
    recommendedPatchScope: classifyPatchScope(audit.exclusionReasons, defects),
    estimatedGoodSourcesNeeded: estimateSourcesNeeded(audit, defects),
    completenessScore: audit.completenessScore,
    sourceSignals,
  }
}

function toMarkdown(report) {
  const lines = []
  lines.push('# Indexability Evidence Gap Audit')
  lines.push('')
  lines.push(`Generated at: ${report.generatedAt}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Herbs blocked: ${report.summary.herbs.blocked} / ${report.summary.herbs.total}`)
  lines.push(`- Compounds blocked: ${report.summary.compounds.blocked} / ${report.summary.compounds.total}`)
  lines.push(`- Corrupted records needing human review: ${report.queues.corruptedRecordsNeedingHumanReview.length}`)
  lines.push('')

  const queueSection = (title, queue) => {
    lines.push(`## ${title}`)
    lines.push('')
    lines.push('| Rank | Type | Slug | Name | Priority | Sources Needed | Failing Reasons |')
    lines.push('| --- | --- | --- | --- | ---: | ---: | --- |')
    queue.forEach((item, index) => {
      lines.push(
        `| ${index + 1} | ${item.entityType} | ${item.entitySlug} | ${item.displayName.replace(/\|/g, '\\|')} | ${item.recommendedPriorityScore} | ${item.estimatedGoodSourcesNeeded} | ${item.failingReasons.join(', ')} |`
      )
    })
    lines.push('')
  }

  queueSection('Top 50 herbs likely to become indexable with 2–5 good sources', report.queues.topHerbsLikelyIndexableWith2To5Sources)
  queueSection('Top 50 compounds likely to become indexable with 2–5 good sources', report.queues.topCompoundsLikelyIndexableWith2To5Sources)

  lines.push('## Corrupted records needing human review')
  lines.push('')
  lines.push('| Rank | Type | Slug | Name | Reasons | Human-review blockers |')
  lines.push('| --- | --- | --- | --- | --- | --- |')
  report.queues.corruptedRecordsNeedingHumanReview.forEach((item, index) => {
    const blockers = [
      ...item.failingFields.nanArtifactFields,
      ...item.failingFields.placeholderFields.filter(field => field.startsWith('name') || field.startsWith('displayName')),
    ]
    lines.push(
      `| ${index + 1} | ${item.entityType} | ${item.entitySlug} | ${item.displayName.replace(/\|/g, '\\|')} | ${item.failingReasons.join(', ')} | ${[...new Set(blockers)].join(', ') || 'manual verification required'} |`
    )
  })
  lines.push('')

  return lines.join('\n') + '\n'
}

function run() {
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const sourceCandidates = readJson('ops/source-candidates.json')
  const sourceRegistry = readJson('public/data/source-registry.json')

  const herbAudits = herbs.map(record => auditEntity(record, 'herb'))
  const compoundAudits = compounds.map(record => auditEntity(record, 'compound'))

  const blockedHerbs = herbAudits
    .map((audit, index) => ({ audit, record: herbs[index] }))
    .filter(item => !item.audit.passesIndexThreshold)
    .map(item => buildBlockedRecord('herb', item.record, item.audit, sourceRegistry, sourceCandidates))

  const blockedCompounds = compoundAudits
    .map((audit, index) => ({ audit, record: compounds[index] }))
    .filter(item => !item.audit.passesIndexThreshold)
    .map(item => buildBlockedRecord('compound', item.record, item.audit, sourceRegistry, sourceCandidates))

  const rankedBlocked = [...blockedHerbs, ...blockedCompounds].sort((a, b) => b.recommendedPriorityScore - a.recommendedPriorityScore)

  const fixableQueue = entityType =>
    rankedBlocked
      .filter(item => item.entityType === entityType)
      .filter(item => item.likelyFixableBySourceDiscoveryAlone)
      .filter(item => item.estimatedGoodSourcesNeeded >= 2 && item.estimatedGoodSourcesNeeded <= 5)
      .slice(0, 50)

  const corrupted = rankedBlocked
    .filter(item => item.recommendedPatchScope === 'blocked / human review needed')
    .slice(0, 200)

  const report = {
    generatedAt: new Date().toISOString(),
    thresholds: QUALITY_THRESHOLDS,
    summary: {
      herbs: {
        total: herbs.length,
        blocked: blockedHerbs.length,
      },
      compounds: {
        total: compounds.length,
        blocked: blockedCompounds.length,
      },
    },
    blockedEntities: rankedBlocked,
    queues: {
      topHerbsLikelyIndexableWith2To5Sources: fixableQueue('herb'),
      topCompoundsLikelyIndexableWith2To5Sources: fixableQueue('compound'),
      corruptedRecordsNeedingHumanReview: corrupted,
    },
  }

  writeJson('ops/reports/indexability-evidence-gap-audit.json', report)
  writeText('ops/reports/indexability-evidence-gap-audit.md', toMarkdown(report))

  console.log(
    `[report-indexability-evidence-gaps] wrote blocked=${rankedBlocked.length} herbs=${blockedHerbs.length} compounds=${blockedCompounds.length}`
  )
}

run()
