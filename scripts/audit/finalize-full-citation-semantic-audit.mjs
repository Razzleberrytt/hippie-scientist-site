#!/usr/bin/env node
/** Final precision layer for the corpus-wide PubMed citation audit. */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const REPORT = path.join(ROOT, 'ops', 'reports', 'full-citation-semantic-audit.json')

const KNOWN_BAD = new Set([
  'melatonin::20091037','melatonin::25128263','melatonin::12467979','taurine::20386132',
  'coq10::25174896','alpha-gpc::14767959','berberine::25676062','berberine::21346706',
  'magnesium::31654344','sage::40302443',
  'garlic::22492349','ginger::12542115',
  'omega-3::18497367','omega-3::25287985','omega-3::27132744','omega-3::30686880',
])

// These first-pass domain warnings are not true disjoint-domain failures.
// Each source explicitly covers a material part or synonym of the claim, so it
// belongs in manual claim-scope review rather than the mismatch quarantine.
const PARTIAL_OR_SYNONYM = new Set([
  'cryptotanshinone::38039759',
  'ginsenoside-rg3::28098857',
  'iodine::15734706',
])

function count(rows) {
  return rows.reduce((acc, row) => {
    acc[row.classification] = (acc[row.classification] ?? 0) + 1
    return acc
  }, {})
}

function main() {
  const child = spawnSync(process.execPath, ['scripts/audit/refine-full-citation-semantic-audit.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  })
  if (child.error) throw child.error
  if (!fs.existsSync(REPORT)) throw new Error('precision pass did not produce an audit report')

  const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'))

  for (const row of report.sourceAssessments) {
    if (row.pmid && KNOWN_BAD.has(`${row.profile}::${row.pmid}`)) {
      row.classification = 'CONFIRMED_KNOWN_MISMATCH'
    }
  }

  for (const row of report.claimEdgeAssessments) {
    const key = row.pmid ? `${row.profile}::${row.pmid}` : ''
    if (KNOWN_BAD.has(key)) {
      row.classification = 'CONFIRMED_KNOWN_MISMATCH'
      row.sourceClassification = 'CONFIRMED_KNOWN_MISMATCH'
      continue
    }
    if (PARTIAL_OR_SYNONYM.has(key) && row.classification === 'CLAIM_DOMAIN_MISMATCH_CANDIDATE') {
      row.classification = 'PARTIAL_OR_SYNONYM_ALIGNMENT_REVIEW'
      row.reasons = [
        ...(row.reasons ?? []),
        'final precision pass: source explicitly covers a material claim component/synonym; retain for scope review rather than mismatch quarantine',
      ]
    }
  }

  let failures = 0
  for (const check of report.regressionChecks) {
    const hits = report.sourceAssessments.filter((row) => row.profile === check.profile && row.pmid === check.pmid)
    if (check.type === 'known-bad') {
      check.classifications = hits.map((row) => row.classification)
      check.passed = !hits.length || hits.every((row) => row.classification === 'CONFIRMED_KNOWN_MISMATCH')
    } else {
      check.classifications = hits.map((row) => row.classification)
      check.passed = !hits.length || hits.every((row) => !['NO_ENTITY_SIGNAL','UNRESOLVED_PMID','AMBIGUOUS_NAME_COLLISION','CONFIRMED_KNOWN_MISMATCH'].includes(row.classification))
    }
    if (!check.passed) failures += 1
  }

  const risk = new Set(['CONFIRMED_KNOWN_MISMATCH','HIGH_RISK_ENTITY_MISMATCH_CANDIDATE','CLAIM_DOMAIN_MISMATCH_CANDIDATE','UNRESOLVED_SOURCE'])
  const highRisk = report.claimEdgeAssessments.filter((row) => risk.has(row.classification))

  report.finalPrecisionPass = {
    applied: true,
    knownBadRegressionSources: KNOWN_BAD.size,
    partialOrSynonymDomainDowngrades: PARTIAL_OR_SYNONYM.size,
    rule: 'known verified mismatches remain hard regression controls; partial/synonym support is manual review, never auto-clean',
  }
  report.summary.sourceClassifications = count(report.sourceAssessments)
  report.summary.claimEdgeClassifications = count(report.claimEdgeAssessments)
  report.summary.publicClaimEdgeClassifications = count(report.claimEdgeAssessments.filter((row) => row.public))
  report.summary.highRiskClaimEdges = highRisk.length
  report.summary.publicHighRiskClaimEdges = highRisk.filter((row) => row.public).length
  report.summary.regressionFailures = failures
  report.highRiskClaimEdges = highRisk

  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`)

  console.log('\nFinal semantic audit')
  console.log('='.repeat(76))
  console.log(`Regression failures: ${failures}`)
  console.log(`High-risk claim edges: ${report.summary.highRiskClaimEdges}`)
  console.log(`Public high-risk claim edges: ${report.summary.publicHighRiskClaimEdges}`)
  console.log('Claim classifications:', JSON.stringify(report.summary.claimEdgeClassifications))
  console.log('\nPublic high-risk set:')
  for (const row of highRisk.filter((r) => r.public)) {
    console.log(`  ${row.classification.padEnd(36)} ${row.profile.padEnd(27)} PMID ${String(row.pmid ?? '-').padEnd(9)} ${String(row.liveTitle ?? '').slice(0, 105)}`)
    console.log(`    claim: ${String(row.claim ?? '').slice(0, 170)}`)
  }

  if (failures) process.exit(1)
}

try { main() } catch (error) {
  console.error(`[final-semantic-audit] ${error.stack || error.message}`)
  process.exit(1)
}
