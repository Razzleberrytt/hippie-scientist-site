#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

// Placeholders to flag (whole words only for short strings)
export const PLACEHOLDER_KEYWORDS = [
  { regex: /\bplaceholder\b/i, name: 'placeholder' },
  { regex: /\bunknown\b/i, name: 'unknown' },
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

  // 1. Missing fields (Critical)
  if (!summary.trim() && !description.trim()) {
    return [{
      type: 'critical',
      dataset: datasetName,
      slug,
      field: 'summary/description',
      value: '',
      reason: 'Both summary and description are empty'
    }]
  }

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
    if (definitiveMatch) {
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
    if (clinicalMatch) {
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

  if (criticalCount > 0) {
    console.error(`[evidence-audit] FAIL: ${criticalCount} critical language/regulatory violations found. See reports.`)
    process.exit(1)
  }

  console.log('[evidence-audit] PASS: No critical language alignment issues.')
}

// Execute conditionally if run as main module
const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
if (isMain) {
  runAudit()
}
