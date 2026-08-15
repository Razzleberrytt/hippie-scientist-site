#!/usr/bin/env -S npx tsx

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  buildCompetitorGapArtifact,
  renderCompetitorGapMarkdown,
  type CompetitorCoverageDataset,
  type RouteManifestEntry,
} from '../../src/lib/competitor-gap-reporting'

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) || fallback
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

async function writeText(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

function validateDataset(dataset: CompetitorCoverageDataset): void {
  if (!dataset || !Array.isArray(dataset.topics)) {
    throw new Error('Competitor coverage input must be a JSON object with a `topics` array.')
  }

  const invalid = dataset.topics.find((row) => !row?.topic || !row?.publisher)
  if (invalid) {
    throw new Error('Every competitor topic observation must include both `topic` and `publisher`.')
  }
}

async function main(): Promise<void> {
  const routeManifestPath = path.resolve(
    arg('routes', 'public/data/runtime-manifests/route-manifest.json'),
  )
  const competitorInputPath = path.resolve(
    arg('input', 'data-sources/seo/competitor-topic-coverage.json'),
  )
  const jsonOutPath = path.resolve(
    arg('out', 'reports/seo/competitor-content-gap.json'),
  )
  const markdownOutPath = path.resolve(
    arg('markdown', 'reports/seo/competitor-content-gap.md'),
  )

  const [routes, competitorDataset] = await Promise.all([
    readJson<RouteManifestEntry[]>(routeManifestPath),
    readJson<CompetitorCoverageDataset>(competitorInputPath),
  ])
  validateDataset(competitorDataset)

  const report = buildCompetitorGapArtifact(routes, competitorDataset)
  const markdown = renderCompetitorGapMarkdown(report)

  await Promise.all([
    writeText(jsonOutPath, `${JSON.stringify(report, null, 2)}\n`),
    writeText(markdownOutPath, markdown),
  ])

  const missingCore = report.publisherCoverage.filter((row) => !row.present).map((row) => row.publisher)
  console.log(`Competitor gap report: ${report.decisionCounts.pursue} pursue, ${report.decisionCounts.protect} protect, ${report.decisionCounts['avoid-generic-head-term']} avoid generic.`)
  console.log(`Wrote ${path.relative(process.cwd(), jsonOutPath)} and ${path.relative(process.cwd(), markdownOutPath)}.`)
  if (missingCore.length) {
    console.warn(`Coverage warning: missing publisher observations for ${missingCore.join(', ')}.`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
