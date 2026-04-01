import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const HERBS_PATH = 'public/data/herbs.json'
const COMPOUNDS_PATH = 'public/data/compounds.json'
const REPORT_PATH = 'DATA_QUALITY_REPORT.md'

const PLACEHOLDER_PATTERNS = [
  /^nan$/i,
  /^n\/?a$/i,
  /^none$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^todo$/i,
  /^placeholder$/i,
  /^coming soon$/i,
  /^lorem ipsum/i,
  /^insert /i,
  /^\[citation needed\]$/i,
]

const HEDGING_PATTERN = /\b(?:may|might|possibly|perhaps|potentially|could)\b/gi
const FILLER_PATTERN = /\b(?:can help with|helps with|supports|contextual inference|no direct .* data|often|typically)\b/gi
const PUNCTUATION_PATTERN = /[.,;:!?]/g

const HERB_REQUIRED_FIELDS = [
  'name',
  'latin',
  'description',
  'class',
  'effects',
  'activeCompounds',
  'contraindications',
  'sources',
  'lastUpdated',
]

const COMPOUND_REQUIRED_FIELDS = [
  'name',
  'category',
  'description',
  'effects',
  'contraindications',
  'herbs',
  'sources',
  'lastUpdated',
]

const MAX_WORDS = 12
const MIN_WORDS = 1

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanText(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))) return ''
  return text
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(/[\n;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeStyle(text) {
  return text
    .toLowerCase()
    .replace(PUNCTUATION_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizePhraseBase(value, options = {}) {
  const cleaned = cleanText(value)
  if (!cleaned) return ''
  const base = normalizeStyle(cleaned)
    .replace(FILLER_PATTERN, '')
  const withoutHedging = options.safeMode ? base : base.replace(HEDGING_PATTERN, '')
  return withoutHedging.replace(/\s+/g, ' ').trim()
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function isLengthValid(text) {
  const count = wordCount(text)
  return count >= MIN_WORDS && count <= MAX_WORDS
}

function normalizeActiveCompounds(value, fixes) {
  const out = []
  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, fixes)
    if (!phrase) continue
    if (/\b(?:contains|used|effect|helps|avoid|interact|data)\b/i.test(phrase)) continue
    if (!/^[a-z0-9\-\sα-ωβγδ]+$/i.test(phrase)) continue
    if (!isLengthValid(phrase)) {
      fixes.longPhrasesRemoved += 1
      continue
    }
    out.push(phrase)
  }
  return Array.from(new Set(out))
}

function normalizeEffects(value, fixes) {
  const out = []
  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, fixes)
    if (!phrase) continue
    const cleaned = phrase
      .replace(/\b(?:help with|help|with|can|supports?)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!cleaned) continue
    if (!isLengthValid(cleaned)) {
      fixes.longPhrasesRemoved += 1
      continue
    }
    out.push(cleaned)
  }
  return Array.from(new Set(out))
}

function normalizeContraindications(value, fixes) {
  const out = []

  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, fixes)
    if (!phrase) continue

    let standardized = ''
    if (/pregnan/.test(phrase)) standardized = 'avoid in pregnancy'
    else if (/breastfeed|lactat/.test(phrase)) standardized = 'avoid during breastfeeding'
    else if (/ssri/.test(phrase)) standardized = 'may interact with ssris'
    else if (/maoi/.test(phrase)) standardized = 'may interact with maois'
    else if (/liver/.test(phrase)) standardized = 'avoid in liver disease'
    else if (/kidney/.test(phrase)) standardized = 'avoid in kidney disease'
    else if (/bleed|anticoagul/.test(phrase)) standardized = 'may increase bleeding risk'
    else if (/mental health|psychosis|mania/.test(phrase)) standardized = 'avoid with unstable mental health conditions'
    else standardized = phrase.startsWith('avoid') || phrase.startsWith('may interact') ? phrase : `avoid with ${phrase}`

    if (!fixes.safeMode && !standardized.startsWith('may interact with')) {
      standardized = standardized.replace(HEDGING_PATTERN, '').replace(/\s+/g, ' ').trim()
    }
    standardized = standardized.replace(/\s+/g, ' ').trim()
    if (!isLengthValid(standardized)) {
      fixes.longPhrasesRemoved += 1
      continue
    }
    out.push(standardized)
  }

  return Array.from(new Set(out))
}

