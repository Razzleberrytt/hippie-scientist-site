#!/usr/bin/env -S npx tsx

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  buildForecastReportArtifact,
  renderForecastReportMarkdown,
  type ForecastReportInput,
} from '../../src/lib/forecasting-reporting'

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) || fallback
}

async function readInput(filePath: string): Promise<ForecastReportInput> {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as ForecastReportInput
  if (!parsed || !Array.isArray(parsed.current)) {
    throw new Error('Forecast input must be a JSON object with a `current` cluster-metrics array.')
  }
  return parsed
}

async function writeText(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
}

async function main(): Promise<void> {
  const inputPath = path.resolve(arg('input', 'data-sources/ops/content-cluster-metrics.json'))
  const jsonPath = path.resolve(arg('out', 'ops/reports/content-cluster-forecast.json'))
  const markdownPath = path.resolve(arg('markdown', 'ops/reports/content-cluster-forecast.md'))

  const input = await readInput(inputPath)
  const report = buildForecastReportArtifact(input)

  await Promise.all([
    writeText(jsonPath, `${JSON.stringify(report, null, 2)}\n`),
    writeText(markdownPath, renderForecastReportMarkdown(report)),
  ])

  console.log(`Forecast dashboard: ${report.dashboard.clusters.length} content clusters.`)
  console.log(`Backlog tasks scored for impact/effort: ${report.backlog.length}.`)
  if (report.scoreWarnings.length) {
    console.warn(`Incomplete task scores: ${report.scoreWarnings.length}.`)
  }
  console.log(`Wrote ${path.relative(process.cwd(), jsonPath)} and ${path.relative(process.cwd(), markdownPath)}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
