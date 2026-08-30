import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import process from 'node:process'

export const GOVERNED_STATIC_EXPORT_SCHEMA_VERSION = 1
export const DEFAULT_EXPORT_DIR = 'out'
export const DEFAULT_RECEIPT_PATH = '.governed-static-export.json'

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function assertSha(label, value) {
  if (!/^[0-9a-f]{40}$/i.test(value || '')) {
    throw new Error(`${label} must be a 40-character git SHA; received ${JSON.stringify(value)}`)
  }
}

function walkFiles(rootDir, currentDir = rootDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(currentDir, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(rootDir, absolute))
    else if (entry.isFile()) files.push(path.relative(rootDir, absolute).split(path.sep).join('/'))
  }
  return files.sort()
}

export function hashDirectory(rootDir = DEFAULT_EXPORT_DIR) {
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    throw new Error(`Static export directory does not exist: ${rootDir}`)
  }

  const files = walkFiles(rootDir)
  const htmlFileCount = files.filter((file) => file.endsWith('.html')).length
  if (files.length === 0 || htmlFileCount === 0) {
    throw new Error(`Static export is incomplete: ${files.length} files, ${htmlFileCount} HTML files`)
  }

  const aggregate = crypto.createHash('sha256')
  for (const relative of files) {
    const content = fs.readFileSync(path.join(rootDir, relative))
    aggregate.update(relative)
    aggregate.update('\0')
    aggregate.update(String(content.length))
    aggregate.update('\0')
    aggregate.update(sha256(content))
    aggregate.update('\0')
  }

  return {
    outputHash: aggregate.digest('hex'),
    fileCount: files.length,
    htmlFileCount,
  }
}

export function createManifest({ sourceSha, baseSha, exportDir = DEFAULT_EXPORT_DIR, lockfilePath = 'package-lock.json', runId = null }) {
  assertSha('sourceSha', sourceSha)
  assertSha('baseSha', baseSha)
  if (!fs.existsSync(lockfilePath)) throw new Error(`Lockfile does not exist: ${lockfilePath}`)

  const output = hashDirectory(exportDir)
  return {
    schemaVersion: GOVERNED_STATIC_EXPORT_SCHEMA_VERSION,
    sourceSha: sourceSha.toLowerCase(),
    baseSha: baseSha.toLowerCase(),
    lockfileHash: sha256(fs.readFileSync(lockfilePath)),
    nodeVersion: process.version,
    outputHash: output.outputHash,
    fileCount: output.fileCount,
    htmlFileCount: output.htmlFileCount,
    producerRunId: runId ? String(runId) : null,
  }
}

export function verifyManifest({ manifest, expectedSourceSha, expectedBaseSha, exportDir = DEFAULT_EXPORT_DIR, lockfilePath = 'package-lock.json' }) {
  assertSha('expectedSourceSha', expectedSourceSha)
  if (expectedBaseSha) assertSha('expectedBaseSha', expectedBaseSha)
  if (!manifest || manifest.schemaVersion !== GOVERNED_STATIC_EXPORT_SCHEMA_VERSION) {
    throw new Error(`Unsupported governed static export schema: ${manifest?.schemaVersion ?? 'missing'}`)
  }
  if (manifest.sourceSha !== expectedSourceSha.toLowerCase()) {
    throw new Error(`Static export source SHA mismatch: expected ${expectedSourceSha}, received ${manifest.sourceSha}`)
  }
  if (expectedBaseSha && manifest.baseSha !== expectedBaseSha.toLowerCase()) {
    throw new Error(`Static export base SHA mismatch: expected ${expectedBaseSha}, received ${manifest.baseSha}`)
  }
  if (!fs.existsSync(lockfilePath)) throw new Error(`Lockfile does not exist: ${lockfilePath}`)

  const lockfileHash = sha256(fs.readFileSync(lockfilePath))
  if (manifest.lockfileHash !== lockfileHash) {
    throw new Error(`Static export lockfile hash mismatch: expected ${lockfileHash}, received ${manifest.lockfileHash}`)
  }

  const output = hashDirectory(exportDir)
  if (manifest.outputHash !== output.outputHash || manifest.fileCount !== output.fileCount || manifest.htmlFileCount !== output.htmlFileCount) {
    throw new Error(`Static export content mismatch: expected ${manifest.outputHash}/${manifest.fileCount}/${manifest.htmlFileCount}, received ${output.outputHash}/${output.fileCount}/${output.htmlFileCount}`)
  }

  return output
}

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : null
}

function main() {
  const command = process.argv[2]
  const exportDir = argValue('--export-dir') || DEFAULT_EXPORT_DIR
  const receiptPath = argValue('--receipt') || DEFAULT_RECEIPT_PATH

  if (command === 'write') {
    const sourceSha = argValue('--source-sha')
    const baseSha = argValue('--base-sha')
    const runId = argValue('--run-id')
    const manifest = createManifest({ sourceSha, baseSha, exportDir, runId })
    fs.writeFileSync(receiptPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    console.log(`Governed static export receipt written: ${receiptPath}`)
    console.log(`source=${manifest.sourceSha} base=${manifest.baseSha} output=${manifest.outputHash} files=${manifest.fileCount} html=${manifest.htmlFileCount}`)
    return
  }

  if (command === 'verify') {
    const expectedSourceSha = argValue('--source-sha')
    const expectedBaseSha = argValue('--base-sha')
    if (!fs.existsSync(receiptPath)) throw new Error(`Governed static export receipt is missing: ${receiptPath}`)
    const manifest = JSON.parse(fs.readFileSync(receiptPath, 'utf8'))
    const output = verifyManifest({ manifest, expectedSourceSha, expectedBaseSha, exportDir })
    console.log(`Governed static export verified: source=${manifest.sourceSha} base=${manifest.baseSha} output=${output.outputHash}`)
    return
  }

  throw new Error('Usage: node scripts/ci/governed-static-export.mjs <write|verify> --source-sha <sha> --base-sha <sha> [--run-id <id>] [--export-dir out] [--receipt path]')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
