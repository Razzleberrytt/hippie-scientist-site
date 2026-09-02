import process from 'node:process'
import { pathToFileURL } from 'node:url'

export function assessMainProtection(branch) {
  if (!branch || typeof branch !== 'object') {
    throw new Error('GitHub branch response is missing or invalid')
  }

  if (branch.name !== 'main') {
    throw new Error(`Expected main branch metadata, received ${String(branch.name)}`)
  }

  return {
    branch: branch.name,
    protected: branch.protected === true,
    protectionEnabled: branch.protection?.enabled === true,
  }
}

export async function auditMainProtection({ repository, token = '', fetchImpl = fetch } = {}) {
  if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) {
    throw new Error('repository must be supplied as owner/name')
  }

  const response = await fetchImpl(`https://api.github.com/repos/${repository}/branches/main`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub branch protection probe failed with HTTP ${response.status}`)
  }

  const result = assessMainProtection(await response.json())
  if (!result.protected) {
    throw new Error(
      'main is not protected. Ordinary direct pushes can invalidate exact-head proof and fan out CI. See #4556.',
    )
  }

  return result
}

async function main() {
  const result = await auditMainProtection({
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  })

  const line = `main protection: protected=${result.protected} protection.enabled=${result.protectionEnabled}`
  console.log(line)
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs/promises')
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `## Main branch protection\n\n${line}\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`::error title=Main protection audit failed::${error.message}`)
    process.exitCode = 1
  })
}
