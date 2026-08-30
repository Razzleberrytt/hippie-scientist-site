import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { atomicJson, loadJsonStrict, repoRoot, statePath } from './state-io.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const controlPath = path.join(here, 'control.mjs')
const receiptDir = path.join(repoRoot, 'ops', 'enrichment-governor', 'transactions')
const SHA_RE = /^[0-9a-f]{40}$/i
const TOKEN_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const PURPOSE_RE = /^[A-Za-z0-9][A-Za-z0-9 ._:/+-]{0,255}$/
const DISPOSITION_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/
const ENTITY_RE = /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9._-]*$/
const FILE_RE = /^[A-Za-z0-9._@+/-]+$/

const nowIso = () => new Date().toISOString()

function unique(values) {
  return [...new Set(values)]
}

export function parseList(value) {
  if (Array.isArray(value)) return unique(value.map(item => String(item).trim()).filter(Boolean))
  if (!value) return []
  return unique(String(value).split(',').map(item => item.trim()).filter(Boolean))
}

function validateToken(label, value, expression = TOKEN_RE) {
  const normalized = String(value || '').trim()
  if (!normalized) throw new Error(`${label} is required`)
  if (!expression.test(normalized)) throw new Error(`${label} contains unsupported characters`)
  return normalized
}

export function validateLeaseFile(value) {
  const file = String(value || '').trim()
  if (!file) throw new Error('lease file path cannot be empty')
  if (!FILE_RE.test(file)) throw new Error(`lease file path contains unsupported characters: ${file}`)
  if (file.startsWith('/') || file.includes('\\')) throw new Error(`lease file path must be repository-relative: ${file}`)
  const normalized = path.posix.normalize(file)
  if (normalized !== file || normalized === '.' || normalized.startsWith('../') || file.split('/').includes('..')) {
    throw new Error(`lease file path traversal is not allowed: ${file}`)
  }
  return file
}

export function validateLeaseEntity(value) {
  const entity = String(value || '').trim()
  if (!ENTITY_RE.test(entity)) throw new Error(`malformed entity key: ${entity || '<empty>'}`)
  return entity
}

export function validateLeaseTransactionInput(input = {}) {
  const operation = String(input.operation || '').trim().toLowerCase()
  if (!['acquire', 'release'].includes(operation)) throw new Error(`unknown lease operation: ${operation || '<empty>'}`)

  const id = validateToken('lease id', input.id)
  const owner = validateToken('lease owner', input.owner)
  const files = parseList(input.files).map(validateLeaseFile)
  const entities = parseList(input.entities).map(validateLeaseEntity)

  if (operation === 'acquire' && files.length === 0 && entities.length === 0) {
    throw new Error('lease acquire requires at least one exact file or entity scope')
  }
  if (operation === 'release' && (files.length > 0 || entities.length > 0)) {
    throw new Error('lease release must not redefine file/entity scope')
  }

  const purpose = operation === 'acquire'
    ? validateToken('lease purpose', input.purpose || 'enrichment', PURPOSE_RE)
    : null
  const disposition = operation === 'release'
    ? validateToken('lease disposition', input.disposition || 'completed', DISPOSITION_RE)
    : null

  const actor = input.actor ? validateToken('workflow actor', input.actor) : null
  const baseSha = input.baseSha ? String(input.baseSha).trim() : null
  if (baseSha && !SHA_RE.test(baseSha)) throw new Error('base SHA must be a 40-character Git SHA')

  return { operation, id, owner, purpose, files, entities, disposition, actor, baseSha }
}

export function assertFreshBase(expected, actual) {
  if (!SHA_RE.test(String(expected || ''))) throw new Error('expected base SHA is invalid')
  if (!SHA_RE.test(String(actual || ''))) throw new Error('actual base SHA is invalid')
  if (String(expected).toLowerCase() !== String(actual).toLowerCase()) {
    throw new Error(`stale governor transaction base: expected ${expected}, current main is ${actual}`)
  }
  return true
}

function hashFile(file) {
  if (!fs.existsSync(file)) return null
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

export function stateHashes() {
  return {
    workQueueSha256: hashFile(statePath('work-queue.json')),
    ledgerSha256: hashFile(statePath('ledger.jsonl')),
  }
}

function invokeControl(request) {
  const command = request.operation === 'acquire' ? 'lease-acquire' : 'lease-release'
  const args = [controlPath, command, `--id=${request.id}`, `--owner=${request.owner}`]

  if (request.operation === 'acquire') {
    args.push(`--purpose=${request.purpose}`)
    if (request.files.length) args.push(`--files=${request.files.join(',')}`)
    if (request.entities.length) args.push(`--entities=${request.entities.join(',')}`)
  } else {
    args.push(`--disposition=${request.disposition}`)
  }

  const child = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    shell: false,
  })

  if (child.error) throw child.error
  if (child.status !== 0) {
    const detail = String(child.stderr || child.stdout || '').trim()
    throw new Error(`control.mjs ${command} rejected transaction${detail ? `: ${detail}` : ''}`)
  }

  let result
  try {
    result = JSON.parse(child.stdout)
  } catch (error) {
    throw new Error(`control.mjs returned unreadable JSON: ${error.message}`)
  }
  if (result?.ok !== true) throw new Error(`control.mjs ${command} did not return ok=true`)
  return result
}

