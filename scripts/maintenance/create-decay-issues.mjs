#!/usr/bin/env node
/**
 * Create missing content-decay issues from generated payloads. Existing open
 * issues are deduplicated by a stable HTML marker embedded in the issue body.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const payloadPath = path.resolve(process.argv[2] || 'reports/content-decay-issues.json')
const token = (process.env.GITHUB_TOKEN || '').trim()
const repository = (process.env.GITHUB_REPOSITORY || '').trim()

if (!fs.existsSync(payloadPath)) {
  console.log(`[create-decay-issues] SKIP: ${path.relative(root, payloadPath)} not found`)
  process.exit(0)
}
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
const issues = Array.isArray(payload.issues) ? payload.issues : []
if (!issues.length) {
  console.log('[create-decay-issues] no qualifying issue payloads')
  process.exit(0)
}
if (!token || !repository.includes('/')) {
  console.log('[create-decay-issues] SKIP: GITHUB_TOKEN / GITHUB_REPOSITORY not configured')
  process.exit(0)
}

const api = `https://api.github.com/repos/${repository}`
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'hippie-scientist-content-decay',
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
  return response.status === 204 ? null : response.json()
}

const existing = []
for (let page = 1; page <= 5; page += 1) {
  const batch = await request(`${api}/issues?state=open&per_page=100&page=${page}`)
  existing.push(...batch)
  if (batch.length < 100) break
}

let created = 0
let skipped = 0
for (const issue of issues) {
  if (existing.some((open) => String(open.body || '').includes(`<!-- ${issue.marker} -->`))) {
    skipped += 1
    continue
  }
  const createdIssue = await request(`${api}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: issue.title, body: issue.body }),
  })
  existing.push(createdIssue)
  created += 1
  console.log(`[create-decay-issues] created #${createdIssue.number}: ${issue.url}`)
}
console.log(`[create-decay-issues] created=${created}; already-open=${skipped}`)
