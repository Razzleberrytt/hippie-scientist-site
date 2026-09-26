import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

/** Wake eligibility is only a scheduling hint. The existing controller owns all merge gates. */
export async function resolveWake({ eventName, event, repo, get }) {
  const stop = reason => ({ proceed: false, sweep: false, reason })
  if (eventName === 'schedule') return { proceed: true, sweep: true, reason: 'recovery-sweep' }
  if (eventName === 'workflow_dispatch') {
    const number = String(event.inputs?.pr_number || '')
    const sha = String(event.inputs?.expected_head_sha || '')
    if (!number && !sha) return { proceed: true, sweep: true, reason: 'manual-recovery-sweep' }
    if (!/^[1-9]\d*$/.test(number) || !/^[a-f0-9]{40}$/.test(sha)) return stop('invalid-target')
    const pr = await get(`/repos/${repo}/pulls/${number}`)
    if (pr.state !== 'open' || pr.draft || pr.head?.sha !== sha || pr.head?.repo?.full_name !== repo) return stop('stale-or-ineligible-target')
    return { proceed: true, sweep: false, pr_number: number, head_sha: sha, reason: 'exact-manual-target' }
  }
  if (eventName !== 'workflow_run') return stop('unsupported-event')
  const run = event.workflow_run
  if (run?.status !== 'completed' || run.conclusion !== 'success' ||
      !['pull_request', 'workflow_dispatch'].includes(run.event) || run.head_repository?.full_name !== repo ||
      !/^[a-f0-9]{40}$/.test(run.head_sha || '')) return stop('non-actionable-completion')

  // Resolve current PR identity from GitHub, never trust event pull_requests or a branch name.
  const candidates = []
  for (let page = 1; ; page += 1) {
    const batch = await get(`/repos/${repo}/commits/${run.head_sha}/pulls?per_page=100&page=${page}`)
    candidates.push(...batch)
    if (batch.length < 100) break
  }
  const matches = candidates.filter(pr => pr.state === 'open' && !pr.draft &&
    pr.head?.repo?.full_name === repo && pr.head?.sha === run.head_sha)
  if (matches.length !== 1) return stop('no-unique-current-pr')
  return { proceed: true, sweep: false, pr_number: String(matches[0].number), head_sha: run.head_sha, reason: 'exact-completion-target' }
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY
  if (!repo || !process.env.GITHUB_EVENT_PATH || !process.env.GITHUB_OUTPUT) throw new Error('Missing GitHub wake context')
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
  const result = await resolveWake({ repo, eventName: process.env.GITHUB_EVENT_NAME, event, get: async endpoint => {
    const response = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}${endpoint}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (!response.ok) throw new Error(`Wake lookup failed: ${response.status}`)
    return response.json()
  } })
  for (const key of ['proceed', 'sweep', 'pr_number', 'head_sha']) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${result[key] ?? ''}\n`)
  console.log(`Controller wake: ${result.reason}`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1 })
