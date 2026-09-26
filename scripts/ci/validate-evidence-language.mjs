import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditRecord } from './evidence-language-policy.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

export * from './evidence-language-policy.mjs'

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
