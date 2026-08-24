import fs from 'node:fs'
import { contract } from './governor.mjs'

const token = process.env.GITHUB_TOKEN
const repository = process.env.GITHUB_REPOSITORY
const eventPath = process.env.GITHUB_EVENT_PATH

const sensitive = file => contract.coordination.sensitivePathPrefixes.some(prefix => file.startsWith(prefix))

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-enrichment-governor',
    },
  })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}`)
  return response.json()
}

async function allPages(path) {
  const rows = []
  for (let page = 1; page <= 10; page += 1) {
    const join = path.includes('?') ? '&' : '?'
    const batch = await github(`${path}${join}per_page=100&page=${page}`)
    rows.push(...batch)
    if (batch.length < 100) break
  }
  return rows
}

export function overlapReport(currentFiles, otherPrs) {
  const current = new Set(currentFiles.filter(sensitive))
  const overlaps = []
  for (const pr of otherPrs) {
    const shared = [...new Set((pr.files || []).filter(file => current.has(file) && sensitive(file)))].sort()
    if (shared.length) overlaps.push({ number: pr.number, title: pr.title, head: pr.head, shared })
  }
  return { currentSensitiveFiles: [...current].sort(), overlaps, ok: overlaps.length === 0 }
}

async function main() {
  if (!token || !repository || !eventPath || !fs.existsSync(eventPath)) {
    return { ok: true, skipped: true, reason: 'not_running_in_github_pr_context' }
  }
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const currentNumber = event.pull_request?.number || event.number
  if (!currentNumber) return { ok: true, skipped: true, reason: 'not_a_pull_request_event' }

  const [owner, repo] = repository.split('/')
  const currentFilesPayload = await allPages(`/repos/${owner}/${repo}/pulls/${currentNumber}/files`)
  const currentFiles = currentFilesPayload.map(row => row.filename)
  const openPrs = await allPages(`/repos/${owner}/${repo}/pulls?state=open`)
  const otherPrs = []
  for (const pr of openPrs) {
    if (pr.number === currentNumber) continue
    const files = await allPages(`/repos/${owner}/${repo}/pulls/${pr.number}/files`)
    otherPrs.push({ number: pr.number, title: pr.title, head: pr.head?.ref || null, files: files.map(row => row.filename) })
  }
  return overlapReport(currentFiles, otherPrs)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await main()
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    if (!result.ok) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