function normalizeMechanism(value, fixes) {
  const phrases = toArray(value)
    .flatMap(item => String(item).split(/[.!?;,|]/))
    .map(part => normalizePhraseBase(part, fixes))
    .filter(Boolean)
    .filter(part => !/\b(?:herbs often act|contextual inference|no direct data)\b/i.test(part))
    .filter(part => {
      if (!isLengthValid(part)) {
        fixes.longPhrasesRemoved += 1
        return false
      }
      return true
    })

  const uniq = Array.from(new Set(phrases))
  return uniq.slice(0, 3).join(' | ')
}

function sanitizeStringArray(value, fixes) {
  return toArray(value)
    .map(item => cleanText(item))
    .filter(Boolean)
    .filter(item => {
      if (item.toLowerCase() === 'nan') {
        fixes.nanRemoved += 1
        return false
      }
      return true
    })
}

function isValidIso(value) {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.toISOString() === value
}

function looksLikeUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeSources(value, fixes) {
  const sourceList = toArray(value)
  const normalized = []

  for (const entry of sourceList) {
    if (isObject(entry)) {
      const title = cleanText(entry.title)
      const url = cleanText(entry.url)
      const note = cleanText(entry.note)
      if (!title || !looksLikeUrl(url)) {
        fixes.invalidSourcesRemoved += 1
        continue
      }
      normalized.push({ title, url, ...(note ? { note } : {}) })
      continue
    }

    if (typeof entry === 'string') {
      const text = cleanText(entry)
      if (looksLikeUrl(text)) {
        normalized.push({ title: text, url: text })
      } else {
        fixes.invalidSourcesRemoved += 1
      }
      continue
    }

    fixes.invalidSourcesRemoved += 1
  }

  return normalized
}

function ensureIsoDate(value, fixes) {
  const text = cleanText(value)
  if (isValidIso(text)) return text
  fixes.lastUpdatedFixed += 1
  return new Date().toISOString()
}

function removeCrossFieldDuplicates(herb, fixes) {
  const seen = new Set()
  const fields = ['activeCompounds', 'effects', 'contraindications']

  for (const field of fields) {
    const kept = []
    for (const item of herb[field]) {
      const key = normalizeStyle(item)
      if (!key || seen.has(key)) {
        fixes.crossFieldDuplicatesRemoved += 1
        continue
      }
      seen.add(key)
      kept.push(item)
    }
    herb[field] = kept
  }

  if (herb.mechanism) {
    const mechanismPhrases = herb.mechanism.split('|').map(part => normalizeStyle(part))
    const keptMechanism = []
    for (const phrase of mechanismPhrases) {
      if (!phrase || seen.has(phrase)) {
        fixes.crossFieldDuplicatesRemoved += 1
        continue
      }
      seen.add(phrase)
      keptMechanism.push(phrase)
    }
    herb.mechanism = keptMechanism.join(' | ')
  }

  return herb
}

function validateHerbConsistency(herb, options = {}) {
  const issues = []

  const listFields = ['activeCompounds', 'effects', 'contraindications']
  for (const field of listFields) {
    if (!Array.isArray(herb[field])) issues.push(`${field} must be an array`)
    for (const phrase of herb[field] || []) {
      if (/[A-Z]/.test(phrase)) issues.push(`${field} contains mixed casing`)
      if (PUNCTUATION_PATTERN.test(phrase)) issues.push(`${field} contains punctuation variation`)
      if (!isLengthValid(phrase)) issues.push(`${field} has out-of-range phrase length`)
      const hedgingCandidate =
        field === 'contraindications'
          ? phrase.replace(/\bmay interact with\b/gi, '').trim()
          : phrase
      if (!options.safeMode && HEDGING_PATTERN.test(hedgingCandidate)) issues.push(`${field} includes hedging language`)
    }
  }

  if (typeof herb.mechanism !== 'string') {
    issues.push('mechanism must be a string')
  } else {
    const mechanismParts = herb.mechanism.split('|').map(part => part.trim()).filter(Boolean)
    for (const phrase of mechanismParts) {
      if (!isLengthValid(phrase)) issues.push('mechanism phrase has out-of-range length')
      if (!options.safeMode && HEDGING_PATTERN.test(phrase)) issues.push('mechanism includes hedging language')
    }
  }

  return issues
}

