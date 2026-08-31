import fs from 'node:fs'

import { validateLeaseTransactionInput } from '../enrichment-governor/lease-transaction.mjs'

const GOVERNOR_PREFIX = '/governor '
const ALLOWED_GOVERNOR_KEYS = new Set([
  'operation',
  'id',
  'owner',
  'purpose',
  'files',
  'entities',
  'disposition',
])
const SESSION_FILE_RE = /^ops\/enrichment-submissions\/sessions\/(session-[a-z0-9-]+)\//
const SHA_RE = /^[0-9a-f]{40}$/i

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function assertStringArray(label, value) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of strings`)
  }
  return value
}

export function parseGovernorComment(comment) {
  const text = String(comment ?? '').trim()
  if (!text.startsWith(GOVERNOR_PREFIX)) {
    throw new Error('governor command must start with /governor followed by a JSON object')
  }

  let payload
  try {
    payload = JSON.parse(text.slice(GOVERNOR_PREFIX.length))
  } catch (error) {
    throw new Error(`governor command payload must be valid JSON: ${error.message}`)
  }
  if (!isPlainObject(payload)) throw new Error('governor command payload must be a JSON object')

  const unknown = Object.keys(payload).filter(key => !ALLOWED_GOVERNOR_KEYS.has(key))
  if (unknown.length) throw new Error(`unsupported governor command fields: ${unknown.sort().join(', ')}`)

  const files = assertStringArray('files', payload.files)
  const entities = assertStringArray('entities', payload.entities)
  const request = validateLeaseTransactionInput({
    operation: payload.operation,
    id: payload.id,
    owner: payload.owner,
    purpose: payload.purpose,
    files,
    entities,
    disposition: payload.disposition,
  })

  return request
}

export function governorDispatchInputs(request) {
  return {
    operation: request.operation,
    lease_id: request.id,
    owner: request.owner,
    purpose: request.purpose || '',
    files: request.files.join(','),
    entities: request.entities.join(','),
    disposition: request.disposition || '',
  }
}

export function sessionFromChangedFiles(files = []) {
  const sessions = new Set()
  for (const file of files) {
    const match = SESSION_FILE_RE.exec(String(file || ''))
    if (match) sessions.add(match[1])
  }
  if (sessions.size > 1) {
    throw new Error(`one PR may not span multiple enrichment sessions: ${[...sessions].sort().join(', ')}`)
  }
  return sessions.size === 1 ? [...sessions][0] : null
}

export function validateReadySnapshot(pr, repository) {
  if (!isPlainObject(pr)) throw new Error('pull request metadata is required')
  if (pr.state !== 'open') throw new Error('pull request must be open')
  if (pr.draft !== true) throw new Error('pull request must still be draft')
  if (pr.base?.ref !== 'main') throw new Error('pull request base must be main')
  if (pr.head?.repo?.full_name !== repository) throw new Error('pull request head must come from the same repository')
  if (!pr.head?.sha || !SHA_RE.test(pr.head.sha)) throw new Error('pull request head SHA is missing or invalid')
  if (!pr.head?.ref || /[\r\n]/.test(pr.head.ref)) throw new Error('pull request head ref is missing or invalid')
  return true
}

export function validateCurrentMainAncestry(compare, currentMainSha, headSha) {
  if (!SHA_RE.test(String(currentMainSha || ''))) throw new Error('current main SHA is missing or invalid')
  if (!SHA_RE.test(String(headSha || ''))) throw new Error('pull request head SHA is missing or invalid')
  if (!isPlainObject(compare)) throw new Error('GitHub compare result is required')
  if (Number(compare.behind_by || 0) !== 0) {
    throw new Error(`pull request is behind current main by ${compare.behind_by} commit(s)`)
  }
  if (compare.merge_base_commit?.sha !== currentMainSha) {
    throw new Error(`pull request does not contain exact current main ${currentMainSha}`)
  }
  return true
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`GitHub API ${response.status} for ${url}: ${detail.slice(0, 500)}`)
  }
  return response.json()
}

async function listAll(url, token) {
  const rows = []
  for (let page = 1; ; page += 1) {
    const joiner = url.includes('?') ? '&' : '?'
    const pageRows = await githubJson(`${url}${joiner}per_page=100&page=${page}`, token)
    if (!Array.isArray(pageRows)) throw new Error(`expected array response from ${url}`)
    rows.push(...pageRows)
    if (pageRows.length < 100) return rows
  }
}

async function changedFilesForPr(apiBase, prNumber, token) {
  const rows = await listAll(`${apiBase}/pulls/${prNumber}/files`, token)
  return rows.map(row => row.filename).filter(Boolean)
}

export async function validateReadyAgainstGitHub({ repository, prNumber, token }) {
  if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY must be owner/name')
  const number = Number(prNumber)
  if (!Number.isInteger(number) || number < 1) throw new Error('PR number must be a positive integer')
  if (!token) throw new Error('GITHUB_TOKEN is required')

  const apiBase = `https://api.github.com/repos/${repository}`
  const pr = await githubJson(`${apiBase}/pulls/${number}`, token)
  validateReadySnapshot(pr, repository)

  const mainBranch = await githubJson(`${apiBase}/branches/main`, token)
  const currentMainSha = mainBranch?.commit?.sha
  if (!SHA_RE.test(String(currentMainSha || ''))) throw new Error('unable to resolve exact current main SHA')
  const compare = await githubJson(`${apiBase}/compare/${currentMainSha}...${pr.head.sha}`, token)
  validateCurrentMainAncestry(compare, currentMainSha, pr.head.sha)

  const files = await changedFilesForPr(apiBase, number, token)
  const session = sessionFromChangedFiles(files)

  if (session) {
    const openPrs = await listAll(`${apiBase}/pulls?state=open&base=main`, token)
    for (const candidate of openPrs) {
      if (candidate.number === number || candidate.draft === true) continue
      if (candidate.head?.repo?.full_name !== repository) continue
      const candidateFiles = await changedFilesForPr(apiBase, candidate.number, token)
      const candidateSession = sessionFromChangedFiles(candidateFiles)
      if (candidateSession === session) {
        throw new Error(`session ${session} already has active non-draft PR #${candidate.number}`)
      }
    }
  }

  return {
    ok: true,
    prNumber: number,
    headSha: pr.head.sha,
    headRef: pr.head.ref,
    baseRef: pr.base.ref,
    currentMainSha,
    session,
  }
}

