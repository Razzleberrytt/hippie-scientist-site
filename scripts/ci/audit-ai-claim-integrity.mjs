#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATASETS = [
  ['herb', path.join(ROOT, 'public', 'data', 'herbs.json')],
  ['compound', path.join(ROOT, 'public', 'data', 'compounds.json')],
]
const strict = process.argv.includes('--strict')

const STRONG_LABEL = /(?:^|\b)grade\s*a\b|^a$|strong human evidence|high confidence|well[- ]established|robust evidence/i
const STRONG_CLAIM = /strong human evidence|high confidence|well[- ]established|robust evidence/i
const WEAK = /preliminary|mixed evidence|limited evidence|insufficient|unclear|weak evidence|theoretical|animal evidence|in[- ]vitro|mechanistic only|research pending/i
const NEGATIVE = /not supported|unsupported|no good evidence|insufficient evidence|does not support|failed to show|no clear benefit/i
const POSITIVE = /effective|efficacious|clinically proven|proven to|shown to improve|strong evidence for|supports the use/i
const GRADE_FIELDS = ['evidence_grade', 'evidenceGrade', 'evidenceLevel', 'evidence_level', 'evidenceTier', 'evidence_tier']
const CLAIM_FIELDS = [
  'summary', 'description', 'clinicalUse', 'clinical_use', 'best_for', 'bestFor', 'primary_effects', 'effects',
  'evidence_summary', 'evidenceSummary', 'evidence_notes', 'evidenceNotes', 'limitations', 'research_gaps', 'researchGaps',
]

function readJson(file) {
  if (!existsSync(file)) return null
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}

function rowsFrom(parsed, kind) {
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.[`${kind}s`])) return parsed[`${kind}s`]
  if (Array.isArray(parsed?.items)) return parsed.items
  if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(Boolean)
  return []
}

function flatten(value, out = []) {
  if (value == null) return out
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value))
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) flatten(item, out)
    return out
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) flatten(item, out)
  }
  return out
}

function textFor(record, fields) {
  return fields.flatMap((field) => flatten(record?.[field])).join(' | ')
}

function evidenceLabels(record) {
  return GRADE_FIELDS.map((field) => record?.[field]).filter((v) => v != null && String(v).trim()).map(String)
}

const findings = []
const totals = { profiles: 0, contradictoryStrength: 0, positiveNegative: 0, multiGrade: 0, strongWithoutHumanSignal: 0 }

for (const [kind, file] of DATASETS) {
  const parsed = readJson(file)
  if (!parsed) {
    findings.push({ severity: 'warn', kind, slug: '-', issue: `dataset unavailable or invalid: ${path.relative(ROOT, file)}` })
    continue
  }

  for (const record of rowsFrom(parsed, kind)) {
    if (!record || typeof record !== 'object') continue
    totals.profiles++
    const slug = String(record.slug || record.id || record.name || 'unknown')
    const labels = evidenceLabels(record)
    const claimText = textFor(record, CLAIM_FIELDS)
    const allText = flatten(record).join(' | ')

    const hasStrong = labels.some((label) => STRONG_LABEL.test(label)) || STRONG_CLAIM.test(claimText)
    const hasWeak = WEAK.test(claimText)
    if (hasStrong && hasWeak) {
      totals.contradictoryStrength++
      findings.push({ severity: 'error', kind, slug, issue: 'strong evidence signal conflicts with preliminary/mixed/limited language' })
    }

    if (POSITIVE.test(claimText) && NEGATIVE.test(claimText)) {
      totals.positiveNegative++
      findings.push({ severity: 'error', kind, slug, issue: 'positive efficacy language coexists with unsupported/no-clear-benefit language' })
    }

    const normalizedLabels = [...new Set(labels.map((value) => value.trim().toLowerCase()))]
    if (normalizedLabels.length > 1) {
      const materiallyDifferent = normalizedLabels.some((a) => normalizedLabels.some((b) => a !== b && !(a.includes(b) || b.includes(a))))
      if (materiallyDifferent) {
        totals.multiGrade++
        findings.push({ severity: 'warn', kind, slug, issue: `multiple evidence labels: ${labels.join(', ')}` })
      }
    }

    if (hasStrong) {
      const humanSignal = /randomi[sz]ed|controlled trial|clinical trial|human study|human evidence|meta-analysis|systematic review|participants?|subjects?|patients?/i.test(allText)
      if (!humanSignal) {
        totals.strongWithoutHumanSignal++
        findings.push({ severity: 'warn', kind, slug, issue: 'strong evidence label without an obvious human-study signal in the record' })
      }
    }
  }
}

const errors = findings.filter((f) => f.severity === 'error')
const warnings = findings.filter((f) => f.severity === 'warn')

console.log(`[audit-ai-claim-integrity] profiles: ${totals.profiles}`)
console.log(`[audit-ai-claim-integrity] contradictory evidence strength: ${totals.contradictoryStrength}`)
console.log(`[audit-ai-claim-integrity] positive/negative efficacy conflicts: ${totals.positiveNegative}`)
console.log(`[audit-ai-claim-integrity] multiple evidence labels: ${totals.multiGrade}`)
console.log(`[audit-ai-claim-integrity] strong labels without human-study signal: ${totals.strongWithoutHumanSignal}`)

for (const finding of findings.slice(0, 200)) {
  console.log(`${finding.severity.toUpperCase()} ${finding.kind}/${finding.slug}: ${finding.issue}`)
}
if (findings.length > 200) console.log(`[audit-ai-claim-integrity] ${findings.length - 200} additional findings omitted from console output`)

if (errors.length || warnings.length) {
  console.log(`[audit-ai-claim-integrity] findings: ${errors.length} error(s), ${warnings.length} warning(s)${strict ? ' (strict mode)' : ' (advisory mode)'}`)
}

if (errors.length > 0 || (strict && warnings.length > 0)) process.exit(1)
