import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateGraphIntegrity } from '../lib/graph-integrity.ts'

const GRAPH_DIR = join(process.cwd(), 'public', 'data', 'graph')
const GRAPH_FILES = {
  nodes: 'nodes.json',
  relationships: 'relationships.json',
  topics: 'topics.json',
  pathways: 'pathways.json',
  comparisons: 'comparisons.json',
  stacks: 'stacks.json',
  supernodes: 'supernodes.json',
}

function loadJsonFile(fileName) {
  try {
    const content = readFileSync(join(GRAPH_DIR, fileName), 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.error(`Error loading/parsing ${fileName}:`, err.message)
    return []
  }
}

function runValidation() {
  console.log('Loading graph data files from public/data/graph/...')
  const graph = {
    nodes: loadJsonFile(GRAPH_FILES.nodes),
    relationships: loadJsonFile(GRAPH_FILES.relationships),
    topics: loadJsonFile(GRAPH_FILES.topics),
    pathways: loadJsonFile(GRAPH_FILES.pathways),
    comparisons: loadJsonFile(GRAPH_FILES.comparisons),
    stacks: loadJsonFile(GRAPH_FILES.stacks),
    supernodes: loadJsonFile(GRAPH_FILES.supernodes),
  }

  console.log('Running entity integrity checks...')
  const report = validateGraphIntegrity(graph)

  console.log('\n--- Graph Validation Report ---')
  console.log(`Nodes: ${report.stats.nodeCount}`)
  console.log(`Relationships: ${report.stats.relationshipCount}`)
  console.log(`Topics: ${report.stats.topicCount}`)
  console.log(`Pathways: ${report.stats.pathwayCount}`)
  console.log(`Comparisons: ${report.stats.comparisonCount}`)
  console.log(`Stacks: ${report.stats.stackCount}`)
  console.log(`Supernodes: ${report.stats.supernodeCount}`)

  if (report.warnings.length > 0) {
    console.log(`\nWarnings (${report.warnings.length}):`)
    report.warnings.forEach((warn) => {
      console.log(`- [${warn.code}] ${warn.message} (Entity: ${warn.entityId})`)
    })
  }

  if (!report.valid) {
    console.error(`\nValidation FAILED with ${report.errors.length} errors:`)
    report.errors.forEach((err) => {
      console.error(`- [${err.code}] ${err.message} (Entity: ${err.entityId})`)
    })
    process.exit(1)
  }

  console.log('\nValidation PASSED successfully with 0 errors.')
  process.exit(0)
}

runValidation()
