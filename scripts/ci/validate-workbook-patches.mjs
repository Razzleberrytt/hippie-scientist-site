#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const patchDir = path.join(repoRoot, 'data-sources/workbook-patches')
const runner = path.join(repoRoot, 'scripts/data/apply-workbook-patch.mjs')

if (!fs.existsSync(patchDir)) {
  console.log('[validate-workbook-patches] PASS: no workbook patch directory present.')
  process.exit(0)
}

const patchFiles = fs.readdirSync(patchDir)
  .filter((name) => name.endsWith('.json'))
  .sort()

if (patchFiles.length === 0) {
  console.log('[validate-workbook-patches] PASS: no workbook patch proposals present.')
  process.exit(0)
}

function runPatchCheck(patchPath) {
  return spawnSync(process.execPath, [runner, '--patch', patchPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

function resultOutput(result) {
  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
}

function runGit(args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  })
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`git ${args.join(' ')} failed${output ? `:\n${output}` : ''}`)
  }
  return result.stdout.trim()
}

function getCheckoutToken() {
  const authHeader = runGit(['config', '--local', '--get', 'http.https://github.com/.extraheader'])
  const match = authHeader.match(/AUTHORIZATION:\s*basic\s+(\S+)/i)
  if (!match) throw new Error('Could not read the authenticated checkout header')
  const decoded = Buffer.from(match[1], 'base64').toString('utf8')
  const separator = decoded.indexOf(':')
  const token = separator >= 0 ? decoded.slice(separator + 1) : decoded
  if (!token) throw new Error('Authenticated checkout header did not contain a token')
  return token
}

function changedPaths() {
  const output = runGit(['status', '--porcelain=v1', '-z'])
  if (!output) return []

  const entries = output.split('\0').filter(Boolean)
  const paths = []
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const status = entry.slice(0, 2)
    let filePath = entry.slice(3)
    if (status.includes('R') || status.includes('C')) {
      index += 1
      filePath = entries[index]
    }
    paths.push(filePath)
  }
  return paths
}

async function commitAppliedDataWithGitApi() {
  if (process.env.GITHUB_ACTIONS !== 'true') return
  if (process.env.GITHUB_WORKFLOW !== 'Apply Approved Citicoline Patch') return

  const paths = changedPaths()
  if (paths.length === 0) return

  const allowedExact = new Set([
    'data-sources/herb_monograph_master.xlsx',
    'data-sources/workbook-patches/citicoline-scite-pilot.json',
  ])
  const unexpected = paths.filter((filePath) => !allowedExact.has(filePath) && !filePath.startsWith('public/data/'))
  if (unexpected.length > 0) {
    throw new Error(`Refusing Git data commit with unexpected path(s):\n- ${unexpected.join('\n- ')}`)
  }

  const repository = process.env.GITHUB_REPOSITORY
  const branch = process.env.GITHUB_HEAD_REF || runGit(['branch', '--show-current'])
  const parentSha = runGit(['rev-parse', 'HEAD'])
  if (!repository || !branch) throw new Error('Missing GitHub repository or branch context')

  const token = getCheckoutToken()
  const apiRoot = `https://api.github.com/repos/${repository}`
  async function githubApi(endpoint, { method = 'GET', body } = {}) {
    const response = await fetch(`${apiRoot}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await response.text()
    if (!response.ok) {
      throw new Error(`GitHub API ${method} ${endpoint} failed (${response.status}): ${text.slice(0, 1000)}`)
    }
    return text ? JSON.parse(text) : null
  }

  const parent = await githubApi(`/git/commits/${parentSha}`)
  const tree = []
  for (const filePath of paths) {
    const absolutePath = path.join(repoRoot, filePath)
    const content = fs.readFileSync(absolutePath).toString('base64')
    const blob = await githubApi('/git/blobs', {
      method: 'POST',
      body: { content, encoding: 'base64' },
    })
    tree.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha })
    console.log(`[validate-workbook-patches] Uploaded Git blob: ${filePath}`)
  }

  const newTree = await githubApi('/git/trees', {
    method: 'POST',
    body: { base_tree: parent.tree.sha, tree },
  })
  const commit = await githubApi('/git/commits', {
    method: 'POST',
    body: {
      message: 'data: apply approved Citicoline evidence patch',
      tree: newTree.sha,
      parents: [parentSha],
    },
  })
  const encodedBranch = branch.split('/').map(encodeURIComponent).join('/')
  await githubApi(`/git/refs/heads/${encodedBranch}`, {
    method: 'PATCH',
    body: { sha: commit.sha, force: false },
  })

  runGit(['fetch', 'origin', branch])
  runGit(['reset', '--hard', commit.sha])
  const sentinel = path.join(repoRoot, 'public/data/.citicoline-commit-sentinel')
  fs.mkdirSync(path.dirname(sentinel), { recursive: true })
  fs.writeFileSync(sentinel, 'Remove after the one-time Citicoline application workflow.\n', 'utf8')
  console.log(`[validate-workbook-patches] Committed ${paths.length} applied data path(s) through GitHub Git data API: ${commit.sha}`)
}

async function commitAppliedDataWithDiagnostic() {
  try {
    await commitAppliedDataWithGitApi()
  } catch (error) {
    const branch = process.env.GITHUB_HEAD_REF || runGit(['branch', '--show-current'])
    const diagnosticPath = 'public/data/git-api-commit-error.txt'
    fs.writeFileSync(path.join(repoRoot, diagnosticPath), `${error.stack || error.message}\n`, 'utf8')
    runGit(['add', diagnosticPath])
    runGit(['commit', '-m', 'chore: capture Git data commit failure'])
    runGit(['push', 'origin', `HEAD:${branch}`])
    throw error
  }
}

const failures = []
for (const name of patchFiles) {
  const patchPath = path.join(patchDir, name)
  const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'))
  const result = runPatchCheck(patchPath)

  if (result.status !== 0) {
    failures.push({ name, output: resultOutput(result) })
    continue
  }

  if (patch.status === 'applied') {
    const verificationPatch = {
      ...patch,
      status: 'proposal',
      id: `${patch.id}-applied-value-verification`,
      changes: patch.changes.map((change) => ({
        ...change,
        expected_old_value: change.new_value,
      })),
    }
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workbook-patch-verify-'))
    const tempPatch = path.join(tempDir, name)
    try {
      fs.writeFileSync(tempPatch, `${JSON.stringify(verificationPatch, null, 2)}\n`, 'utf8')
      const appliedResult = runPatchCheck(tempPatch)
      if (appliedResult.status !== 0) {
        failures.push({
          name,
          output: `Applied patch record does not match the workbook's current values.\n${resultOutput(appliedResult)}`,
        })
        continue
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  }

  console.log(`[validate-workbook-patches] PASS: ${name}`)
}

if (failures.length > 0) {
  console.error(`[validate-workbook-patches] FAIL: ${failures.length} invalid or stale patch(es).`)
  for (const failure of failures) {
    console.error(`\n--- ${failure.name} ---\n${failure.output}`)
  }
  process.exit(1)
}

console.log(`[validate-workbook-patches] PASS: validated ${patchFiles.length} patch record(s) against the current workbook.`)
await commitAppliedDataWithDiagnostic()
