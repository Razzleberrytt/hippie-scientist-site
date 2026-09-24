#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '../..')
const proposalDir = path.join(root, 'data-sources', 'entity-row-proposals')
const committedPath = path.join(root, 'public', 'data', 'compounds.json')
const runtimeBuilder = path.join(root, 'scripts', 'data', 'build-runtime-from-workbook.mjs')
const write = process.argv.includes('--write')

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function compareRecords(a, b) {
  return clean(a?.name).localeCompare(clean(b?.name)) ||
    clean(a?.slug).localeCompare(clean(b?.slug))
}

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  })
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(path.relative(root, script) + ' failed' + (output ? ':\n' + output : ''))
  }
}

if (!fs.existsSync(proposalDir)) throw new Error('Missing proposal directory: ' + proposalDir)
if (!fs.existsSync(committedPath)) throw new Error('Missing committed runtime file: ' + committedPath)

const proposalFiles = fs.readdirSync(proposalDir)
  .filter((name) => name.endsWith('.json'))
  .sort()

const proposalSlugs = new Set(
  proposalFiles.map((name) => {
    const proposal = JSON.parse(fs.readFileSync(path.join(proposalDir, name), 'utf8'))
    const slug = clean(proposal.slug).toLowerCase()
    if (!slug) throw new Error('Proposal is missing slug: ' + name)
    if (proposal.entity_type !== 'compound') {
      throw new Error('Only compound proposals are supported: ' + name + ' -> ' + proposal.entity_type)
    }
    return slug
  }),
)

const committed = JSON.parse(fs.readFileSync(committedPath, 'utf8'))
if (!Array.isArray(committed)) throw new Error('Committed compounds.json must be an array')

const tempRuntime = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-proposed-compound-runtime-'))
try {
  run(runtimeBuilder, ['--out', tempRuntime])
  const generatedPath = path.join(tempRuntime, 'compounds.json')
  const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'))
  if (!Array.isArray(generated)) throw new Error('Generated compounds.json must be an array')

  const generatedBySlug = new Map(generated.map((row) => [clean(row?.slug).toLowerCase(), row]))
  for (const slug of proposalSlugs) {
    if (!generatedBySlug.has(slug)) {
      throw new Error('Proposed compound missing from exact generator output: ' + slug)
    }
  }

  const beforeOther = committed.filter((row) => !proposalSlugs.has(clean(row?.slug).toLowerCase()))
  const next = [...beforeOther]

  for (const slug of [...proposalSlugs].sort()) {
    const record = generatedBySlug.get(slug)
    let index = next.findIndex((candidate) => compareRecords(candidate, record) > 0)
    if (index < 0) index = next.length
    next.splice(index, 0, record)
  }

  const afterOther = next.filter((row) => !proposalSlugs.has(clean(row?.slug).toLowerCase()))
  if (JSON.stringify(beforeOther) !== JSON.stringify(afterOther)) {
    throw new Error('Refusing sync because a non-proposal runtime record changed')
  }

  const mismatches = []
  for (const slug of proposalSlugs) {
    const actual = next.find((row) => clean(row?.slug).toLowerCase() === slug)
    const expected = generatedBySlug.get(slug)
    if (JSON.stringify(actual) !== JSON.stringify(expected)) mismatches.push(slug)
  }
  if (mismatches.length) {
    throw new Error('Exact generator parity failed for proposal slugs: ' + mismatches.join(', '))
  }

  const currentBySlug = new Map(committed.map((row) => [clean(row?.slug).toLowerCase(), row]))
  const stale = [...proposalSlugs].filter((slug) =>
    JSON.stringify(currentBySlug.get(slug)) !== JSON.stringify(generatedBySlug.get(slug)),
  )

  if (!stale.length) {
    console.log('[sync-proposed-compound-runtime] PASS: ' + proposalSlugs.size + ' proposal record(s) already match exact generator output.')
    process.exit(0)
  }

  if (!write) {
    throw new Error(
      'Committed compounds.json is stale for proposal slugs: ' + stale.join(', ') +
      '. Run this script with --write, review the one-file diff, then run guard:source-of-truth.',
    )
  }

  fs.writeFileSync(committedPath, JSON.stringify(next, null, 2) + '\n', 'utf8')
  console.log(
    '[sync-proposed-compound-runtime] WROTE: ' + stale.join(', ') + ' from exact generator output; ' +
    beforeOther.length + ' non-proposal records preserved unchanged.',
  )
} finally {
  fs.rmSync(tempRuntime, { recursive: true, force: true })
}
