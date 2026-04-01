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
const OVERLAP_MIN_STRICT = 0.7
const OVERLAP_MIN_RELAXED = 0.55
const OVERLAP_MIN_PROTECTED = 0.85
const MEDICAL_RISK_PATTERN =
  /\b(?:risk|contraindicat|interact|pregnan|breastfeed|bleed|tox|adverse|warning|caution|safety|disease|disorder|syndrome|maoi|ssri|anticoagul)\b/i
const PROTECTED_PHRASE_PATTERNS = [
  /\bmay help\b/i,
  /\bassociated with\b/i,
  /\btraditionally used for\b/i,
  /\breported to\b/i,
]

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
  const isProtected = PROTECTED_PHRASE_PATTERNS.some(pattern => pattern.test(cleaned))
  if (isProtected) return normalizeStyle(cleaned)
  const base = normalizeStyle(cleaned).replace(FILLER_PATTERN, '')
  const preserveUncertainty =
    options.safeMode ||
    options.field === 'effects' ||
    options.field === 'contraindications' ||
    MEDICAL_RISK_PATTERN.test(cleaned)
  const withoutHedging = preserveUncertainty ? base : base.replace(HEDGING_PATTERN, '')
  return withoutHedging.replace(/\s+/g, ' ').trim()
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function containsHedging(value) {
  HEDGING_PATTERN.lastIndex = 0
  return HEDGING_PATTERN.test(String(value || ''))
}

function isLengthValid(text) {
  const count = wordCount(text)
  return count >= MIN_WORDS && count <= MAX_WORDS
}

function normalizeActiveCompounds(value, fixes) {
  const out = []
  const rejected = []
  const originalCleanedVersion = []
  const normalizedSafeVersion = []
  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, { ...fixes, field: 'activeCompounds' })
    if (!phrase) continue
    if (/\b(?:contains|used|effect|helps|avoid|interact|data)\b/i.test(phrase)) continue
    if (!/^[a-z0-9\-\sα-ωβγδ(),./]+$/i.test(phrase)) continue
    if (!isLengthValid(phrase)) {
      fixes.longPhrasesRemoved += 1
      continue
    }
    const result = guardedTransformation(item, phrase, OVERLAP_MIN_RELAXED, fixes, 'activeCompounds')
    out.push(result.value)
    originalCleanedVersion.push(result.originalCleaned)
    normalizedSafeVersion.push(result.normalizedCandidate)
    if (result.rejected) rejected.push({ original: result.originalCleaned, candidate: result.normalizedCandidate, overlap: Number(result.overlap.toFixed(2)), category: result.category })
  }
  return {
    values: Array.from(new Set(out)),
    rejected,
    originalCleanedVersion: Array.from(new Set(originalCleanedVersion)).filter(Boolean),
    normalizedSafeVersion: Array.from(new Set(normalizedSafeVersion)).filter(Boolean),
  }
}

function normalizeEffects(value, fixes) {
  const out = []
  const rejected = []
  const originalCleanedVersion = []
  const normalizedSafeVersion = []
  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, { ...fixes, field: 'effects' })
    if (!phrase) continue
    const cleaned = phrase.replace(/\s+/g, ' ').trim()
    if (!cleaned) continue
    if (!isLengthValid(cleaned)) {
      const sourceCleaned = cleanOriginalPhrase(item)
      if (sourceCleaned) {
        const fallback = guardedTransformation(item, sourceCleaned, OVERLAP_MIN_STRICT, fixes, 'effects')
        out.push(fallback.value)
        originalCleanedVersion.push(fallback.originalCleaned)
        normalizedSafeVersion.push(fallback.normalizedCandidate)
        if (fallback.rejected) rejected.push({ original: fallback.originalCleaned, candidate: fallback.normalizedCandidate, overlap: Number(fallback.overlap.toFixed(2)), category: fallback.category })
      }
      fixes.longPhrasesRemoved += 1
      continue
    }
    const result = guardedTransformation(item, cleaned, OVERLAP_MIN_STRICT, fixes, 'effects')
    out.push(result.value)
    originalCleanedVersion.push(result.originalCleaned)
    normalizedSafeVersion.push(result.normalizedCandidate)
    if (result.rejected) rejected.push({ original: result.originalCleaned, candidate: result.normalizedCandidate, overlap: Number(result.overlap.toFixed(2)), category: result.category })
  }
  return {
    values: Array.from(new Set(out)),
    rejected,
    originalCleanedVersion: Array.from(new Set(originalCleanedVersion)).filter(Boolean),
    normalizedSafeVersion: Array.from(new Set(normalizedSafeVersion)).filter(Boolean),
  }
}

