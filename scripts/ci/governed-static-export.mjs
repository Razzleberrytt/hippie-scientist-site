import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import process from 'node:process'
import zlib from 'node:zlib'

export const GOVERNED_STATIC_EXPORT_SCHEMA_VERSION = 3
export const DEFAULT_EXPORT_DIR = 'out'
export const DEFAULT_RECEIPT_PATH = '.governed-static-export.json'
export const DEFAULT_VERIFICATION_STATE_DIR = 'public/data'
export const DEFAULT_BUILD_MANIFEST_PATH = '.next/build-manifest.json'

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function assertSha(label, value) {
  if (!/^[0-9a-f]{40}$/i.test(value || '')) {
    throw new Error(`${label} must be a 40-character git SHA; received ${JSON.stringify(value)}`)
  }
}

function canonicalPathCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function normalizeRelativePath(value) {
  return value.split(path.sep).join('/')
}

function walkFiles(rootDir, currentDir = rootDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(currentDir, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(rootDir, absolute))
    else if (entry.isFile()) files.push(normalizeRelativePath(path.relative(rootDir, absolute)))
  }
  return files.sort(canonicalPathCompare)
}

function hashFileEntries(entries) {
  const aggregate = crypto.createHash('sha256')
  for (const entry of entries) {
    aggregate.update(entry.path)
    aggregate.update('\0')
    aggregate.update(String(entry.content.length))
    aggregate.update('\0')
    aggregate.update(sha256(entry.content))
    aggregate.update('\0')
  }
  return aggregate.digest('hex')
}

function readDirectoryEntries(rootDir) {
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    throw new Error(`Verification state directory does not exist: ${rootDir}`)
  }
  return walkFiles(rootDir).map((relative) => ({
    path: relative,
    content: fs.readFileSync(path.join(rootDir, relative)),
  }))
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

  const entries = files.map((relative) => ({
    path: relative,
    content: fs.readFileSync(path.join(rootDir, relative)),
  }))

  return {
    outputHash: hashFileEntries(entries),
    fileCount: files.length,
    htmlFileCount,
  }
}

export function createVerificationStateSnapshot(rootDir = DEFAULT_VERIFICATION_STATE_DIR) {
  const entries = readDirectoryEntries(rootDir)
  if (entries.length === 0) throw new Error(`Verification state is empty: ${rootDir}`)

  const serialized = Buffer.from(JSON.stringify({
    files: entries.map((entry) => ({ path: entry.path, content: entry.content.toString('base64') })),
  }))
  const payload = zlib.gzipSync(serialized, { level: 9 }).toString('base64')

  return {
    root: normalizeRelativePath(rootDir),
    encoding: 'gzip+base64-json',
    stateHash: hashFileEntries(entries),
    fileCount: entries.length,
    payload,
  }
}

function decodeVerificationStateSnapshot(snapshot) {
  if (!snapshot || snapshot.encoding !== 'gzip+base64-json' || typeof snapshot.payload !== 'string') {
    throw new Error('Governed static export verification state is missing or uses an unsupported encoding')
  }
  let parsed
  try {
    parsed = JSON.parse(zlib.gunzipSync(Buffer.from(snapshot.payload, 'base64')).toString('utf8'))
  } catch (error) {
    throw new Error(`Governed static export verification state payload is invalid: ${error instanceof Error ? error.message : error}`)
  }
  if (!Array.isArray(parsed?.files) || parsed.files.length === 0) {
    throw new Error('Governed static export verification state payload contains no files')
  }

  const seen = new Set()
  const entries = parsed.files.map((entry) => {
    const relative = typeof entry?.path === 'string' ? entry.path : ''
    if (!relative || path.isAbsolute(relative) || relative.split('/').some((part) => part === '..' || part === '')) {
      throw new Error(`Governed static export verification state contains an unsafe path: ${JSON.stringify(relative)}`)
    }
    if (seen.has(relative)) throw new Error(`Governed static export verification state contains a duplicate path: ${relative}`)
    seen.add(relative)
    if (typeof entry.content !== 'string') throw new Error(`Governed static export verification state is missing content for ${relative}`)
    return { path: relative, content: Buffer.from(entry.content, 'base64') }
  }).sort((a, b) => canonicalPathCompare(a.path, b.path))

  const stateHash = hashFileEntries(entries)
  if (snapshot.stateHash !== stateHash || snapshot.fileCount !== entries.length) {
    throw new Error(`Governed static export verification state mismatch: expected ${snapshot.stateHash}/${snapshot.fileCount}, received ${stateHash}/${entries.length}`)
  }
  return entries
}

export function materializeVerificationState(snapshot, rootDir = DEFAULT_VERIFICATION_STATE_DIR) {
  const entries = decodeVerificationStateSnapshot(snapshot)
  fs.rmSync(rootDir, { recursive: true, force: true })
  fs.mkdirSync(rootDir, { recursive: true })
  for (const entry of entries) {
    const destination = path.join(rootDir, ...entry.path.split('/'))
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, entry.content)
  }
  return { stateHash: snapshot.stateHash, fileCount: entries.length }
}

export function createBuildStateSnapshot(buildManifestPath = DEFAULT_BUILD_MANIFEST_PATH) {
  if (!fs.existsSync(buildManifestPath) || !fs.statSync(buildManifestPath).isFile()) {
    throw new Error(`Build manifest does not exist: ${buildManifestPath}`)
  }
  const content = fs.readFileSync(buildManifestPath)
  return {
    path: normalizeRelativePath(buildManifestPath),
    encoding: 'base64',
    contentHash: sha256(content),
    byteLength: content.length,
    payload: content.toString('base64'),
  }
}

