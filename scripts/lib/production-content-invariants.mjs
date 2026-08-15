const INTERNAL_VERSION_PREFIX = /^\s*v\d+(?:\.\d+)*\s*:\s*/i

const PLACEHOLDER_PATTERNS = [
  /metadata extraction (?:is )?required/i,
  /still require(?:s)? pubmed metadata extraction/i,
  /minimal citation row added from existing workbook/i,
  /\blorem ipsum\b/i,
  /\b(?:editorial|internal) todo\b/i,
  /\bdebug string\b/i,
  /\bmigration comment\b/i,
  /\bplaceholder citation\b/i,
  /\[object Object\]/i,
]

const HUMAN_SOURCE_RE = /\b(?:human|randomi[sz]ed|rct|clinical trial|controlled trial|meta-analysis|systematic review|cohort|observational|participants?|patients?|adults?|subjects?)\b/i
const SAFETY_SOURCE_RE = /\b(?:safety|adverse|tolerab|toxic|hepat|liver injury|interaction|contraindicat|pregnan|breastfeed|bleed|arrhythm|withdrawal|dependence|side effects?)\b/i
const DOSE_SOURCE_RE = /(?:\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|µg|ug|ml|iu)\b|\b(?:dose|dosage|daily|per day|\/day|twice daily|once daily)\b)/i
const HUMAN_CLAIM_RE = /\b(?:human|randomi[sz]ed|rct|clinical trial|meta-analysis|systematic review|participants?|patients?|adults?)\b/i
const SAFETY_CLAIM_RE = /\b(?:safe|safety|adverse|side effect|interaction|contraindicat|avoid|pregnan|breastfeed|liver|bleed|sedat|toxicity)\b/i
const DOSE_CLAIM_RE = /\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|µg|ug|ml|iu)(?:\s*\/\s*(?:day|d))?\b/i

export const PRODUCTION_INVARIANT_CODES = [
  'A_GRADE_CRITERIA',
  'HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE',
  'SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE',
  'DOSE_STATEMENT_WITHOUT_DOSE_SOURCE',
  'UNRESOLVED_CITATION_REFERENCE',
  'INVALID_CITATION_DESTINATION',
  'PRODUCTION_PLACEHOLDER',
  'DUPLICATE_CANONICAL_ENTITY',
  'MALFORMED_SCIENTIFIC_NAME',
  'INTERNAL_DEVELOPMENT_LANGUAGE',
]

function text(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(text).join(' ')
  if (typeof value === 'object') return Object.values(value).map(text).join(' ')
  return ''
}

function isPublished(record) {
  if (record?.governance && typeof record.governance.indexingAllowed === 'boolean') {
    return record.governance.indexingAllowed
  }
  return String(record?.indexability_status || '').toUpperCase() === 'PUBLISH' || record?.sitemap_included === true
}

function sourceId(source) {
  return String(source?.id || source?.sourceId || source?.source_id || '').trim()
}

function sourceText(source) {
  return [source?.title, source?.citation, source?.note, source?.studyType, source?.study_type, source?.design, source?.publicationType, source?.publication_type]
    .map((value) => String(value || ''))
    .join(' ')
}