function ensureUniqueByName(records, fixes, key = 'name') {
  const seen = new Map()
  const output = []

  for (const record of records) {
    const name = cleanText(record[key]).toLowerCase()
    if (!name) {
      output.push(record)
      continue
    }

    if (!seen.has(name)) {
      seen.set(name, output.length)
      output.push(record)
      continue
    }

    fixes.duplicatesMerged += 1
    const existingIndex = seen.get(name)
    const existing = output[existingIndex]

    for (const [field, incoming] of Object.entries(record)) {
      const current = existing[field]
      if (Array.isArray(current) || Array.isArray(incoming)) {
        const merged = Array.from(new Set([...toArray(current), ...toArray(incoming)].map(cleanText).filter(Boolean)))
        existing[field] = merged
        continue
      }

      const currentClean = cleanText(current)
      const incomingClean = cleanText(incoming)
      if (!currentClean && incomingClean) {
        existing[field] = incomingClean
      }
    }
  }

  return output
}

function completeness(records, fields) {
  if (!records.length) return { percent: 0, missingCounts: Object.fromEntries(fields.map(field => [field, 0])) }

  const totalCells = records.length * fields.length
  let presentCells = 0
  const missingCounts = Object.fromEntries(fields.map(field => [field, 0]))

  for (const row of records) {
    for (const field of fields) {
      const value = row[field]
      const ok = Array.isArray(value) ? value.length > 0 : cleanText(value).length > 0
      if (ok) {
        presentCells += 1
      } else {
        missingCounts[field] += 1
      }
    }
  }

  return {
    percent: Number(((presentCells / totalCells) * 100).toFixed(2)),
    missingCounts,
  }
}

function ensureHerbShape(raw, fixes) {
  const herb = {
    name: cleanText(raw.name || raw.common || raw.commonName),
    latin: cleanText(raw.latin || raw.scientific || raw.scientificName),
    class: cleanText(raw.class || raw.category),
    intensity: cleanText(raw.intensity),
    mechanism: normalizeMechanism(raw.mechanism || raw.mechanismOfAction, fixes),
    activeCompounds: normalizeActiveCompounds(raw.activeCompounds ?? raw.active_compounds ?? raw.compounds, fixes),
    effects: normalizeEffects(raw.effects, fixes),
    contraindications: normalizeContraindications(raw.contraindications, fixes),
    interactions: sanitizeStringArray(raw.interactions, fixes),
    safetyNotes: cleanText(raw.safetyNotes),
    sources: normalizeSources(raw.sources, fixes),
    lastUpdated: ensureIsoDate(raw.lastUpdated || raw.updatedAt, fixes),
    description: cleanText(raw.description || raw.summary),
    dosage: cleanText(raw.dosage),
    duration: cleanText(raw.duration),
    legalStatus: cleanText(raw.legalStatus),
    preparation: cleanText(raw.preparation),
    region: cleanText(raw.region),
    therapeuticUses: sanitizeStringArray(raw.therapeuticUses, fixes),
    traditionalUse: cleanText(raw.traditionalUse),
    sideEffects: sanitizeStringArray(raw.sideEffects ?? raw.sideeffects, fixes),
  }

  removeCrossFieldDuplicates(herb, fixes)

  // Fallback defaults for frontend compatibility
  if (!herb.name) herb.name = herb.latin || 'unnamed herb'
  if (!herb.latin) herb.latin = herb.name
  if (!herb.class) herb.class = 'general'

  return herb
}

