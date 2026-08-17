import { masterBacklog as backlog } from '../../ops/backlog/master-backlog.mjs'
import { activeClaims } from '../../ops/backlog/active-claims.mjs'

const failures = []
const allowedPriorities = new Set(['critical', 'high', 'medium', 'low'])
const allowedStatuses = new Set([
  'backlog',
  'verify_existing',
  'ready',
  'in_progress',
  'blocked',
  'qa',
  'merged_observing',
  'complete',
])
const activeStatuses = new Set(['in_progress', 'qa'])
const completionVerification = new Set(['merge', 'measure'])
const canonicalTicketIdPattern = /^THS-\d{3}$/
const externalTicketLikeRefPattern = /^THS-\d{4,}$/

function fail(message) {
  failures.push(message)
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

if (!Array.isArray(backlog.tickets)) fail('tickets must be an array')
const tickets = Array.isArray(backlog.tickets) ? backlog.tickets : []

if (tickets.length < 300) fail(`master backlog must contain at least 300 tickets; found ${tickets.length}`)
if (backlog.ticket_count !== tickets.length) fail(`ticket_count=${backlog.ticket_count} does not match actual count=${tickets.length}`)
if (!Array.isArray(backlog.completion_gate) || backlog.completion_gate.length < 6) {
  fail('completion_gate must explicitly cover implementation, tests, QA, regressions, merge, and measurement')
}

const byId = new Map()
for (const ticket of tickets) {
  if (!canonicalTicketIdPattern.test(ticket.id || '')) {
    fail(`invalid canonical ticket id: ${ticket.id}; master backlog IDs must use THS-001 through THS-999 format`)
  }
  if (byId.has(ticket.id)) fail(`duplicate ticket id: ${ticket.id}`)
  byId.set(ticket.id, ticket)

  if (!Number.isInteger(ticket.rank) || ticket.rank < 1) fail(`${ticket.id}: rank must be a positive integer`)
  if (!allowedPriorities.has(ticket.priority)) fail(`${ticket.id}: invalid priority ${ticket.priority}`)
  if (!allowedStatuses.has(ticket.status)) fail(`${ticket.id}: invalid status ${ticket.status}`)
  for (const field of ['area', 'task', 'why', 'done_when']) {
    if (!nonEmptyString(ticket[field])) fail(`${ticket.id}: missing ${field}`)
  }
  if (!Array.isArray(ticket.dependencies)) fail(`${ticket.id}: dependencies must be an array`)
  if (!Array.isArray(ticket.affected_routes) || ticket.affected_routes.length === 0) {
    fail(`${ticket.id}: affected_routes must contain at least one scope`)
  }
  if (!Array.isArray(ticket.verification) || ticket.verification.length === 0) {
    fail(`${ticket.id}: verification must contain at least one gate`)
  } else {
    for (const required of completionVerification) {
      if (!ticket.verification.includes(required)) fail(`${ticket.id}: verification must include ${required}`)
    }
  }
  if (!Array.isArray(ticket.work_refs)) {
    fail(`${ticket.id}: work_refs must be an array`)
  } else {
    for (const workRef of ticket.work_refs) {
      if (typeof workRef === 'string' && externalTicketLikeRefPattern.test(workRef)) {
        fail(`${ticket.id}: external ticket-like work ref ${workRef} must be namespaced, for example external:${workRef}`)
      }
    }
  }

  if (['verify_existing', 'in_progress', 'qa'].includes(ticket.status) && ticket.work_refs.length === 0) {
    fail(`${ticket.id}: ${ticket.status} requires at least one work reference`)
  }
  if (ticket.status === 'blocked' && !nonEmptyString(ticket.blocker)) {
    fail(`${ticket.id}: blocked tickets require a blocker description`)
  }
  if (ticket.status === 'merged_observing') {
    if (!ticket.completion_evidence?.merged_pr || !ticket.completion_evidence?.merged_commit) {
      fail(`${ticket.id}: merged_observing requires merged PR and commit evidence`)
    }
  }
  if (ticket.status === 'complete') {
    const evidence = ticket.completion_evidence || {}
    if (!Array.isArray(evidence.automated_tests) || evidence.automated_tests.length === 0) {
      fail(`${ticket.id}: complete requires automated test evidence`)
    }
    if (!Array.isArray(evidence.visual_qa) || evidence.visual_qa.length === 0) {
      fail(`${ticket.id}: complete requires visual/behavior QA evidence`)
    }
    if (!evidence.merged_pr || !evidence.merged_commit) {
      fail(`${ticket.id}: complete requires merged PR and commit evidence`)
    }
    if (!nonEmptyString(evidence.measurement)) {
      fail(`${ticket.id}: complete requires a post-merge measurement note`)
    }
  }
}

for (const ticket of tickets) {
  const claim = activeClaims[ticket.id]
  if (activeStatuses.has(ticket.status)) {
    if (!claim) {
      fail(`${ticket.id}: ${ticket.status} requires an active agent claim`)
      continue
    }
    if (!nonEmptyString(claim.agent)) fail(`${ticket.id}: active claim requires agent`)
    if (!nonEmptyString(claim.claimed_at) || Number.isNaN(Date.parse(claim.claimed_at))) {
      fail(`${ticket.id}: active claim requires a parseable claimed_at timestamp`)
    }
    if (!nonEmptyString(claim.branch)) fail(`${ticket.id}: active claim requires branch`)
    if (!nonEmptyString(claim.scope)) fail(`${ticket.id}: active claim requires scope`)
    if (!Array.isArray(claim.work_refs) || claim.work_refs.length === 0) {
      fail(`${ticket.id}: active claim requires work_refs`)
    } else {
      for (const workRef of claim.work_refs) {
        if (typeof workRef === 'string' && externalTicketLikeRefPattern.test(workRef)) {
          fail(`${ticket.id}: active-claim external ticket-like work ref ${workRef} must be namespaced, for example external:${workRef}`)
        }
      }
    }
  } else if (claim) {
    fail(`${ticket.id}: active claim exists while ticket status is ${ticket.status}`)
  }
}

for (const claimedId of Object.keys(activeClaims)) {
  if (!canonicalTicketIdPattern.test(claimedId)) {
    fail(`active claim uses non-canonical master ticket id ${claimedId}`)
  }
  if (!byId.has(claimedId)) fail(`active claim references unknown ticket ${claimedId}`)
}

const sortedRanks = [...tickets].sort((a, b) => a.rank - b.rank)
for (let index = 0; index < sortedRanks.length; index += 1) {
  const expectedRank = index + 1
  const ticket = sortedRanks[index]
  if (ticket.rank !== expectedRank) fail(`rank sequence gap: expected ${expectedRank}, found ${ticket.rank} on ${ticket.id}`)
  const expectedId = `THS-${String(expectedRank).padStart(3, '0')}`
  if (ticket.id !== expectedId) fail(`rank/id mismatch: rank ${expectedRank} must be ${expectedId}, found ${ticket.id}`)
}

for (const ticket of tickets) {
  for (const dependency of ticket.dependencies || []) {
    if (!byId.has(dependency)) fail(`${ticket.id}: unknown dependency ${dependency}`)
    if (dependency === ticket.id) fail(`${ticket.id}: cannot depend on itself`)
  }
}

const visiting = new Set()
const visited = new Set()
function visit(id, pathStack = []) {
  if (visited.has(id)) return
  if (visiting.has(id)) {
    fail(`dependency cycle detected: ${[...pathStack, id].join(' -> ')}`)
    return
  }
  visiting.add(id)
  const ticket = byId.get(id)
  for (const dependency of ticket?.dependencies || []) visit(dependency, [...pathStack, id])
  visiting.delete(id)
  visited.add(id)
}
for (const id of byId.keys()) visit(id)

for (let index = 1; index <= 15; index += 1) {
  const id = `THS-${String(index).padStart(3, '0')}`
  if (!byId.has(id)) fail(`missing original seed ticket ${id}`)
}

if (failures.length) {
  console.error(`Master backlog integrity failed with ${failures.length} problem(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

const counts = tickets.reduce((acc, ticket) => {
  acc[ticket.status] = (acc[ticket.status] || 0) + 1
  return acc
}, {})

console.log(`Master backlog valid: ${tickets.length} tickets.`)
console.log(`Active claims: ${Object.keys(activeClaims).length}`)
console.log(`Status counts: ${JSON.stringify(counts)}`)