function appendOutputs(entries) {
  const outputFile = process.env.GITHUB_OUTPUT
  if (!outputFile) throw new Error('GITHUB_OUTPUT is required')
  for (const [key, value] of Object.entries(entries)) {
    const normalized = String(value ?? '')
    if (normalized.includes('\n') || normalized.includes('\r')) throw new Error(`output ${key} contains a newline`)
    fs.appendFileSync(outputFile, `${key}=${normalized}\n`)
  }
}

async function main() {
  const command = process.argv[2]
  if (command === 'parse-governor') {
    const request = parseGovernorComment(process.env.COMMENT_BODY)
    const inputs = governorDispatchInputs(request)
    appendOutputs(inputs)
    process.stdout.write(`${JSON.stringify({ ok: true, inputs }, null, 2)}\n`)
    return
  }
  if (command === 'validate-ready') {
    const result = await validateReadyAgainstGitHub({
      repository: process.env.GITHUB_REPOSITORY,
      prNumber: process.env.PR_NUMBER,
      token: process.env.GITHUB_TOKEN,
    })
    appendOutputs({
      pr_number: result.prNumber,
      head_sha: result.headSha,
      head_ref: result.headRef,
      base_ref: result.baseRef,
      main_sha: result.currentMainSha,
      session: result.session || '',
    })
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }
  throw new Error('Usage: owner-control-plane-bridge.mjs parse-governor|validate-ready')
}

if (process.argv[1] && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
