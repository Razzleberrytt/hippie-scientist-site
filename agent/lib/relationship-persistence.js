import fs from 'node:fs'
import path from 'node:path'

const graphPath = path.join(process.cwd(), 'ops', 'agent-review', 'relationship-graph.json')

export function persistRelationshipGraph(graph = {}) {
  fs.mkdirSync(path.dirname(graphPath), { recursive: true })

  const payload = {
    generated_at: new Date().toISOString(),
    graph,
  }

  fs.writeFileSync(graphPath, JSON.stringify(payload, null, 2))

  return payload
}
