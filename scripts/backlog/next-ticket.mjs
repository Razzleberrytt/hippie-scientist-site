import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
function readArg(name, fallback = null) {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1] ?? fallback
}

const areaFilter = readArg('--area')
const limitRaw = Number(readArg('--limit', '1'))
const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 25) : 1
const backlog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ops/backlog/master-backlog.json'), 'utf8'))
const tickets = backlog.tickets || []
const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]))
const priorityWeight = { critical: 0, high: 1, medium: 2, low: 3 }
const selectableStatuses = new Set(['verify_existing', 'ready', 'backlog'])

function dependencyIsComplete(id) {
  return byId.get(id)?.status === 'complete'
}

const candidates = tickets
  .filter((ticket) => selectableStatuses.has(ticket.status))
  .filter((ticket) => !areaFilter || ticket.area.toLowerCase().includes(areaFilter.toLowerCase()))
  .map((ticket) => ({
    ...ticket,
    blocked_by: (ticket.dependencies || []).filter((dependency) => !dependencyIsComplete(dependency)),
  }))
  .filter((ticket) => ticket.blocked_by.length === 0)
  .sort((a, b) => {
    const priorityDelta = (priorityWeight[a.priority] ?? 99) - (priorityWeight[b.priority] ?? 99)
    return priorityDelta || a.rank - b.rank
  })
  .slice(0, limit)

if (candidates.length === 0) {
  console.log(JSON.stringify({ candidates: [], message: 'No unblocked tickets match the current filters.' }, null, 2))
  process.exit(0)
}

console.log(JSON.stringify({
  candidates: candidates.map((ticket) => ({
    id: ticket.id,
    rank: ticket.rank,
    priority: ticket.priority,
    area: ticket.area,
    task: ticket.task,
    status: ticket.status,
    dependencies: ticket.dependencies,
    verification: ticket.verification,
    work_refs: ticket.work_refs,
  })),
}, null, 2))