function receiptName(request) {
  const runId = String(process.env.GITHUB_RUN_ID || Date.now()).replace(/[^0-9A-Za-z_-]/g, '-')
  const attempt = String(process.env.GITHUB_RUN_ATTEMPT || '1').replace(/[^0-9A-Za-z_-]/g, '-')
  const lease = request.id.replace(/[^0-9A-Za-z._-]/g, '-')
  return `${runId}-${attempt}-${request.operation}-${lease}.json`
}

export function runTransaction(input = {}) {
  const request = validateLeaseTransactionInput(input)
  const before = stateHashes()
  const result = invokeControl(request)
  const after = stateHashes()

  fs.mkdirSync(receiptDir, { recursive: true })
  const absoluteReceipt = path.join(receiptDir, receiptName(request))
  const receiptPath = path.relative(repoRoot, absoluteReceipt).split(path.sep).join('/')
  const receipt = {
    schemaVersion: 1,
    transactionType: 'enrichment_governor_lease',
    requestedAt: nowIso(),
    operation: request.operation,
    actor: request.actor,
    owner: request.owner,
    leaseId: request.id,
    purpose: request.purpose,
    files: request.files,
    entities: request.entities,
    disposition: request.disposition,
    baseSha: request.baseSha,
    before,
    after,
    result: request.operation === 'acquire'
      ? { acquired: true, expiresAt: result.lease?.expiresAt || null }
      : { released: Boolean(result.released), existed: result.released !== false },
    transactionCommitSha: null,
  }
  atomicJson(absoluteReceipt, receipt)
  return { ok: true, receiptPath, receipt }
}

function resolveReceiptPath(value) {
  const relative = String(value || '').trim().split(path.sep).join('/')
  if (!relative.startsWith('ops/enrichment-governor/transactions/')) throw new Error('receipt path must stay inside governor transactions')
  if (!relative.endsWith('.json') || relative.includes('..')) throw new Error('invalid governor receipt path')
  const absolute = path.resolve(repoRoot, relative)
  if (!absolute.startsWith(`${receiptDir}${path.sep}`)) throw new Error('governor receipt path escaped transaction directory')
  return { relative, absolute }
}

export function finalizeReceipt(receiptPath, transactionCommitSha) {
  if (!SHA_RE.test(String(transactionCommitSha || ''))) throw new Error('transaction commit SHA must be a 40-character Git SHA')
  const resolved = resolveReceiptPath(receiptPath)
  const receipt = loadJsonStrict(resolved.absolute, null)
  if (!receipt) throw new Error(`governor receipt not found: ${resolved.relative}`)
  if (receipt.transactionCommitSha && receipt.transactionCommitSha !== transactionCommitSha) {
    throw new Error('governor receipt already references a different transaction commit')
  }
  const finalized = { ...receipt, transactionCommitSha, finalizedAt: nowIso() }
  atomicJson(resolved.absolute, finalized)
  return { ok: true, receiptPath: resolved.relative, receipt: finalized }
}

function inputFromEnvironment() {
  return {
    operation: process.env.TRANSACTION_OPERATION,
    id: process.env.LEASE_ID,
    owner: process.env.LEASE_OWNER,
    purpose: process.env.LEASE_PURPOSE,
    files: process.env.LEASE_FILES,
    entities: process.env.LEASE_ENTITIES,
    disposition: process.env.LEASE_DISPOSITION,
    actor: process.env.GITHUB_ACTOR,
    baseSha: process.env.BASE_SHA,
  }
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2]
  try {
    if (command === 'validate') print({ ok: true, request: validateLeaseTransactionInput(inputFromEnvironment()) })
    else if (command === 'run') print(runTransaction(inputFromEnvironment()))
    else if (command === 'assert-fresh') {
      assertFreshBase(process.env.EXPECTED_BASE_SHA, process.env.ACTUAL_BASE_SHA)
      print({ ok: true, baseSha: process.env.ACTUAL_BASE_SHA })
    } else if (command === 'finalize') {
      print(finalizeReceipt(process.env.RECEIPT_PATH, process.env.TRANSACTION_COMMIT_SHA))
    } else {
      console.error('Usage: lease-transaction.mjs validate|run|assert-fresh|finalize')
      process.exitCode = 2
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
