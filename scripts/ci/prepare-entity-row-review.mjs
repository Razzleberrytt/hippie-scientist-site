#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '../..')
const sourceWorkbook = path.join(root, 'data-sources', 'herb_monograph_master.xlsx')
const proposalDir = path.join(root, 'data-sources', 'entity-row-proposals')
const reportDir = path.join(root, 'reports', 'entity-row-review')
const reviewWorkbook = path.join(reportDir, 'herb_monograph_master.review.xlsx')
const manifestPath = path.join(reportDir, 'manifest.json')
const editor = path.join(root, 'scripts', 'data', 'edit-entity-master-cell.mjs')
const schemaValidator = path.join(root, 'scripts', 'ci', 'validate-workbook-schema.mjs')
const runtimeBuilder = path.join(root, 'scripts', 'data', 'build-runtime-from-workbook.mjs')

function run(script, args, env = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`${path.relative(root, script)} failed${output ? `:\n${output}` : ''}`)
  }
  return result.stdout || ''
}

if (!fs.existsSync(sourceWorkbook)) throw new Error(`Missing canonical workbook: ${sourceWorkbook}`)
if (!fs.existsSync(proposalDir)) throw new Error(`Missing entity-row proposal directory: ${proposalDir}`)

const proposalFiles = fs.readdirSync(proposalDir)
  .filter((name) => name.endsWith('.json'))
  .sort()

if (proposalFiles.length === 0) throw new Error('No entity-row proposals found')

const proposals = proposalFiles.map((name) => {
  const file = path.join(proposalDir, name)
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  return { name, file, value }
})

fs.rmSync(reportDir, { recursive: true, force: true })
fs.mkdirSync(reportDir, { recursive: true })
fs.copyFileSync(sourceWorkbook, reviewWorkbook)

const source = await readWorkbookExcelJS(sourceWorkbook)
const existingRows = source.getSheetData('Entity_Master')
const existingBySlug = new Map(
  existingRows.map((row) => [String(row.slug || '').trim().toLowerCase(), row]),
)

for (const proposal of proposals) {
  const wantedSlug = String(proposal.value.slug || '').trim().toLowerCase()
  const existing = existingBySlug.get(wantedSlug)
  if (existing) {
    for (const [field, expectedRaw] of Object.entries(proposal.value)) {
      const expected = String(expectedRaw ?? '').replace(/\s+/g, ' ').trim()
      const actual = String(existing[field] ?? '').replace(/\s+/g, ' ').trim()
      if (actual !== expected) {
        throw new Error(
          `Existing Entity_Master row ${wantedSlug} disagrees with reviewed proposal at ${field}: ` +
          `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        )
      }
    }
    console.log(`[entity-row-review] Existing canonical row already matches proposal: ${wantedSlug}`)
    continue
  }

  run(editor, [
    '--workbook', reviewWorkbook,
    '--append-row-file', proposal.file,
    '--in-place',
  ])
}

run(schemaValidator, [], {
  HERB_XLSX_PATH: reviewWorkbook,
  ALLOW_EXTERNAL_WORKBOOK_PATH: 'true',
})

const tempRuntime = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-entity-row-runtime-'))
try {
  run(runtimeBuilder, ['--out', tempRuntime], {
    HERB_XLSX_PATH: reviewWorkbook,
    ALLOW_EXTERNAL_WORKBOOK_PATH: 'true',
  })

  const compounds = JSON.parse(fs.readFileSync(path.join(tempRuntime, 'compounds.json'), 'utf8'))
  const checks = []
  for (const proposal of proposals) {
    const slug = String(proposal.value.slug || '')
    const record = compounds.find((item) => item.slug === slug)
    if (!record) throw new Error(`Proposed compound did not survive runtime build: ${slug}`)
    if (record.runtime_export_decision !== 'hidden_until_grounded' && record.runtime_export_decision !== 'research_archive_runtime') {
      throw new Error(`Proposed compound escaped fail-closed runtime decision: ${slug} -> ${record.runtime_export_decision}`)
    }
    if (record.profile_status !== 'research_only' && record.profile_status !== 'research_needed' && record.profile_status !== 'minimal' && record.profile_status !== 'stub' && record.profile_status !== 'none') {
      throw new Error(`Proposed compound escaped review-only profile status: ${slug} -> ${record.profile_status}`)
    }
    if (record.indexability_status !== 'NOINDEX') {
      throw new Error(`Proposed compound must remain NOINDEX: ${slug} -> ${record.indexability_status}`)
    }
    if (record.sitemap_included !== false) {
      throw new Error(`Proposed compound must remain outside sitemap: ${slug}`)
    }
    checks.push({
      slug,
      name: record.name,
      evidence_tier: record.evidence_tier,
      runtime_export_decision: record.runtime_export_decision,
      profile_status: record.profile_status,
      indexability_status: record.indexability_status,
      sitemap_included: record.sitemap_included,
    })
  }

  const manifest = {
    version: 1,
    source_workbook: path.relative(root, sourceWorkbook).split(path.sep).join('/'),
    review_workbook: path.relative(root, reviewWorkbook).split(path.sep).join('/'),
    proposal_files: proposalFiles,
    proposed_entities: checks,
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`[entity-row-review] PASS: ${proposalFiles.length} proposal(s) appended and verified fail-closed.`)
  for (const check of checks) {
    console.log(`- ${check.slug}: ${check.indexability_status}, ${check.runtime_export_decision}, ${check.profile_status}`)
  }
} finally {
  fs.rmSync(tempRuntime, { recursive: true, force: true })
}
