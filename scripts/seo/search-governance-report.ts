#!/usr/bin/env -S npx tsx

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  buildSearchGovernanceArtifact,
  renderSearchGovernanceMarkdown,
  type QueryIntentMap,
  type SearchOpportunityReport,
} from '../../src/lib/search-opportunity-governance'
import type { MetadataExperiment } from '../../src/lib/search-intent-routing'

function arg(name: string, fallback = ''): string {
  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) || fallback
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  if (!filePath) return fallback
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback
    throw error
  }
}

async function writeText(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

async function main(): Promise<void> {
  const currentPath = path.resolve(arg('input', 'ops/reports/search-opportunities.json'))
  const previousArg = arg('previous')
  const previousPath = previousArg ? path.resolve(previousArg) : ''
  const intentMapPath = path.resolve(arg('intent-map', 'data-sources/search-console/query-intent-map.json'))
  const experimentsPath = path.resolve(arg('experiments', 'ops/metadata-experiments.json'))
  const jsonPath = path.resolve(arg('out', 'ops/reports/search-governance.json'))
  const markdownPath = path.resolve(arg('markdown', 'ops/reports/search-governance.md'))

  const current = await readJson<SearchOpportunityReport>(currentPath, { pages: [], queries: [] })
  if (!Array.isArray(current.pages) || !Array.isArray(current.queries)) {
    throw new Error('Search opportunity input must contain `pages` and `queries` arrays. Run the existing Search Console opportunity engine first.')
  }

  const [previous, intentMap, experiments] = await Promise.all([
    readJson<SearchOpportunityReport | undefined>(previousPath, undefined),
    readJson<QueryIntentMap>(intentMapPath, {}),
    readJson<MetadataExperiment[]>(experimentsPath, []),
  ])

  const report = buildSearchGovernanceArtifact({ current, previous, intentMap, experiments })

  await Promise.all([
    writeText(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
    writeText(markdownPath, renderSearchGovernanceMarkdown(report)),
  ])

  console.log(`Search governance: ${report.summary.queryCount} queries.`)
  console.log(`Cannibalized: ${report.summary.cannibalizedQueries}; routing mismatches: ${report.summary.routingMismatches}.`)
  console.log(`CTR rewrites eligible: ${report.summary.metadataRewriteEligible}; protected metadata: ${report.summary.metadataProtected}.`)
  console.log(`Wrote ${path.relative(process.cwd(), jsonPath)} and ${path.relative(process.cwd(), markdownPath)}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
