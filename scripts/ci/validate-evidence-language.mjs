import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

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
  { regex: /\bnull\b/i, name: 'null' },
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
  for (const kw of PLACEHOLDER_KEYWORDS) {
    const match = textToAudit.match(kw.regex)
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

export function runAudit() {
  const files = [
    { name: 'herbs', path: path.join(repoRoot, 'public/data/herbs.json') },
    { name: 'compounds', path: path.join(repoRoot, 'public/data/compounds.json') }
  ]

  const reportsDir = path.join(repoRoot, 'public/data/reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const findings = []
  let criticalCount = 0
  let warningCount = 0

  for (const { name, path: filePath } of files) {
    if (!fs.existsSync(filePath)) {
      console.warn(`[evidence-audit] File not found: ${filePath}. Skipping.`)
      continue
    }

    const records = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    records.forEach((record, index) => {
      const nameVal = record.name || record.slug || `index-${index}`
      const local = auditRecord(record, name)
      findings.push(...local)
      local.forEach(f => {
        if (f.type === 'critical') criticalCount++
        if (f.type === 'warning') warningCount++
      })
    })
  }

  // Write reports
  const jsonReportPath = path.join(reportsDir, 'evidence-language-audit.json')
  fs.writeFileSync(jsonReportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      totalFindings: findings.length,
      critical: criticalCount,
      warnings: warningCount
    },
    findings
  }, null, 2))

  // Write markdown report
  const mdReportPath = path.join(reportsDir, 'evidence-language-audit.md')
  let mdContent = `# Evidence & Summary Language Consistency Audit Report\n\n`
  mdContent += `- **Generated At:** ${new Date().toISOString()}\n`
  mdContent += `- **Critical Violations (Build-Failing):** ${criticalCount}\n`
  mdContent += `- **Style Warnings (Non-Failing):** ${warningCount}\n\n`

  if (findings.length === 0) {
    mdContent += `### ✅ No issues found. All records pass consistency governance!\n`
  } else {
    mdContent += `## Critical Violations\n\n`
    const criticals = findings.filter(f => f.type === 'critical')
    if (criticals.length === 0) {
      mdContent += `*No critical violations found.*\n\n`
    } else {
      mdContent += `| Dataset | Slug | Field | Matched Value | Reason |\n`
      mdContent += `| --- | --- | --- | --- | --- |\n`
      criticals.forEach(c => {
        mdContent += `| ${c.dataset} | \`${c.slug}\` | \`${c.field}\` | \`${c.value}\` | ${c.reason} |\n`
      })
      mdContent += `\n`
    }

    mdContent += `## Style & Tier Warnings\n\n`
    const warnings = findings.filter(f => f.type === 'warning')
    if (warnings.length === 0) {
      mdContent += `*No style warnings found.*\n\n`
    } else {
      mdContent += `| Dataset | Slug | Matched Value | Reason |\n`
      mdContent += `| --- | --- | --- | --- |\n`
      warnings.forEach(w => {
        mdContent += `| ${w.dataset} | \`${w.slug}\` | \`${w.value}\` | ${w.reason} |\n`
      })
      mdContent += `\n`
    }
  }

  fs.writeFileSync(mdReportPath, mdContent)

  console.log(`[evidence-audit] Completed. Findings: ${findings.length} (Critical: ${criticalCount}, Warnings: ${warningCount})`)
  console.log(`[evidence-audit] Reports saved under public/data/reports/`)

  reportPublishedSplit(findings)

  if (criticalCount > 0) {
    console.error(`[evidence-audit] FAIL: ${criticalCount} critical language/regulatory violations found. See reports.`)
    process.exit(1)
  }


  console.log('[evidence-audit] PASS: No critical language alignment issues.')
}

/**
 * Split the warnings by whether the page they describe is actually reachable.
 *
 * "245 warnings, PASS" is a line everyone learns to skip, and skipping it is
 * reasonable: most of these sit on profiles governance has already withheld,
 * where overstated wording harms nobody because nobody can reach it. The few
 * that sit on live, indexable pages are a different thing entirely, and they
 * are invisible inside the total.
 *
 * The split needs out/, so it degrades to silence rather than guessing when the
 * site has not been built. It reports; the exit code is still decided solely by
 * critical findings, because a warning here is a prompt to read the sentence,
 * not proof the sentence is wrong.
 */
function reportPublishedSplit(findings) {
  const outDir = path.join(repoRoot, 'out')
  if (!fs.existsSync(outDir)) return

  const seen = new Map()
  for (const finding of findings) {
    if (!finding?.slug || !finding?.dataset) continue
    const segment = finding.dataset === 'compounds' ? 'compounds' : 'herbs'
    seen.set(`${segment}/${finding.slug}`, segment)
  }

  const live = []
  let withheld = 0
  let notBuilt = 0
  for (const [key] of seen) {
    const page = path.join(outDir, key, 'index.html')
    if (!fs.existsSync(page)) {
      notBuilt += 1
      continue
    }
    if (/<meta name="robots" content="noindex/u.test(fs.readFileSync(page, 'utf8'))) withheld += 1
    else live.push(key)
  }

  console.log(`[evidence-audit] ${seen.size} profiles flagged — ${withheld} withheld by governance, ${notBuilt} not built,`)
  console.log(`[evidence-audit] ${live.length} live and indexable. Only the last group is reader-facing.`)
  if (live.length) {
    console.log(`[evidence-audit] live: ${live.slice(0, 12).join(', ')}${live.length > 12 ? `, +${live.length - 12} more` : ''}`)
  }
}

// Execute conditionally if run as main module
const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
if (isMain) {
  runAudit()
}
