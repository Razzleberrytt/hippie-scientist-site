#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { buildSessionBootstrap } from './lib/session-bootstrap.mjs'

const ROOT = process.cwd()
const sessionId = String(process.argv[2] ?? '').trim().toUpperCase()
if (!sessionId) {
  console.error('Usage: session-bootstrap-cli.mjs <sessionId>')
  process.exitCode = 2
} else {
  const manifestPath = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  try {
    const report = buildSessionBootstrap({ root: ROOT, sessionId, manifest })
    const output = path.join(ROOT, 'artifacts', `enrichment-session-bootstrap-${sessionId.toLowerCase()}.json`)
    fs.mkdirSync(path.dirname(output), { recursive: true })
    fs.writeFileSync(output, `${JSON.stringify({ ...report, generatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8')

    console.log(JSON.stringify({
      sessionId: report.sessionId,
      workerId: report.workerId,
      shard: report.shard,
      shardCount: report.shardCount,
      ownedWorkpacks: report.ownedWorkpacks,
      stagedWorkpacks: report.stagedWorkpacks,
      remainingWorkpacks: report.remainingWorkpacks,
      next: report.next.map(item => ({ workpackId: item.workpackId, score: item.score, reasons: item.reasons })),
    }, null, 2))
    console.log(`bootstrap: ${path.relative(ROOT, output)}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
