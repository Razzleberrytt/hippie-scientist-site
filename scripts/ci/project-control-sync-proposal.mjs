import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import {
  CONTROL_PATHS,
  parseControlDocument,
  requiredReferences,
  collectGitHubState,
} from './reconcile-project-control.mjs'

const identity = (ticket) => `${ticket.id}:${[...new Set(ticket.refs || [])].sort((a, b) => a - b).join(',')}`

function recordIsClosed(record) {
  if (!record) return false
  return record.state === 'closed' || record.merged === true
}

function ticketClosed(ticket, snapshot) {
  return (ticket.refs || []).some((ref) => recordIsClosed(snapshot.records?.[ref]))
}

function sectionMap(document, section) {
  return new Map((document[section] || []).map((ticket) => [identity(ticket), ticket]))
}

export function buildSyncProposal({ documents, snapshot, repository, revision }) {
  const [sprint, backlog] = documents
  const exactSnapshot = snapshot?.available === true && snapshot.version === 1 &&
    snapshot.repository === repository && snapshot.revision === revision

  if (!exactSnapshot) {
    return {
      version: 1,
      state: 'UNKNOWN',
      repository,
      revision,
      admission: 'unchanged',
      actions: [],
      reason: 'Complete GitHub evidence bound to the exact repository revision is required before proposing control edits.',
    }
  }

  const actions = []
  for (const document of [sprint, backlog]) {
    for (const section of ['active', 'ready']) {
      for (const ticket of document[section] || []) {
        if (!ticketClosed(ticket, snapshot)) continue
        const closedRefs = (ticket.refs || []).filter((ref) => recordIsClosed(snapshot.records?.[ref]))
        actions.push({
          type: 'retire',
          document: document.path,
          section,
          ticket: ticket.id,
          refs: ticket.refs || [],
          closedRefs,
          reason: `GitHub reports ${closedRefs.map((ref) => `#${ref}`).join(', ')} closed or merged at exact revision ${revision}.`,
        })
      }
    }
  }

  for (const section of ['active', 'ready']) {
    const sprintItems = sectionMap(sprint, section)
    const backlogItems = sectionMap(backlog, section)
    for (const [key, ticket] of sprintItems) {
      if (backlogItems.has(key) || ticketClosed(ticket, snapshot)) continue
      actions.push({
        type: 'align-parity',
        document: backlog.path,
        sourceDocument: sprint.path,
        section,
        ticket: ticket.id,
        refs: ticket.refs || [],
        operation: 'add-equivalent-entry',
        reason: `Ticket is present in ${sprint.path} but missing from ${backlog.path}.`,
      })
    }
    for (const [key, ticket] of backlogItems) {
      if (sprintItems.has(key) || ticketClosed(ticket, snapshot)) continue
      actions.push({
        type: 'align-parity',
        document: backlog.path,
        sourceDocument: sprint.path,
        section,
        ticket: ticket.id,
        refs: ticket.refs || [],
        operation: 'remove-or-reconcile-extra-entry',
        reason: `Ticket is present in ${backlog.path} but not in authoritative ${sprint.path}.`,
      })
    }
  }

  return {
    version: 1,
    state: actions.length ? 'PROPOSAL' : 'SYNCED',
    repository,
    revision,
    admission: 'unchanged',
    actions,
    guardrails: {
      autoAdmission: false,
      wipCapBypass: false,
      dependencyRewrite: false,
      laneOwnershipRewrite: false,
      scientificMutation: false,
    },
  }
}

export async function main() {
  const repository = process.env.GITHUB_REPOSITORY
  const revision = process.env.GITHUB_SHA
  const documents = CONTROL_PATHS.map((path) => parseControlDocument(path, readFileSync(path, 'utf8')))
  const snapshot = await collectGitHubState({
    repository,
    revision,
    refs: requiredReferences(documents),
    token: process.env.GITHUB_TOKEN,
  })
  const proposal = buildSyncProposal({ documents, snapshot, repository, revision })
  console.log(JSON.stringify(proposal, null, 2))
  if (proposal.state === 'UNKNOWN') process.exitCode = 2
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) main().catch((error) => {
  console.error(error?.stack || error)
  process.exitCode = 1
})
