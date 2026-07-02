import crypto from 'node:crypto'

import { createOpenAIClient } from './lib/openai-client.js'
import { runAgentQueue } from './lib/queue.js'
import { writePatch } from './lib/patch-store.js'
import { logError, logInfo, logSkip } from './lib/logger.js'
import { pickCompound } from './lib/compound-picker.js'

import { runDiscoveryAgent } from './agents/discovery-agent.js'
import { runValidationAgent } from './agents/validation-agent.js'
import { runClaimExtractionAgent } from './agents/claim-extraction-agent.js'

async function main() {
  const client = createOpenAIClient()

  if (!client) {
    logSkip('OPENAI_API_KEY missing; skipping agent run safely')
    process.exit(0)
  }

  const slug = pickCompound()

  const tasks = [
    async () => {
      const evidenceRows = await runDiscoveryAgent({ client, slug })

      const validation = runValidationAgent(evidenceRows)

      const claims = await runClaimExtractionAgent({
        client,
        slug,
        evidenceRows: validation.approved_rows,
      })

      const patch = {
        patch_id: crypto.randomUUID(),
        schema_version: '1.0',
        source_agent: 'phase-1-5-pipeline',
        agent_version: '1.5',
        created_at: new Date().toISOString(),
        slug,
        patch_type: 'evidence',
        evidence: validation.approved_rows,
        claims,
        validation: {
          validation_status: validation.validation_status,
          rejection_reasons: validation.rejection_reasons,
        },
      }

      const file = writePatch({
        slug,
        sourceAgent: 'pipeline',
        patchId: patch.patch_id,
        data: patch,
      })

      logInfo('patch written', {
        slug,
        file,
        evidence_rows: validation.approved_rows.length,
        claims: claims.length,
      })

      return patch
    },
  ]

  const results = await runAgentQueue(tasks)

  logInfo('agent queue complete', {
    completed: results.length,
  })
}

main().catch(error => {
  logError('agent run failed', error)
  process.exit(0)
})