function decodeBuildStateSnapshot(snapshot, buildManifestPath = DEFAULT_BUILD_MANIFEST_PATH) {
  const expectedPath = normalizeRelativePath(buildManifestPath)
  if (!snapshot || snapshot.path !== expectedPath || snapshot.encoding !== 'base64' || typeof snapshot.payload !== 'string') {
    throw new Error(`Governed static export build state is missing or invalid for ${expectedPath}`)
  }
  const content = Buffer.from(snapshot.payload, 'base64')
  const contentHash = sha256(content)
  if (snapshot.contentHash !== contentHash || snapshot.byteLength !== content.length) {
    throw new Error(`Governed static export build state mismatch: expected ${snapshot.contentHash}/${snapshot.byteLength}, received ${contentHash}/${content.length}`)
  }
  return content
}

export function materializeBuildState(snapshot, buildManifestPath = DEFAULT_BUILD_MANIFEST_PATH) {
  const content = decodeBuildStateSnapshot(snapshot, buildManifestPath)
  fs.mkdirSync(path.dirname(buildManifestPath), { recursive: true })
  fs.writeFileSync(buildManifestPath, content)
  return { contentHash: snapshot.contentHash, byteLength: content.length }
}

export function createManifest({ sourceSha, baseSha, exportDir = DEFAULT_EXPORT_DIR, verificationStateDir = DEFAULT_VERIFICATION_STATE_DIR, buildManifestPath = DEFAULT_BUILD_MANIFEST_PATH, lockfilePath = 'package-lock.json', runId = null }) {
  assertSha('sourceSha', sourceSha)
  assertSha('baseSha', baseSha)
  if (!fs.existsSync(lockfilePath)) throw new Error(`Lockfile does not exist: ${lockfilePath}`)

  const output = hashDirectory(exportDir)
  const verificationState = createVerificationStateSnapshot(verificationStateDir)
  const buildState = createBuildStateSnapshot(buildManifestPath)
  return {
    schemaVersion: GOVERNED_STATIC_EXPORT_SCHEMA_VERSION,
    sourceSha: sourceSha.toLowerCase(),
    baseSha: baseSha.toLowerCase(),
    lockfileHash: sha256(fs.readFileSync(lockfilePath)),
    nodeVersion: process.version,
    outputHash: output.outputHash,
    fileCount: output.fileCount,
    htmlFileCount: output.htmlFileCount,
    verificationState,
    buildState,
    producerRunId: runId ? String(runId) : null,
  }
}

export function verifyManifest({ manifest, expectedSourceSha, expectedBaseSha, exportDir = DEFAULT_EXPORT_DIR, verificationStateDir = DEFAULT_VERIFICATION_STATE_DIR, buildManifestPath = DEFAULT_BUILD_MANIFEST_PATH, lockfilePath = 'package-lock.json', restoreVerificationState = false, restoreBuildState = false }) {
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

  const verificationEntries = decodeVerificationStateSnapshot(manifest.verificationState)
  const buildState = decodeBuildStateSnapshot(manifest.buildState, buildManifestPath)
  if (restoreVerificationState) materializeVerificationState(manifest.verificationState, verificationStateDir)
  if (restoreBuildState) materializeBuildState(manifest.buildState, buildManifestPath)

  return {
    ...output,
    verificationStateHash: manifest.verificationState.stateHash,
    verificationStateFileCount: verificationEntries.length,
    buildManifestHash: manifest.buildState.contentHash,
    buildManifestByteLength: buildState.length,
  }
}

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : null
}

function main() {
  const command = process.argv[2]
  const exportDir = argValue('--export-dir') || DEFAULT_EXPORT_DIR
  const receiptPath = argValue('--receipt') || DEFAULT_RECEIPT_PATH
  const verificationStateDir = argValue('--verification-state-dir') || DEFAULT_VERIFICATION_STATE_DIR
  const buildManifestPath = argValue('--build-manifest') || DEFAULT_BUILD_MANIFEST_PATH

  if (command === 'write') {
    const sourceSha = argValue('--source-sha')
    const baseSha = argValue('--base-sha')
    const runId = argValue('--run-id')
    const manifest = createManifest({ sourceSha, baseSha, exportDir, verificationStateDir, buildManifestPath, runId })
    fs.writeFileSync(receiptPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    console.log(`Governed static export receipt written: ${receiptPath}`)
    console.log(`source=${manifest.sourceSha} base=${manifest.baseSha} output=${manifest.outputHash} files=${manifest.fileCount} html=${manifest.htmlFileCount} verificationState=${manifest.verificationState.stateHash}/${manifest.verificationState.fileCount} buildManifest=${manifest.buildState.contentHash}/${manifest.buildState.byteLength}`)
    return
  }

  if (command === 'verify') {
    const expectedSourceSha = argValue('--source-sha')
    const expectedBaseSha = argValue('--base-sha')
    if (!fs.existsSync(receiptPath)) throw new Error(`Governed static export receipt is missing: ${receiptPath}`)
    const manifest = JSON.parse(fs.readFileSync(receiptPath, 'utf8'))
    const output = verifyManifest({ manifest, expectedSourceSha, expectedBaseSha, exportDir, verificationStateDir, buildManifestPath, restoreVerificationState: true, restoreBuildState: true })
    console.log(`Governed static export verified: source=${manifest.sourceSha} base=${manifest.baseSha} output=${output.outputHash} verificationState=${output.verificationStateHash}/${output.verificationStateFileCount} buildManifest=${output.buildManifestHash}/${output.buildManifestByteLength}`)
    return
  }

  throw new Error('Usage: node scripts/ci/governed-static-export.mjs <write|verify> --source-sha <sha> --base-sha <sha> [--run-id <id>] [--export-dir out] [--verification-state-dir public/data] [--build-manifest .next/build-manifest.json] [--receipt path]')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
