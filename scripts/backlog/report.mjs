import { masterBacklog } from '../../ops/backlog/master-backlog.mjs'

const tickets = masterBacklog.tickets || []
const priorityOrder = ['critical', 'high', 'medium', 'low']
const activeStatuses = new Set(['in_progress', 'qa', 'merged_observing'])

function countBy(key) {
  return tickets.reduce((acc, ticket) => {
    const value = ticket[key] || 'unknown'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function pct(value, total) {
  return total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%'
}

const byStatus = countBy('status')
const byPriority = countBy('priority')
const byArea = countBy('area')
const complete = byStatus.complete || 0
const active = tickets.filter((ticket) => activeStatuses.has(ticket.status)).length
const blocked = byStatus.blocked || 0
const verifyExisting = byStatus.verify_existing || 0

const rows = Object.entries(byArea)
  .map(([area, count]) => {
    const areaTickets = tickets.filter((ticket) => ticket.area === area)
    const areaComplete = areaTickets.filter((ticket) => ticket.status === 'complete').length
    const areaActive = areaTickets.filter((ticket) => activeStatuses.has(ticket.status)).length
    const areaBlocked = areaTickets.filter((ticket) => ticket.status === 'blocked').length
    const topOpen = areaTickets
      .filter((ticket) => ticket.status !== 'complete')
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority) || a.rank - b.rank)[0]

    return {
      area,
      count,
      complete: areaComplete,
      active: areaActive,
      blocked: areaBlocked,
      topOpen: topOpen ? `${topOpen.id} ${topOpen.task}` : '—',
    }
  })
  .sort((a, b) => b.active - a.active || b.count - a.count || a.area.localeCompare(b.area))

console.log('# The Hippie Scientist — Backlog Status')
console.log('')
console.log(`Total tickets: ${tickets.length}`)
console.log(`Complete: ${complete} (${pct(complete, tickets.length)})`)
console.log(`Active: ${active}`)
console.log(`Blocked: ${blocked}`)
console.log(`Verify existing: ${verifyExisting}`)
console.log('')
console.log('## Priority distribution')
console.log('')
for (const priority of priorityOrder) {
  console.log(`- ${priority}: ${byPriority[priority] || 0}`)
}
console.log('')
console.log('## Status distribution')
console.log('')
for (const [status, count] of Object.entries(byStatus).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`- ${status}: ${count}`)
}
console.log('')
console.log('## Workstreams')
console.log('')
console.log('| Area | Tickets | Complete | Active | Blocked | Highest-priority open ticket |')
console.log('|---|---:|---:|---:|---:|---|')
for (const row of rows) {
  console.log(`| ${row.area.replaceAll('|', '\\|')} | ${row.count} | ${row.complete} | ${row.active} | ${row.blocked} | ${row.topOpen.replaceAll('|', '\\|')} |`)
}
console.log('')
console.log('## Active work')
console.log('')
const activeTickets = tickets
  .filter((ticket) => activeStatuses.has(ticket.status))
  .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority) || a.rank - b.rank)

if (!activeTickets.length) {
  console.log('- None')
} else {
  for (const ticket of activeTickets) {
    console.log(`- ${ticket.id} [${ticket.priority}] ${ticket.task} — ${ticket.status}; refs: ${ticket.work_refs.join(', ') || 'none'}`)
  }
}
