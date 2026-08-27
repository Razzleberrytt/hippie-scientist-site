#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { refreshWorkbookOwnedDetailFields } from './lib/profile-detail-refresh.mjs'

const ROOT = process.cwd()

function die(message) {
  console.error(`[refresh-profile-detail] ERROR: ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  let slug = ''
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--slug') slug = argv[++i] || ''
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/data/refresh-profile-detail-from-workbook.mjs --slug <profile-slug>')
      process.exit(0)
    } else die(`unknown argument: ${argv[i]}`)
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) die('a safe lowercase --slug is required')
  return { slug }
}

function resolveDetail(slug) {
  const candidates = [
    { kind: 'herb', dir: 'herbs-detail', list: 'herbs.json' },
    { kind: 'compound', dir: 'compounds-detail', list: 'compounds.json' },
  ].filter(({ dir }) => fs.existsSync(path.join(ROOT, 'public/data', dir, `${slug}.json`)))
  if (candidates.length !== 1) die(`expected exactly one existing detail owner for ${slug}; found ${candidates.length}`)
  return candidates[0]
}

function readListRecord(file, slug) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  const rows = Array.isArray(raw) ? raw : raw?.items || raw?.data || []
  const matches = rows.filter((row) => row?.slug === slug)
  if (matches.length !== 1) die(`expected exactly one canonical runtime record for ${slug}; found ${matches.length}`)
  return matches[0]
}

const { slug } = parseArgs(process.argv)
const owner = resolveDetail(slug)
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-profile-detail-'))

try {
  execFileSync(process.execPath, ['scripts/data/build-runtime-from-workbook.mjs', '--out', tempDir], {
    cwd: ROOT,
    stdio: 'inherit',
  })

  const canonicalRecord = readListRecord(path.join(tempDir, owner.list), slug)
  const detailPath = path.join(ROOT, 'public/data', owner.dir, `${slug}.json`)
  const detailDocument = JSON.parse(fs.readFileSync(detailPath, 'utf8'))
  const detailRecord = detailDocument?.record && typeof detailDocument.record === 'object'
    ? detailDocument.record
    : detailDocument
  const changedFields = refreshWorkbookOwnedDetailFields(detailRecord, canonicalRecord, owner.kind)

  if (!changedFields.length) {
    console.log(`[refresh-profile-detail] ${slug}: already aligned; no file write`)
  } else {
    fs.writeFileSync(detailPath, `${JSON.stringify(detailDocument, null, 2)}\n`)
    console.log(`[refresh-profile-detail] ${slug}: refreshed ${changedFields.join(', ')}`)
    console.log(`[refresh-profile-detail] wrote only ${path.relative(ROOT, detailPath)}`)
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
