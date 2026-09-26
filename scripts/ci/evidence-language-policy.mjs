// Pure evidence-language policy. This module must remain build-output-neutral:
// no filesystem reads/writes, no out/ inspection, and no generated artifacts.
// That boundary lets CI validate policy-only edits without a production build.

// Placeholders to flag (whole words only for short strings)
export const PLACEHOLDER_KEYWORDS = [
  { regex: /\bplaceholder\b/i, name: 'placeholder' },
  // 'unknown' is a placeholder when it stands in for missing data, and
  // ordinary English when it modifies a noun. Matching it anywhere flagged
  // this, which is a deliberate and correct safety caution:
  //   "Isolated-taurine findings cannot establish the safety of unknown
  //    co-ingredients, doses, or long-term use."
  // Editing that copy to satisfy a linter would weaken a real warning, so the
  // pattern is narrowed instead: it matches only where the word stands alone
  // as a value - the whole field, after a label, or as its own sentence - and
  // not where it qualifies something.
  { regex: /(?:^|[:;|,]\s*|[.!?]\s+)unknown\s*(?:[.;,|]|$)/i, name: 'unknown' },
  { regex: /\btodo\b/i, name: 'todo' },
  { regex: /\btbd\b/i, name: 'tbd' },
  { regex: /\blean bulk\b/i, name: 'lean bulk' },
  { regex: /\bnan\b/i, name: 'nan' },
  // 'null' is also legitimate statistical language ("null result", "null
  // finding", "null hypothesis"). Treat it as a placeholder only when it
  // stands alone as a value, mirroring the fail-closed handling for "unknown".
  { regex: /(?:^|[:;|,]\s*|[.!?]\s+)null\s*(?:[.;,|]|$)/i, name: 'null' },
  { regex: /\bundefined\b/i, name: 'undefined' },
  { regex: /\[object object\]/i, name: '[object object]' }
]

// Medical claims to prohibit (regulatory safety) - whole words/clear contexts only
export const MEDICAL_CLAIM_PATTERNS = [
  { regex: /\b(cures?|curing)\b(?!-all)/i, name: 'direct cure claim' },
  { regex: /\b(prevent|prevents|preventing|prevention of)\s+(disease|diseases|cancer|diabetes|alzheimer|arthritis|cardiovascular|dementia|depression)\b/i, name: 'disease prevention claim' },
  { regex: /\b(treat|treats|treating|treatment of)\s+(disease|diseases|cancer|diabetes|alzheimer|arthritis|cardiovascular|dementia|depression)\b/i, name: 'disease treatment claim' }
]

// Definitive terms that are inappropriate for weak evidence
export const DEFINITIVE_TERMS = /\b(proven|effectively|established|certain|demonstrates that|clears|heals|clinical cure)\b/i

// Speculative terms required for weak evidence
export const SPECULATIVE_TERMS = /\b(may|suggests|preclinical|potential|investigated|traditional|traditionally|animal|vitro|pre-clinical|possibility|could|might|hypothesized|limited|preliminary)\b/i

// Human/clinical claims that are inappropriate for preclinical-only evidence
export const CLINICAL_CLAIM_PATTERNS = /\b(clinical trial|clinical trials|human study|human studies|in humans|in patient|in patients|human clinical|clinical research)\b/i

/**
 * Is this match negated by the words just before it?
 *
 * The term checks are substring matches, so writing that explicitly *denies* a
 * claim was flagged as *making* it:
 *
 *   "no established human clinical use"        -> flagged "established"
 *   "Safety was not established for 2.5 g/day" -> flagged "established"
 *   "human clinical trial data is essentially absent" -> flagged "human clinical"
 *   "claims are more extrapolated than proven" -> flagged "proven"
 *
 * All four are careful, correct sentences. Flagging them pushes an author to
 * delete the qualifier that makes the claim honest, which is the opposite of
 * what this audit is for. A short lookbehind window covers the negators that
 * actually occur in this corpus without swallowing genuine overstatement.
 */