function sourceUrls(source) {
  const values = [source?.url, source?.doi ? `https://doi.org/${source.doi}` : '', source?.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/` : '']
  return values
    .flatMap((value) => String(value || '').split(/\s*\|\s*/))
    .map((value) => value.trim())
    .filter(Boolean)
}

function validCitationDestination(value) {
  let url
  try { url = new URL(value) } catch { return false }
  if (!['http:', 'https:'].includes(url.protocol)) return false
  if (!url.hostname) return false
  if (/pubmed\.ncbi\.nlm\.nih\.gov$/i.test(url.hostname)) {
    return /^\/\d+\/?$/.test(url.pathname)
  }
  if (/doi\.org$/i.test(url.hostname)) {
    return /^\/10\.\d{4,9}\/.+/.test(url.pathname)
  }
  return true
}

function claimRefs(claim) {
  const refs = claim?.sourceRefIds || claim?.sourceIds || claim?.source_ids || claim?.sources || []
  return (Array.isArray(refs) ? refs : [refs]).map((value) => typeof value === 'string' ? value.trim() : sourceId(value)).filter(Boolean)
}

function claimText(claim) {
  return [claim?.claim, claim?.notes, claim?.predicate, claim?.evidenceLevel, claim?.evidence_level, claim?.qualifiers].map(text).join(' ')
}

function hasPlaceholder(value) {
  const string = text(value)
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(string))
}

function hasInternalVersion(value) {
  if (typeof value === 'string') return INTERNAL_VERSION_PREFIX.test(value)
  if (Array.isArray(value)) return value.some(hasInternalVersion)
  if (value && typeof value === 'object') return Object.values(value).some(hasInternalVersion)
  return false
}

function scientificNames(record) {
  return [record?.scientific_name, record?.scientificName, record?.latin_name, record?.latinName, record?.botanical_name, record?.botanicalName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function isObviouslyMalformedScientificName(value) {
  if (!value || value.length > 160) return true
  if (/https?:|www\.|\d{3,}|\b(?:todo|unknown|n\/a|none|placeholder|tbd)\b/i.test(value)) return true
  if (!/^[A-Z][\p{L}-]+(?:\s+(?:×\s+)?[a-z][\p{L}.-]+)(?:\s+(?:(?:subsp|ssp|var|f)\.)\s+[a-z][\p{L}.-]+)?(?:\s+[A-Z][\p{L}.'&()-]+.*)?$/u.test(value)) return true
  return false
}

function canonicalId(record, kind) {
  const explicit = record?.canonical_id || record?.canonicalId || record?.entity_id || record?.entityId
  if (explicit) return String(explicit).trim().toLowerCase()
  const slug = String(record?.slug || '').trim().toLowerCase()
  return slug ? `${kind}:${slug}` : ''
}

function issue(code, record, kind, detail, blocking = true) {
  return {
    code,
    blocking,
    kind,
    slug: String(record?.slug || ''),
    url: record?.slug ? `/${kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/` : '',
    detail,
  }
}

export function evaluateRecord(record, kind = 'herb') {
  const issues = []
  const sources = Array.isArray(record?.sources) ? record.sources : []
  const claims = Array.isArray(record?.claimMap) ? record.claimMap : []
  const byId = new Map(sources.map((source) => [sourceId(source), source]).filter(([id]) => id))
  const published = isPublished(record)

  for (const source of sources) {
    for (const url of sourceUrls(source)) {
      if (!validCitationDestination(url)) {
        issues.push(issue('INVALID_CITATION_DESTINATION', record, kind, `Invalid citation URL: ${url}`))
      }
    }
    if (hasPlaceholder(source)) {
      issues.push(issue('PRODUCTION_PLACEHOLDER', record, kind, `Citation ${sourceId(source) || '(unidentified)'} contains placeholder/editorial metadata text`))
    }
  }

  for (const claim of claims) {
    const refs = claimRefs(claim)
    const resolvedSources = refs.map((ref) => byId.get(ref)).filter(Boolean)
    for (const ref of refs) {
      if (!byId.has(ref)) issues.push(issue('UNRESOLVED_CITATION_REFERENCE', record, kind, `Claim ${claim?.id || ''} references missing source ${ref}`))
    }
    const cText = claimText(claim)
    const humanClaim = /human/i.test(String(claim?.evidenceLevel || claim?.evidence_level || '')) || HUMAN_CLAIM_RE.test(cText)
    const safetyClaim = SAFETY_CLAIM_RE.test(cText)
    const doseClaim = DOSE_CLAIM_RE.test(cText) || Boolean(claim?.qualifiers?.dose_or_duration)
    if (humanClaim && !resolvedSources.some((source) => HUMAN_SOURCE_RE.test(sourceText(source)))) {
      issues.push(issue('HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE', record, kind, `Human-evidence claim ${claim?.id || ''} lacks a human-classified source`))
    }
    if (safetyClaim && !resolvedSources.some((source) => SAFETY_SOURCE_RE.test(sourceText(source)))) {
      issues.push(issue('SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE', record, kind, `Safety claim ${claim?.id || ''} lacks a safety source`))
    }
    if (doseClaim && !resolvedSources.some((source) => DOSE_SOURCE_RE.test(sourceText(source)))) {
      issues.push(issue('DOSE_STATEMENT_WITHOUT_DOSE_SOURCE', record, kind, `Dose claim ${claim?.id || ''} lacks a dose-bearing source`))
    }
  }

  const dosage = String(record?.dosage || record?.typical_dosage || '').trim()
  if (DOSE_CLAIM_RE.test(dosage)) {
    const claimDoseBacked = claims.some((claim) => {
      const cText = claimText(claim)
      if (!(DOSE_CLAIM_RE.test(cText) || claim?.qualifiers?.dose_or_duration)) return false
      return claimRefs(claim).some((ref) => {
        const source = byId.get(ref)
        return source && DOSE_SOURCE_RE.test(sourceText(source))
      })
    })
    const sourceDoseBacked = sources.some((source) => DOSE_SOURCE_RE.test(sourceText(source)))
    if (!claimDoseBacked && !sourceDoseBacked) {
      issues.push(issue('DOSE_STATEMENT_WITHOUT_DOSE_SOURCE', record, kind, 'Profile dose statement has no dose-bearing source'))
    }
  }

  const safetyText = text([record?.safety, record?.contraindications, record?.interactions, record?.side_effects])
  if (published && SAFETY_CLAIM_RE.test(safetyText) && !sources.some((source) => SAFETY_SOURCE_RE.test(sourceText(source)))) {
    issues.push(issue('SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE', record, kind, 'Published safety section has no safety-classified source'))
  }

  const grade = String(record?.evidence_grade || '').trim().toUpperCase()
  if (published && grade === 'A') {
    const humanSources = sources.filter((source) => HUMAN_SOURCE_RE.test(sourceText(source)))
    const rubric = [record?.evidence_design_match, record?.evidence_risk_of_bias, record?.evidence_consistency]
    const tier = String(record?.evidence_tier || '')
    const failures = []
    if (humanSources.length < 2) failures.push(`only ${humanSources.length} human-classified source(s)`)
    if (rubric.some((value) => !String(value || '').trim())) failures.push('design/risk-of-bias/consistency rationale incomplete')
    if (tier && !/strong|robust|high[- ]quality|well[- ]established/i.test(tier)) failures.push(`tier is not strong (${tier})`)
    if (failures.length) issues.push(issue('A_GRADE_CRITERIA', record, kind, failures.join('; ')))
  }

  for (const scientificName of scientificNames(record)) {
    if (isObviouslyMalformedScientificName(scientificName)) {
      issues.push(issue('MALFORMED_SCIENTIFIC_NAME', record, kind, `Malformed scientific name: ${scientificName}`))
    }
  }

  if (hasPlaceholder([record?.summary, record?.description, record?.safety, record?.dosage, record?.typical_dosage])) {
    issues.push(issue('PRODUCTION_PLACEHOLDER', record, kind, 'Public profile fields contain placeholder/editorial language'))
  }
  if (hasInternalVersion(record?.claimMap)) {
    issues.push(issue('INTERNAL_DEVELOPMENT_LANGUAGE', record, kind, 'Claim text contains internal version prefixes'))
  }

  return issues
}

export function evaluateCorpus(entries) {
  const issues = []
  const seenCanonical = new Map()
  for (const entry of entries) {
    const { record, kind } = entry
    issues.push(...evaluateRecord(record, kind))
    const id = canonicalId(record, kind)
    if (!id) continue
    const prior = seenCanonical.get(id)
    if (prior) {
      issues.push(issue('DUPLICATE_CANONICAL_ENTITY', record, kind, `Canonical entity ${id} duplicates ${prior.kind}:${prior.record.slug}`))
    } else {
      seenCanonical.set(id, entry)
    }
  }
  return issues
}

function scrubString(value, context = {}) {
  let result = String(value || '')
  result = result.replace(INTERNAL_VERSION_PREFIX, '')
  if (/minimal citation row added from existing workbook pmid|still require(?:s)? pubmed metadata extraction/i.test(result)) {
    const pmid = context.pmid || result.match(/PMID\s*(\d+)/i)?.[1]
    return pmid ? `PubMed record (PMID ${pmid})` : 'PubMed record'
  }
  result = result
    .replace(/metadata extraction (?:is )?required/gi, 'bibliographic metadata pending review')
    .replace(/\b(?:editorial|internal) todo\b:?/gi, '')
    .replace(/\bdebug string\b:?/gi, '')
    .replace(/\bmigration comment\b:?/gi, '')
    .replace(/\bplaceholder citation\b:?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return result
}

export function scrubInternalLanguage(value, context = {}) {
  if (typeof value === 'string') return scrubString(value, context)
  if (Array.isArray(value)) return value.map((item) => scrubInternalLanguage(item, context))
  if (!value || typeof value !== 'object') return value
  const next = {}
  const childContext = { ...context, pmid: value.pmid || context.pmid }
  for (const [key, child] of Object.entries(value)) next[key] = scrubInternalLanguage(child, childContext)
  return next
}

export function demoteFromIndex(record, codes) {
  const next = { ...record }
  next.indexability_status = 'NEEDS_REVIEW'
  next.robots = 'noindex,follow'
  next.sitemap_included = false
  next.profile_status = next.profile_status === 'published' ? 'needs_review' : (next.profile_status || 'needs_review')
  const reasons = new Set(Array.isArray(next.indexability_reasons) ? next.indexability_reasons : [])
  for (const code of codes) reasons.add(`production-invariant:${code.toLowerCase()}`)
  next.indexability_reasons = [...reasons]
  next.governance = {
    ...(next.governance || {}),
    indexingAllowed: false,
    requiresHumanReview: true,
    reason: `Production invariant review required: ${[...codes].join(', ')}`,
  }
  return next
}

export function recordIsPublished(record) {
  return isPublished(record)
}
