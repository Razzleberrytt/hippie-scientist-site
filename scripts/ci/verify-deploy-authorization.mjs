#!/usr/bin/env node

import fs from 'node:fs'

const repo = process.env.GITHUB_REPOSITORY
const mergeSha = process.env.DEPLOY_SHA || process.env.GITHUB_SHA
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
const attempts = Number.parseInt(process.env.DEPLOY_AUTH_ATTEMPTS || '30', 10)
const intervalMs = Number.parseInt(process.env.DEPLOY_AUTH_INTERVAL_MS || '10000', 10)
const context = 'autonomous-merge/authorized'
const validatedContext = 'autonomous-merge/validated'
const owner = (repo || '').split('/')[0]

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

function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (outputPath) fs.appendFileSync(outputPath, `${name}=${String(value)}\n`)
  console.log(`[deploy-auth] ${name}=${String(value)}`)
}

function recordAuthorization({ mode, prNumber, headSha, treeIdentical, baseIdentical, skipRedundantValidation }) {
  writeOutput('authorization_mode', mode)
  writeOutput('pr_number', prNumber)
  writeOutput('validated_head_sha', headSha)
  writeOutput('tree_identical', treeIdentical)
  writeOutput('base_identical', baseIdentical)
  writeOutput('skip_redundant_validation', skipRedundantValidation)
}

function validatedDescription(prNumber, baseSha) {
  return `PR #${prNumber} exact-head validated on ${baseSha}`
}

async function exactMergeIdentity(headSha, baseSha) {
  const [mergeCommit, headCommit] = await Promise.all([
    api(`/git/commits/${mergeSha}`),
    api(`/git/commits/${headSha}`),
  ])
  const mergeTree = mergeCommit?.tree?.sha || ''
  const headTree = headCommit?.tree?.sha || ''
  const mergeBase = mergeCommit?.parents?.[0]?.sha || ''
  return {
    treeIdentical: Boolean(mergeTree && headTree && mergeTree === headTree),
    baseIdentical: Boolean(mergeBase && baseSha && mergeBase === baseSha),
  }
}

function findValidatedReceipt(status, prNumber, baseSha) {
  const expected = validatedDescription(prNumber, baseSha)
  return status.statuses?.find(item =>
    item.context === validatedContext &&
    item.state === 'success' &&
    item.description === expected
  )
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

  // Read the full PR so validation reuse can be bound to the exact PR base.
  // The commit-pulls summary omits merged_by and is not sufficient by itself.
  const fullPr = await api(`/pulls/${pr.number}`)
  const mergedBy = fullPr.merged_by?.login || pr.merged_by?.login
  const baseSha = fullPr.base?.sha || pr.base?.sha
  if (!baseSha) throw new Error(`Associated PR #${pr.number} has no base SHA.`)

  // The trusted pull_request_target monitor emits this receipt only after the
  // exact head is terminal-green against the exact base. The proof is about
  // validated bytes, not which trusted actor wins the final merge race.
  const initialStatus = await api(`/commits/${headSha}/status`)
  const validated = findValidatedReceipt(initialStatus, pr.number, baseSha)
  if (validated) {
    const { treeIdentical, baseIdentical } = await exactMergeIdentity(headSha, baseSha)
    const reusable = treeIdentical && baseIdentical
    recordAuthorization({
      mode: 'validated-head',
      prNumber: pr.number,
      headSha,
      treeIdentical,
      baseIdentical,
      skipRedundantValidation: reusable,
    })
    console.log(
      reusable
        ? `Deployment authorized: PR #${pr.number} exact head ${headSha} was validated on base ${baseSha} and the merge preserved both base and tree.`
        : `Exact-head validation receipt found for PR #${pr.number}, but merge identity changed; retaining full deploy validation.`,
    )
    return
  }

  // Owner/manual merges remain deployable, but without an exact-head receipt
  // they retain the complete defensive pre-build validation sequence.
  if (owner && mergedBy && mergedBy.toLowerCase() === owner.toLowerCase()) {
    recordAuthorization({
      mode: 'owner',
      prNumber: pr.number,
      headSha,
      treeIdentical: false,
      baseIdentical: false,
      skipRedundantValidation: false,
    })
    console.log(`Deployment authorized: PR #${pr.number} merged by repository owner ${mergedBy}, merge ${mergeSha}; no exact-head validation receipt, so retaining full deploy validation.`)
    return
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const status = attempt === 1 ? initialStatus : await api(`/commits/${headSha}/status`)
    const authorized = status.statuses?.find(item => item.context === context && item.state === 'success')
    if (authorized) {
      const { treeIdentical, baseIdentical } = await exactMergeIdentity(headSha, baseSha)
      const reusable = treeIdentical && baseIdentical
      recordAuthorization({
        mode: 'controller',
        prNumber: pr.number,
        headSha,
        treeIdentical,
        baseIdentical,
        skipRedundantValidation: reusable,
      })
      console.log(
        reusable
          ? `Deployment authorized: PR #${pr.number}, head ${headSha}, merge ${mergeSha}; controller receipt plus exact base/tree permit validation reuse.`
          : `Controller receipt found for PR #${pr.number}, but merge base/tree identity changed; retaining full deploy validation.`,
      )
      return
    }

    if (attempt < attempts) await sleep(intervalMs)
  }

  throw new Error(`No successful ${validatedContext} or ${context} receipt found on exact merged PR head ${headSha} after ${attempts} attempts, and PR #${pr.number} was merged by ${mergedBy || 'an unknown account'} rather than the repository owner.`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