function ensureCompoundShape(raw, herbNames, fixes) {
  const compound = {
    name: cleanText(raw.name || raw.id),
    category: cleanText(raw.category || raw.class || raw.type),
    description: cleanText(raw.description || raw.summary),
    herbs: sanitizeStringArray(raw.herbs ?? raw.associatedHerbs ?? raw.foundInHerbs ?? raw.foundIn, fixes),
    effects: sanitizeStringArray(raw.effects, fixes),
    contraindications: sanitizeStringArray(raw.contraindications, fixes),
    interactions: sanitizeStringArray(raw.interactions, fixes),
    therapeuticUses: sanitizeStringArray(raw.therapeuticUses, fixes),
    activeCompounds: sanitizeStringArray(raw.activeCompounds, fixes),
    dosage: cleanText(raw.dosage),
    duration: cleanText(raw.duration),
    region: cleanText(raw.region),
    preparation: cleanText(raw.preparation),
    legalStatus: cleanText(raw.legalStatus),
    sideEffects: sanitizeStringArray(raw.sideEffects, fixes),
    sources: normalizeSources(raw.sources, fixes),
    lastUpdated: ensureIsoDate(raw.lastUpdated || raw.updatedAt, fixes),
  }

  if (!compound.name) compound.name = 'unnamed compound'
  if (!compound.category) compound.category = 'general'

  const validHerbs = compound.herbs.filter(name => herbNames.has(name.toLowerCase()))
  if (validHerbs.length !== compound.herbs.length) {
    fixes.invalidHerbRefsRemoved += compound.herbs.length - validHerbs.length
  }
  compound.herbs = Array.from(new Set(validHerbs))

  return compound
}

function printMissingCounts(counts) {
  return Object.entries(counts)
    .map(([field, count]) => `- ${field}: ${count}`)
    .join('\n')
}

function collectVariationMetrics(records) {
  const fields = ['activeCompounds', 'effects', 'contraindications']
  let phraseCount = 0
  let hedgingCount = 0
  let punctuationCount = 0
  let mixedCaseCount = 0

  for (const row of records) {
    for (const field of fields) {
      for (const phrase of toArray(row[field])) {
        const text = String(phrase || '')
        if (!text.trim()) continue
        phraseCount += 1
        const hedgingCandidate =
          field === 'contraindications'
            ? text.replace(/\bmay interact with\b/gi, '').trim()
            : text
        if (HEDGING_PATTERN.test(hedgingCandidate)) hedgingCount += 1
        if (PUNCTUATION_PATTERN.test(text)) punctuationCount += 1
        if (/[A-Z]/.test(text)) mixedCaseCount += 1
      }
    }
  }

  return { phraseCount, hedgingCount, punctuationCount, mixedCaseCount }
}

function pickSampleRows(beforeRows, afterRows, size = 10) {
  const output = []
  for (let index = 0; index < Math.min(size, beforeRows.length, afterRows.length); index += 1) {
    output.push({
      name: afterRows[index].name,
      before: {
        activeCompounds: toArray(beforeRows[index].activeCompounds ?? beforeRows[index].active_compounds ?? beforeRows[index].compounds),
        effects: toArray(beforeRows[index].effects),
        contraindications: toArray(beforeRows[index].contraindications),
        mechanism: cleanText(beforeRows[index].mechanism || beforeRows[index].mechanismOfAction),
      },
      after: {
        activeCompounds: afterRows[index].activeCompounds,
        effects: afterRows[index].effects,
        contraindications: afterRows[index].contraindications,
        mechanism: afterRows[index].mechanism,
      },
    })
  }
  return output
}

function parseArgs(argv) {
  const args = {
    safeMode: false,
    auditOnly: false,
    sampleSize: 25,
    auditReportPath: 'ops/semantic-normalization-audit.md',
    beforeFile: '',
  }

  for (const raw of argv) {
    if (raw === '--safe-mode') args.safeMode = true
    else if (raw === '--audit-only') args.auditOnly = true
    else if (raw.startsWith('--sample-size=')) args.sampleSize = Math.max(1, Number.parseInt(raw.split('=')[1], 10) || 25)
    else if (raw.startsWith('--audit-report=')) args.auditReportPath = raw.split('=')[1] || args.auditReportPath
    else if (raw.startsWith('--before-file=')) args.beforeFile = raw.split('=')[1] || ''
  }

  return args
}

function normalizedTokenSet(values) {
  return new Set(
    values
      .flatMap(value => toArray(value))
      .map(value => normalizeStyle(String(value || '')))
      .flatMap(value => value.split(/\s+/))
      .filter(Boolean),
  )
}

