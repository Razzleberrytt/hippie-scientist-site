#!/usr/bin/env node

const repo = process.env.GITHUB_REPOSITORY
const mergeSha = process.env.DEPLOY_SHA || process.env.GITHUB_SHA
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
const attempts = Number.parseInt(process.env.DEPLOY_AUTH_ATTEMPTS || '30', 10)
const intervalMs = Number.parseInt(process.env.DEPLOY_AUTH_INTERVAL_MS || '10000', 10)
const context = 'autonomous-merge/authorized'

if (!repo || !mergeSha || !token) {
  console.error('Missing GITHUB_REPOSITORY, deploy SHA, or GitHub token for deployment authorization verification.')
  process.exit(1)
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
}

async function api(path) {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, { headers })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API ${response.status} for ${path}: ${body}`)
  }
  return response.json()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const associated = await api(`/commits/${mergeSha}/pulls`)
  const merged = associated.filter(pr => pr.merged_at && pr.merge_commit_sha === mergeSha)

  if (merged.length !== 1) {
    throw new Error(`Deployment SHA ${mergeSha} must map to exactly one merged PR; found ${merged.length}. Direct pushes and ambiguous merge provenance fail closed.`)
  }

  const pr = merged[0]
  const headSha = pr.head?.sha
  if (!headSha) throw new Error(`Associated PR #${pr.number} has no head SHA.`)

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const status = await api(`/commits/${headSha}/status`)
    const authorized = status.statuses?.find(item => item.context === context && item.state === 'success')
    if (authorized) {
      console.log(`Deployment authorized: PR #${pr.number}, head ${headSha}, merge ${mergeSha}.`)
      return
    }

    if (attempt < attempts) await sleep(intervalMs)
  }

  throw new Error(`No successful ${context} receipt found on exact merged PR head ${headSha} after ${attempts} attempts.`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
