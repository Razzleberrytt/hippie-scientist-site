import fs from 'node:fs'
import path from 'node:path'

import { createOpenAIClient } from '../lib/openai-client.js'
import { createSchemaValidator } from '../lib/schema-validator.js'
import { writePatch } from '../lib/patch-store.js'
import { logError, logInfo, logWarn } from '../lib/logger.js'
import { pickCompound } from '../lib/compound-picker.js'

import { runDiscoveryAgent } from '../agents/discovery-agent.js'
import { runValidationAgent } from '../agents/validation-agent.js'
import { runScoringAgent } from '../agents/scoring-agent.js'
import { runEnrichmentAgent } from '../agents/enrichment-agent.js'
import { runAffiliateAgent } from '../agents/affiliate-agent.js'
import { runDedupeAgent } from '../agents/dedupe-agent.js'

const repoRoot = process.cwd()

function loadSchema(file) {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'agent', 'schemas', file), 'utf8')
  )
}

function basePatch(slug, sourceAgent, patchType) {
  return {
    patch_id: crypto.randomUUID(),
    schema_version: '1.0',
    source_agent: sourceAgent,
    agent_version: '1.0',
    created_at: new Date().toISOString(),
    slug,
    patch_type: patchType,
  }
}

async function main() {
  let client

  try {
    client = createOpenAIClient()
  } catch {
    logWarn('missing OPENAI_API_KEY, skipping orchestrator')
    process.exit(0)
  }

  const slug = pickCompound()

  let evidenceRows = []

  try {
    evidenceRows = await runDiscoveryAgent({ client, slug })
  } catch (error) {
    logError('discovery-agent failed', error)
  }

  const validation = runValidationAgent(evidenceRows)
  const dedupedEvidence = runDedupeAgent(validation.approved_rows || [])
  const score = runScoringAgent(dedupedEvidence)

  const evidencePatch = {
    ...basePatch(slug, 'discovery-agent', 'evidence'),
    evidence: dedupedEvidence,
    validation,
    scoring: score,
  }

  const validateEvidence = createSchemaValidator(loadSchema('evidence.schema.json'))

  if (validateEvidence(evidencePatch)) {
    writePatch({
      slug,
      sourceAgent: 'discovery-agent',
      patchId: evidencePatch.patch_id,
      data: evidencePatch,
    })

    logInfo('wrote evidence patch')
  } else {
    logWarn('evidence schema validation failed')
  }

  if (score.confidence_score >= 0.45) {
    try {
      const enrichmentPatch = {
        ...basePatch(slug, 'enrichment-agent', 'enrichment'),
        enrichment: runEnrichmentAgent(slug),
      }

      const validateEnrichment = createSchemaValidator(
        loadSchema('enrichment.schema.json')
      )

      if (validateEnrichment(enrichmentPatch)) {
        writePatch({
          slug,
          sourceAgent: 'enrichment-agent',
          patchId: enrichmentPatch.patch_id,
          data: enrichmentPatch,
        })
      }
    } catch (error) {
      logError('enrichment-agent failed', error)
    }

    try {
      const affiliatePatch = {
        ...basePatch(slug, 'affiliate-agent', 'affiliate'),
        affiliate: runAffiliateAgent(),
      }

      const validateAffiliate = createSchemaValidator(
        loadSchema('affiliate.schema.json')
      )

      if (validateAffiliate(affiliatePatch)) {
        writePatch({
          slug,
          sourceAgent: 'affiliate-agent',
          patchId: affiliatePatch.patch_id,
          data: affiliatePatch,
        })
      }
    } catch (error) {
      logError('affiliate-agent failed', error)
    }
  }
}

main().catch(error => {
  logError('orchestrator failed', error)
  process.exit(0)
})
