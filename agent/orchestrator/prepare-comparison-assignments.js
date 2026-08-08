#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const DEFAULT_QUEUE = path.join(repoRoot, 'reports', 'related-botanicals', 'comparison-agent-work-queue.json')
const EXECUTABLE_ACTIONS = new Set(['build-next', 'research-first', 'validate-and-outline'])

function parseArgs(argv = process.argv.slice(2)) {
  const value = (name) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  const action = value('action') || 'all'
  const packetId = value('packet') || null
  const queuePath = value('queue') ? path.resolve(repoRoot, value('queue')) : DEFAULT_QUEUE
  const requestedLimit = Number(value('limit'))
  const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 10

  if (action !== 'all' && !EXECUTABLE_ACTIONS.has(action)) {
    throw new Error(`Unsupported executable action: ${action}. Allowed: all, ${[...EXECUTABLE_ACTIONS].join(', ')}`)
  }

  return { action, packetId, queuePath, limit }
}

function readQueue(queuePath) {
  if (!fs.existsSync(queuePath)) {
    throw new Error(`Comparison work queue not found: ${queuePath}. Generate it with scripts/rank-related-comparisons.ts first.`)
  }

  const parsed = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
  const packets = Array.isArray(parsed) ? parsed : parsed.packets ?? parsed.assignments ?? []
  if (!Array.isArray(packets)) throw new Error('Comparison work queue must contain a packets array.')
  return packets
}

function priorityRank(action) {
  if (action === 'build-next') return 3
  if (action === 'research-first') return 2
  if (action === 'validate-and-outline') return 1
  return 0
}

export function selectComparisonAssignments(packets, { action = 'all', packetId = null, limit = 10 } = {}) {
  return packets
    .filter((packet) => EXECUTABLE_ACTIONS.has(packet?.recommendedAction))
    .filter((packet) => action === 'all' || packet.recommendedAction === action)
    .filter((packet) => !packetId || packet.packetId === packetId)
    .sort((a, b) =>
      priorityRank(b.recommendedAction) - priorityRank(a.recommendedAction)
      || Number(b.priorityScore || 0) - Number(a.priorityScore || 0)
      || String(a.packetId || '').localeCompare(String(b.packetId || '')))
    .slice(0, limit)
    .map((packet, index) => ({
      assignmentId: `comparison-assignment:${index + 1}:${packet.packetId}`,
      sourcePacketId: packet.packetId,
      action: packet.recommendedAction,
      status: 'ready-for-agent',
      title: packet.title,
      proposedSlug: packet.proposedSlug,
      instruction: packet.nextTask,
      rationale: packet.actionReason,
      researchGaps: packet.researchGaps ?? [],
      completionCriteria: packet.completionCriteria ?? [],
      guardrails: [
        'Do not publish automatically.',
        'Do not promote an assignment beyond its evidence-gated action without regenerating the queue.',
        'Use canonical repository evidence/data sources for factual claims.',
        'Return reviewable repository changes or research artifacts for human/CI review.',
      ],
      evidence: {
        tier: packet.evidenceTier,
        label: packet.evidenceLabel,
        chemistrySupported: Boolean(packet.chemistrySupported),
      },
      demand: {
        tier: packet.demandTier,
        observedBehaviorScore: Number(packet.observedBehaviorScore || 0),
        observedBehavior: packet.observedBehavior ?? {},
      },
      scores: {
        priority: Number(packet.priorityScore || 0),
        scientific: Number(packet.scientificPriorityScore || 0),
        editorialIntent: Number(packet.editorialIntentScore || 0),
      },
      entities: {
        aSlug: packet.aSlug,
        bSlug: packet.bSlug,
      },
    }))
}

function main() {
  const options = parseArgs()
  const packets = readQueue(options.queuePath)
  const assignments = selectComparisonAssignments(packets, options)

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceQueue: path.relative(repoRoot, options.queuePath),
    filters: {
      action: options.action,
      packetId: options.packetId,
      limit: options.limit,
    },
    assignmentCount: assignments.length,
    assignments,
  }

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  try {
    main()
  } catch (error) {
    console.error(`[comparison-assignments] ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}