export function isNegatedMatch(text, index, matched) {
  const before = text.slice(Math.max(0, index - 44), index).toLowerCase()
  const after = text.slice(index + (matched ? matched.length : 0), index + (matched ? matched.length : 0) + 46).toLowerCase()

  // "no established use", "was not established", "more extrapolated than proven"
  const negatedBefore = /\b(no|not|never|without|lacks|lack|lacking|absent|rather than|than|insufficient|unproven|unestablished)\b[\w\s,'-]{0,20}$/.test(before)

  // "human clinical trial data is essentially absent"
  const negatedAfter = /^[\w\s,'-]{0,40}\b(is|are|was|were|remains?)\s+(essentially\s+|largely\s+|entirely\s+)?(absent|lacking|unavailable|missing|not established|unproven)\b/.test(after)

  return negatedBefore || negatedAfter
}

/**
 * Audits a single herb/compound record for language alignment and regulatory compliance.
 * @param {Object} record
 * @param {string} datasetName
 * @returns {Array<Object>} list of findings
 */
export function auditRecord(record, datasetName = 'test') {
  const slug = record.slug || 'unknown'
  const summary = record.summary || ''
  const description = record.description || ''
  const evidenceTier = record.evidence_tier || ''

  const textToAudit = `${summary} ${description}`.trim()
  const localFindings = []

  // Determine if this record is published/indexable. Missing status is treated
  // as auditable for unit tests and legacy records; explicit non-PUBLISH,
  // hidden, and redirect/archive records are exempt from empty-content checks.
  const indexabilityStatus = String(record.indexability_status || '').toUpperCase()
  const runtimeExportDecision = String(record.runtime_export_decision || '').toLowerCase()
  const isPublished = (!indexabilityStatus || indexabilityStatus === 'PUBLISH') &&
    !['hidden', 'hidden_until_grounded', 'alias_redirect_only', 'research_archive_runtime'].includes(runtimeExportDecision)

  // 1. Missing fields (Critical) — only for published/indexable records
  if (isPublished && !summary.trim() && !description.trim()) {
    return [{
      type: 'critical',
      dataset: datasetName,
      slug,
      field: 'summary/description',
      value: '',
      reason: 'Both summary and description are empty'
    }]
  }

  // Skip all further checks for records with no auditable content
  if (!textToAudit) return []

  // 2. Placeholder checks (Critical)
  // Audit summary and description independently so a standalone placeholder at
  // one field boundary cannot be hidden by valid prose in the adjacent field.
  const placeholderFields = [summary, description]
  for (const kw of PLACEHOLDER_KEYWORDS) {
    const match = placeholderFields
      .map(value => value.match(kw.regex))
      .find(Boolean)
    if (match) {
      localFindings.push({
        type: 'critical',
        dataset: datasetName,
        slug,
        field: 'content',
        value: match[0],
        reason: `Contains placeholder keyword: "${kw.name}" matched by "${match[0]}"`
      })
    }
  }

  // 3. Prohibited Medical Claims (Critical)
  for (const pattern of MEDICAL_CLAIM_PATTERNS) {
    const match = textToAudit.match(pattern.regex)
    if (match) {
      localFindings.push({
        type: 'critical',
        dataset: datasetName,
        slug,
        field: 'content',
        value: match[0],
        reason: `Prohibited medical/disease claim pattern: "${pattern.name}" matched by "${match[0]}"`
      })
    }
  }

  // 4. Evidence Tier Alignment Checks (Warnings)
  const isWeakEvidence = ['Mechanistic Evidence', 'Traditional Use Context', 'Evidence-Limited', 'Limited Human Evidence', 'Preliminary Evidence'].includes(evidenceTier)
  const isPreclinicalOnly = ['Mechanistic Evidence', 'Traditional Use Context'].includes(evidenceTier)

  if (isWeakEvidence) {
    // Warning: using overly definitive claims on weak evidence
    const definitiveMatch = textToAudit.match(DEFINITIVE_TERMS)
    if (definitiveMatch && !isNegatedMatch(textToAudit, definitiveMatch.index, definitiveMatch[0])) {
      localFindings.push({
        type: 'warning',
        dataset: datasetName,
        slug,
        field: 'content',
        value: definitiveMatch[0],
        reason: `Definitive claim term "${definitiveMatch[0]}" used with weak evidence tier: "${evidenceTier}"`
      })
    }

    // Warning: lacking any speculative qualifiers on weak evidence
    const hasSpeculative = SPECULATIVE_TERMS.test(textToAudit)
    if (!hasSpeculative && textToAudit.length > 0) {
      localFindings.push({
        type: 'warning',
        dataset: datasetName,
        slug,
        field: 'content',
        value: textToAudit.substring(0, 50) + '...',
        reason: `Lacks speculative framing/qualifiers with weak evidence tier: "${evidenceTier}"`
      })
    }
  }

  if (isPreclinicalOnly) {
    // Warning: claiming human/clinical efficacy on mechanistic/preclinical records
    const clinicalMatch = textToAudit.match(CLINICAL_CLAIM_PATTERNS)
    if (clinicalMatch && !isNegatedMatch(textToAudit, clinicalMatch.index, clinicalMatch[0])) {
      localFindings.push({
        type: 'warning',
        dataset: datasetName,
        slug,
        field: 'content',
        value: clinicalMatch[0],
        reason: `Clinical/human reference "${clinicalMatch[0]}" used with preclinical/mechanistic evidence tier: "${evidenceTier}"`
      })
    }
  }

  return localFindings
}