function normalizeContraindications(value, fixes) {
  const out = []
  const rejected = []
  const originalCleanedVersion = []
  const normalizedSafeVersion = []

  for (const item of toArray(value)) {
    const phrase = normalizePhraseBase(item, { ...fixes, field: 'contraindications' })
    if (!phrase) continue

    const hasHardSignal = /\b(?:contraindicated|must avoid|do not use|avoid|not recommended)\b/i.test(String(item || ''))
    const hasSoftSignal = /\b(?:may|might|potential|associated with|caution|may interact)\b/i.test(String(item || ''))

    let standardized = phrase
    if (hasHardSignal && !hasSoftSignal) {
      if (/pregnan/.test(phrase)) standardized = 'avoid in pregnancy'
      else if (/breastfeed|lactat/.test(phrase)) standardized = 'avoid during breastfeeding'
      else if (/liver/.test(phrase)) standardized = 'avoid in liver disease'
      else if (/kidney/.test(phrase)) standardized = 'avoid in kidney disease'
      else if (/mental health|psychosis|mania/.test(phrase)) standardized = 'avoid with unstable mental health conditions'
    } else if (hasSoftSignal) {
      if (/ssri/.test(phrase)) standardized = 'may interact with ssris'
      else if (/maoi/.test(phrase)) standardized = 'may interact with maois'
      else if (/bleed|anticoagul/.test(phrase)) standardized = 'may increase bleeding risk'
    }

    standardized = standardized.replace(/\s+/g, ' ').trim()
    if (!isLengthValid(standardized)) {
      const sourceCleaned = cleanOriginalPhrase(item)
      if (sourceCleaned) {
        const fallback = guardedTransformation(item, sourceCleaned, OVERLAP_MIN_STRICT, fixes, 'contraindications')
        out.push(fallback.value)
        originalCleanedVersion.push(fallback.originalCleaned)
        normalizedSafeVersion.push(fallback.normalizedCandidate)
        if (fallback.rejected) rejected.push({ original: fallback.originalCleaned, candidate: fallback.normalizedCandidate, overlap: Number(fallback.overlap.toFixed(2)), category: fallback.category })
      }
      fixes.longPhrasesRemoved += 1
      continue
    }
    const result = guardedTransformation(item, standardized, OVERLAP_MIN_STRICT, fixes, 'contraindications')
    out.push(result.value)
    originalCleanedVersion.push(result.originalCleaned)
    normalizedSafeVersion.push(result.normalizedCandidate)
    if (result.rejected) rejected.push({ original: result.originalCleaned, candidate: result.normalizedCandidate, overlap: Number(result.overlap.toFixed(2)), category: result.category })
  }

  return {
    values: Array.from(new Set(out)),
    rejected,
    originalCleanedVersion: Array.from(new Set(originalCleanedVersion)).filter(Boolean),
    normalizedSafeVersion: Array.from(new Set(normalizedSafeVersion)).filter(Boolean),
  }
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
      if (!options.safeMode && containsHedging(hedgingCandidate)) issues.push(`${field} includes hedging language`)
    }
  }

  if (typeof herb.mechanism !== 'string') {
    issues.push('mechanism must be a string')
  } else {
    const mechanismParts = herb.mechanism.split('|').map(part => part.trim()).filter(Boolean)
    for (const phrase of mechanismParts) {
      if (!isLengthValid(phrase)) issues.push('mechanism phrase has out-of-range length')
      if (!options.safeMode && containsHedging(phrase)) issues.push('mechanism includes hedging language')
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
  const activeCompoundsResult = normalizeActiveCompounds(raw.activeCompounds ?? raw.active_compounds ?? raw.compounds, fixes)
  const effectsResult = normalizeEffects(raw.effects, fixes)
  const contraindicationsResult = normalizeContraindications(raw.contraindications, fixes)

  const herb = {
    name: cleanText(raw.name || raw.common || raw.commonName),
    latin: cleanText(raw.latin || raw.scientific || raw.scientificName),
    class: cleanText(raw.class || raw.category),
    intensity: cleanText(raw.intensity),
    mechanism: normalizeMechanism(raw.mechanism || raw.mechanismOfAction, fixes),
    activeCompounds: activeCompoundsResult.values,
    effects: effectsResult.values,
    contraindications: contraindicationsResult.values,
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

  const fallback = {}
  if (effectsResult.rejected.length) {
    fallback.effects = {
      normalized_safe_version: effectsResult.normalizedSafeVersion,
      original_cleaned_version: effectsResult.originalCleanedVersion,
      rejected: effectsResult.rejected,
    }
  }
  if (contraindicationsResult.rejected.length) {
    fallback.contraindications = {
      normalized_safe_version: contraindicationsResult.normalizedSafeVersion,
      original_cleaned_version: contraindicationsResult.originalCleanedVersion,
      rejected: contraindicationsResult.rejected,
    }
  }
  if (activeCompoundsResult.rejected.length) {
    fallback.activeCompounds = {
      normalized_safe_version: activeCompoundsResult.normalizedSafeVersion,
      original_cleaned_version: activeCompoundsResult.originalCleanedVersion,
      rejected: activeCompoundsResult.rejected,
    }
  }
  if (Object.keys(fallback).length) herb.normalizationFallback = fallback

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
        if (containsHedging(hedgingCandidate)) hedgingCount += 1
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

function cleanOriginalPhrase(value) {
  return normalizeStyle(cleanText(value))
}

function detectFailureCategory(field, original, candidate, overlap, minimumOverlap) {
  const source = String(original || '')
  const transformed = String(candidate || '')
  const hasProtected = PROTECTED_PHRASE_PATTERNS.some(pattern => pattern.test(source))
  if (hasProtected && normalizeStyle(source) !== normalizeStyle(transformed)) return 'protected_phrase_preservation'
  if (field === 'effects' && /\bmay help\b/i.test(source) && !/\bmay help\b/i.test(transformed)) return 'synonym_strengthening'
  if (
    field === 'contraindications' &&
    /\b(?:may|might|potential|associated with)\b/i.test(source) &&
    /\bavoid\b/i.test(transformed) &&
    !/\bavoid\b/i.test(source)
  ) {
    return 'contraindication_escalation'
  }
  if (field === 'activeCompounds' && overlap < minimumOverlap) return 'compound_mismatch'
  if (overlap < minimumOverlap) return 'truncation_loss'
  return ''
}

function guardedTransformation(original, candidate, minimumOverlap, fixes, field) {
  const originalCleaned = cleanOriginalPhrase(original)
  const normalizedCandidate = cleanOriginalPhrase(candidate)
  if (!originalCleaned) return { value: normalizedCandidate, rejected: false, overlap: 1, originalCleaned, normalizedCandidate, category: '' }
  if (!normalizedCandidate) {
    fixes.lowOverlapRejected += 1
    fixes.rejectedByField[field] = (fixes.rejectedByField[field] || 0) + 1
    const category = field === 'activeCompounds' ? 'compound_mismatch' : 'truncation_loss'
    fixes.rejectedByCategory[category] = (fixes.rejectedByCategory[category] || 0) + 1
    return { value: originalCleaned, rejected: true, overlap: 0, originalCleaned, normalizedCandidate, category }
  }
  const overlap = overlapRatio([originalCleaned], [normalizedCandidate])
  const effectiveMinimum = PROTECTED_PHRASE_PATTERNS.some(pattern => pattern.test(String(original || '')))
    ? Math.max(minimumOverlap, OVERLAP_MIN_PROTECTED)
    : minimumOverlap
  const category = detectFailureCategory(field, original, candidate, overlap, effectiveMinimum)
  if (category || overlap < effectiveMinimum) {
    fixes.lowOverlapRejected += 1
    fixes.rejectedByField[field] = (fixes.rejectedByField[field] || 0) + 1
    const rejectionCategory = category || (field === 'activeCompounds' ? 'compound_mismatch' : 'truncation_loss')
    fixes.rejectedByCategory[rejectionCategory] = (fixes.rejectedByCategory[rejectionCategory] || 0) + 1
    return { value: originalCleaned, rejected: true, overlap, originalCleaned, normalizedCandidate, category: rejectionCategory }
  }
  return { value: normalizedCandidate, rejected: false, overlap, originalCleaned, normalizedCandidate, category: '' }
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

    const hedgingBefore = [...beforeEffects, ...beforeContra, beforeMechanism].some(value => containsHedging(value))
    const hedgingAfter = [...afterEffects, ...afterContra, afterMechanism].some(value => containsHedging(value))
    const hedgingLossRisk = hedgingBefore && !hedgingAfter

    const sourceHasHardContraLanguage = beforeContra.some(value =>
      /\b(?:avoid|not recommended|contraindicated|do not use|must avoid)\b/i.test(String(value || '')),
    )
    const contraindicationStrictnessRisk =
      !sourceHasHardContraLanguage &&
      beforeContra.some(value => /\bmay|might|could|potential|associated with/i.test(String(value || ''))) &&
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
  const categoryLabel = {
    hedging_removed_maybe_meaningful: 'hedging misinterpretation',
    synonym_strengthening: 'synonym strengthening',
    effect_overlap_low: 'truncation loss',
    contraindication_overlap_low: 'truncation loss',
    active_compounds_truncated: 'compound mismatch',
    compound_overlap_low: 'compound mismatch',
    contraindication_may_be_overly_strict: 'contraindication escalation',
    effects_oversimplified: 'truncation loss',
  }

  const formatSamples = (samples, title) => {
    if (!samples.length) return `### ${title}\n- none\n`
    return `### ${title}\n${samples
      .map(sample => `- **${sample.herb}**\n  - risk flags: ${sample.riskFlags.length ? sample.riskFlags.join(', ') : 'none'}\n  - overlap (compounds/effects/contra): ${sample.overlap.activeCompounds}/${sample.overlap.effects}/${sample.overlap.contraindications}\n  - before contra: ${sample.before.contraindications.join(' | ') || 'none'}\n  - after contra: ${sample.after.contraindications.join(' | ') || 'none'}`)
      .join('\n')}\n`
  }

  const failingExamples = audit.riskyExamples
    .map(sample => `- **${sample.herb}**\n  - original: ${sample.before.contraindications.join(' | ') || sample.before.effects.join(' | ') || sample.before.mechanism || 'none'}\n  - normalized: ${sample.after.contraindications.join(' | ') || sample.after.effects.join(' | ') || sample.after.mechanism || 'none'}\n  - reason flags: ${sample.riskFlags.join(', ')}`)
    .join('\n')

  const categoryCounts = audit.riskyExamples.reduce((acc, sample) => {
    for (const flag of sample.riskFlags) {
      const category = categoryLabel[flag] || 'other'
      acc[category] = (acc[category] || 0) + 1
    }
    return acc
  }, {})

  return `# Semantic Normalization Audit\n\n- sampled herbs: ${audit.sampleSize}\n- recommendation: **${audit.recommendation}**\n\n## Failing examples (original vs normalized)\n${failingExamples || '- none'}\n\n## Failure categories\n${Object.entries(categoryCounts).map(([category, count]) => `- ${category}: ${count}`).join('\n') || '- none'}\n\n## Micro-rules applied\n- protect phrases: may help, associated with, traditionally used for, reported to\n- if contraindication contains soft uncertainty language, do not escalate to hard avoid phrasing\n- if overlap is below category threshold, fallback to cleaned original\n- last-line defense: any detected risky category forces fallback to cleaned original\n\n${formatSamples(audit.safeExamples, 'Safe transformations')}\n${formatSamples(audit.riskyExamples, 'Risky transformations')}\n${formatSamples(audit.revertExamples, 'Should be reverted / manually reviewed')}\n`
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
    lowOverlapRejected: 0,
    rejectedByField: {},
    rejectedByCategory: {},
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

  const report = `# Data Quality Report\n\n- Generated: ${new Date().toISOString()}\n- Total herbs: ${herbsNormalized.length}\n- Total compounds: ${compoundsNormalized.length}\n- Completeness: ${overallCompleteness}%\n\n## Missing field counts\n\n### Herbs\n${printMissingCounts(herbCompleteness.missingCounts)}\n\n### Compounds\n${printMissingCounts(compoundCompleteness.missingCounts)}\n\n## Formatting consistency metrics\n\n### Variation reduction\n- Phrases analyzed: ${beforeMetrics.phraseCount} → ${afterMetrics.phraseCount}\n- Hedging phrases: ${beforeMetrics.hedgingCount} → ${afterMetrics.hedgingCount}\n- Punctuation variants: ${beforeMetrics.punctuationCount} → ${afterMetrics.punctuationCount}\n- Mixed casing variants: ${beforeMetrics.mixedCaseCount} → ${afterMetrics.mixedCaseCount}\n\n## Integrity guardrails\n- Low-overlap transformations rejected: ${fixes.lowOverlapRejected}\n- Rejected by field: ${JSON.stringify(fixes.rejectedByField)}\n- Rejected by category: ${JSON.stringify(fixes.rejectedByCategory)}\n\n## Validation fixes applied\n\n- Removed invalid/placeholder source entries: ${fixes.invalidSourcesRemoved}\n- Fixed non-ISO lastUpdated fields: ${fixes.lastUpdatedFixed}\n- Merged duplicate names: ${fixes.duplicatesMerged}\n- Removed invalid herb references from compounds: ${fixes.invalidHerbRefsRemoved}\n- Removed "nan" list values: ${fixes.nanRemoved}\n- Removed over-length phrases: ${fixes.longPhrasesRemoved}\n- Removed cross-field duplicates: ${fixes.crossFieldDuplicatesRemoved}\n\n## 10-herb before vs after sample\n\n\`\`\`json\n${JSON.stringify(samples, null, 2)}\n\`\`\`\n\n## Unresolved issues\n\n${unresolvedIssues.length ? unresolvedIssues.map(item => `- ${item}`).join('\n') : '- None'}\n`

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
    integrity: {
      lowOverlapRejected: fixes.lowOverlapRejected,
      rejectedByField: fixes.rejectedByField,
      rejectedByCategory: fixes.rejectedByCategory,
    },
    options: args,
  }

  console.log('Validation complete.')
  const numericFixCount = Object.values(fixes).reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0)
  console.log(`Errors fixed: ${numericFixCount}`)
  console.log(`Validation passed: ${summary.passed ? 'yes' : 'no'}`)
  console.log(JSON.stringify(summary, null, 2))

  if (consistencyIssues.length && !args.auditOnly) {
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