function overlapRatio(beforeValues, afterValues) {
  const beforeTokens = normalizedTokenSet(beforeValues)
  const afterTokens = normalizedTokenSet(afterValues)
  if (beforeTokens.size === 0) return 1
  let overlap = 0
  for (const token of beforeTokens) {
    if (afterTokens.has(token)) overlap += 1
  }
  return overlap / beforeTokens.size
}

function transformType(beforeText, afterText) {
  const normalizedBefore = normalizeStyle(beforeText)
  const normalizedAfter = normalizeStyle(afterText)
  if (!normalizedBefore && normalizedAfter) return 'added'
  if (normalizedBefore && !normalizedAfter) return 'removed'
  if (normalizedBefore === normalizedAfter) return 'format_only'
  return 'meaning_change'
}

function buildSemanticAudit(beforeHerbs, afterHerbs, sampleSize) {
  const afterByName = new Map(afterHerbs.map(row => [normalizeStyle(row.name), row]))
  const samples = []
  const risky = []
  const revertCandidates = []
  const safeExamples = []

  for (const beforeHerb of beforeHerbs) {
    const key = normalizeStyle(beforeHerb.name || beforeHerb.common || beforeHerb.latin)
    const afterHerb = afterByName.get(key)
    if (!afterHerb) continue
    if (samples.length >= sampleSize) break

    const beforeEffects = toArray(beforeHerb.effects)
    const afterEffects = toArray(afterHerb.effects)
    const beforeContra = toArray(beforeHerb.contraindications)
    const afterContra = toArray(afterHerb.contraindications)
    const beforeCompounds = toArray(beforeHerb.activeCompounds ?? beforeHerb.active_compounds ?? beforeHerb.compounds)
    const afterCompounds = toArray(afterHerb.activeCompounds)
    const beforeMechanism = cleanText(beforeHerb.mechanism || beforeHerb.mechanismOfAction)
    const afterMechanism = cleanText(afterHerb.mechanism)

    const effectOverlap = overlapRatio(beforeEffects, afterEffects)
    const contraindicationOverlap = overlapRatio(beforeContra, afterContra)
    const compoundOverlap = overlapRatio(beforeCompounds, afterCompounds)

    const hedgingBefore = [...beforeEffects, ...beforeContra, beforeMechanism].some(value => HEDGING_PATTERN.test(String(value || '')))
    const hedgingAfter = [...afterEffects, ...afterContra, afterMechanism].some(value => HEDGING_PATTERN.test(String(value || '')))
    const hedgingLossRisk = hedgingBefore && !hedgingAfter

    const contraindicationStrictnessRisk =
      beforeContra.some(value => /\bmay|might|could|potential/i.test(String(value || ''))) &&
      afterContra.some(value => /^avoid\b/i.test(String(value || ''))) &&
      !afterContra.some(value => /^may interact\b/i.test(String(value || '')))

    const compoundsTruncatedRisk = beforeCompounds.length > 0 && afterCompounds.length / beforeCompounds.length < 0.5
    const effectsOverSimplifiedRisk =
      beforeEffects.length > 0 &&
      afterEffects.length > 0 &&
      afterEffects.every(effect => wordCount(effect) <= 3) &&
      beforeEffects.some(effect => wordCount(effect) >= 7)

    const riskFlags = []
    if (hedgingLossRisk) riskFlags.push('hedging_removed_maybe_meaningful')
    if (contraindicationStrictnessRisk) riskFlags.push('contraindication_may_be_overly_strict')
    if (compoundsTruncatedRisk) riskFlags.push('active_compounds_truncated')
    if (effectsOverSimplifiedRisk) riskFlags.push('effects_oversimplified')
    if (compoundOverlap < 0.45) riskFlags.push('compound_overlap_low')
    if (contraindicationOverlap < 0.35 && beforeContra.length > 0) riskFlags.push('contraindication_overlap_low')
    if (effectOverlap < 0.35 && beforeEffects.length > 0) riskFlags.push('effect_overlap_low')

    const sample = {
      herb: afterHerb.name,
      before: {
        activeCompounds: beforeCompounds,
        effects: beforeEffects,
        contraindications: beforeContra,
        mechanism: beforeMechanism,
      },
      after: {
        activeCompounds: afterCompounds,
        effects: afterEffects,
        contraindications: afterContra,
        mechanism: afterMechanism,
      },
      overlap: {
        activeCompounds: Number(compoundOverlap.toFixed(2)),
        effects: Number(effectOverlap.toFixed(2)),
        contraindications: Number(contraindicationOverlap.toFixed(2)),
      },
      transform: {
        mechanism: transformType(beforeMechanism, afterMechanism),
      },
      riskFlags,
    }

    samples.push(sample)
    if (riskFlags.length === 0) safeExamples.push(sample)
    else risky.push(sample)
    if (riskFlags.includes('active_compounds_truncated') || riskFlags.includes('contraindication_may_be_overly_strict')) {
      revertCandidates.push(sample)
    }
  }

  const recommendation = revertCandidates.length > 0 || risky.length > Math.floor(sampleSize * 0.4)
    ? 'needs adjustment'
    : 'safe to merge'

  return {
    sampleSize: samples.length,
    safeExamples: safeExamples.slice(0, 8),
    riskyExamples: risky.slice(0, 12),
    revertExamples: revertCandidates.slice(0, 8),
    recommendation,
  }
}

