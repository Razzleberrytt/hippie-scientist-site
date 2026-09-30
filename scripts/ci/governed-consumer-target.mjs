import { pathToFileURL } from 'node:url'

async function github(path, options = {}) {
  if (!process.env.GH_TOKEN) throw new Error('Missing GH_TOKEN')
  const response = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (!response.ok) {
    const payload = await response.json()
    throw Object.assign(new Error(payload.message || `GitHub HTTP ${response.status}`), { status: response.status })
  }
  return response.status === 204 ? null : response.json()
}

export async function consumerTargetStatus({ repo, sourceSha, headRef, prNumber }, request = github) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '') || !/^[a-f\d]{40}$/i.test(sourceSha || '') || !headRef) {
    throw new Error('Invalid consumer target context')
  }
  if (prNumber) {
    if (!/^[1-9]\d*$/.test(String(prNumber))) throw new Error('Invalid PR number')
    const pr = await request(`/repos/${repo}/pulls/${prNumber}`)
    if (pr?.state === 'closed') return 'obsolete'
    if (pr?.state !== 'open' || !/^[a-f\d]{40}$/i.test(pr.head?.sha || '') || pr.head?.repo?.full_name !== repo || !pr.head?.ref) {
      throw new Error('Cannot establish current same-repository PR target')
    }
    return pr.head.sha === sourceSha && pr.head.ref === headRef ? 'current' : 'obsolete'
  }
  const branch = await request(`/repos/${repo}/branches/${encodeURIComponent(headRef)}`)
  if (!/^[a-f\d]{40}$/i.test(branch?.commit?.sha || '')) throw new Error('Cannot establish current branch target')
  return branch.commit.sha === sourceSha ? 'current' : 'obsolete'
}

export async function dispatchCurrentConsumer(context, { workflow, payload }, request = github) {
  if (await consumerTargetStatus(context, request) === 'obsolete') return 'obsolete'
  if (!/^[\w-]+\.yml$/.test(workflow || '') || payload?.ref !== context.headRef || payload?.inputs?.producer_sha !== context.sourceSha) {
    throw new Error('Consumer dispatch does not match producer context')
  }
  try {
    await request(`/repos/${context.repo}/actions/workflows/${workflow}/dispatches`, { method: 'POST', body: payload })
  } catch (error) {
    // Only the observed deleted-ref race may become a clean obsolete stop.
    // Authentication, service and other dispatch failures must stay nonzero.
    if (error.status === 422 && /^No ref found for:/i.test(error.message) && await consumerTargetStatus(context, request) === 'obsolete') {
      return 'obsolete'
    }
    throw error
  }
  return 'current'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const context = { repo: process.env.GITHUB_REPOSITORY, sourceSha: process.env.SOURCE_SHA, headRef: process.env.HEAD_REF, prNumber: process.env.PR_NUMBER }
  const operation = process.argv[2] === 'dispatch'
    ? dispatchCurrentConsumer(context, { workflow: process.env.WORKFLOW, payload: JSON.parse(process.env.DISPATCH_PAYLOAD || '{}') })
    : consumerTargetStatus(context)
  operation.then((status) => console.log(status)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