function semanticAuditMarkdown(audit) {
  const formatSamples = (samples, title) => {
    if (!samples.length) return `### ${title}\n- none\n`
    return `### ${title}\n${samples
      .map(sample => `- **${sample.herb}**\n  - risk flags: ${sample.riskFlags.length ? sample.riskFlags.join(', ') : 'none'}\n  - overlap (compounds/effects/contra): ${sample.overlap.activeCompounds}/${sample.overlap.effects}/${sample.overlap.contraindications}\n  - before contra: ${sample.before.contraindications.join(' | ') || 'none'}\n  - after contra: ${sample.after.contraindications.join(' | ') || 'none'}`)
      .join('\n')}\n`
  }

  return `# Semantic Normalization Audit\n\n- sampled herbs: ${audit.sampleSize}\n- recommendation: **${audit.recommendation}**\n\n${formatSamples(audit.safeExamples, 'Safe transformations')}\n${formatSamples(audit.riskyExamples, 'Risky transformations')}\n${formatSamples(audit.revertExamples, 'Should be reverted / manually reviewed')}\n`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const fixes = {
    nanRemoved: 0,
    invalidSourcesRemoved: 0,
    lastUpdatedFixed: 0,
    duplicatesMerged: 0,
    invalidHerbRefsRemoved: 0,
    longPhrasesRemoved: 0,
    crossFieldDuplicatesRemoved: 0,
    safeMode: args.safeMode,
  }

  const herbRaw = JSON.parse(await readFile(args.beforeFile || HERBS_PATH, 'utf8'))
  const compoundRaw = JSON.parse(await readFile(COMPOUNDS_PATH, 'utf8'))

  const herbsInput = Array.isArray(herbRaw) ? herbRaw : []
  const beforeMetrics = collectVariationMetrics(herbsInput)

  const herbsNormalized = ensureUniqueByName(
    herbsInput.map(row => ensureHerbShape(isObject(row) ? row : {}, fixes)),
    fixes,
  )

  const herbNames = new Set(herbsNormalized.map(herb => cleanText(herb.name).toLowerCase()))

  const compoundsNormalized = ensureUniqueByName(
    (Array.isArray(compoundRaw) ? compoundRaw : []).map(row => ensureCompoundShape(isObject(row) ? row : {}, herbNames, fixes)),
    fixes,
  )

  const herbCompleteness = completeness(herbsNormalized, HERB_REQUIRED_FIELDS)
  const compoundCompleteness = completeness(compoundsNormalized, COMPOUND_REQUIRED_FIELDS)
  const overallCompleteness = Number(((herbCompleteness.percent + compoundCompleteness.percent) / 2).toFixed(2))

  const consistencyIssues = herbsNormalized.flatMap(herb =>
    validateHerbConsistency(herb, args).map(issue => `${herb.name}: ${issue}`),
  )

  const afterMetrics = collectVariationMetrics(herbsNormalized)
  const samples = pickSampleRows(herbsInput, herbsNormalized, 10)

  if (!args.auditOnly) {
    await writeFile(HERBS_PATH, `${JSON.stringify(herbsNormalized, null, 2)}\n`)
    await writeFile(COMPOUNDS_PATH, `${JSON.stringify(compoundsNormalized, null, 2)}\n`)
  }

  const unresolvedIssues = []
  if (herbsNormalized.some(herb => !herb.sources.length)) {
    unresolvedIssues.push('Some herbs have zero valid sources.')
  }
  if (compoundsNormalized.some(compound => !compound.sources.length)) {
    unresolvedIssues.push('Some compounds have zero valid sources.')
  }
  if (consistencyIssues.length) {
    unresolvedIssues.push(`Consistency validation found ${consistencyIssues.length} issues.`)
  }

  const report = `# Data Quality Report\n\n- Generated: ${new Date().toISOString()}\n- Total herbs: ${herbsNormalized.length}\n- Total compounds: ${compoundsNormalized.length}\n- Completeness: ${overallCompleteness}%\n\n## Missing field counts\n\n### Herbs\n${printMissingCounts(herbCompleteness.missingCounts)}\n\n### Compounds\n${printMissingCounts(compoundCompleteness.missingCounts)}\n\n## Formatting consistency metrics\n\n### Variation reduction\n- Phrases analyzed: ${beforeMetrics.phraseCount} → ${afterMetrics.phraseCount}\n- Hedging phrases: ${beforeMetrics.hedgingCount} → ${afterMetrics.hedgingCount}\n- Punctuation variants: ${beforeMetrics.punctuationCount} → ${afterMetrics.punctuationCount}\n- Mixed casing variants: ${beforeMetrics.mixedCaseCount} → ${afterMetrics.mixedCaseCount}\n\n## Validation fixes applied\n\n- Removed invalid/placeholder source entries: ${fixes.invalidSourcesRemoved}\n- Fixed non-ISO lastUpdated fields: ${fixes.lastUpdatedFixed}\n- Merged duplicate names: ${fixes.duplicatesMerged}\n- Removed invalid herb references from compounds: ${fixes.invalidHerbRefsRemoved}\n- Removed "nan" list values: ${fixes.nanRemoved}\n- Removed over-length phrases: ${fixes.longPhrasesRemoved}\n- Removed cross-field duplicates: ${fixes.crossFieldDuplicatesRemoved}\n\n## 10-herb before vs after sample\n\n\`\`\`json\n${JSON.stringify(samples, null, 2)}\n\`\`\`\n\n## Unresolved issues\n\n${unresolvedIssues.length ? unresolvedIssues.map(item => `- ${item}`).join('\n') : '- None'}\n`

  await writeFile(REPORT_PATH, report)

  const audit = buildSemanticAudit(herbsInput, herbsNormalized, args.sampleSize)
  await mkdir(dirname(args.auditReportPath), { recursive: true })
  await writeFile(args.auditReportPath, semanticAuditMarkdown(audit))

  const summary = {
    fixes,
    passed: consistencyIssues.length === 0,
    totalHerbs: herbsNormalized.length,
    totalCompounds: compoundsNormalized.length,
    completeness: overallCompleteness,
    variation: {
      before: beforeMetrics,
      after: afterMetrics,
    },
    unresolvedIssues,
    sampleSize: samples.length,
    semanticAudit: {
      recommendation: audit.recommendation,
      safeExamples: audit.safeExamples.length,
      riskyExamples: audit.riskyExamples.length,
      revertExamples: audit.revertExamples.length,
    },
    options: args,
  }

  console.log('Validation complete.')
  console.log(`Errors fixed: ${Object.values(fixes).reduce((a, b) => a + b, 0)}`)
  console.log(`Validation passed: ${summary.passed ? 'yes' : 'no'}`)
  console.log(JSON.stringify(summary, null, 2))

  if (consistencyIssues.length) {
    console.error(`\nConsistency issues (first 30):`)
    for (const issue of consistencyIssues.slice(0, 30)) {
      console.error(`- ${issue}`)
    }
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
