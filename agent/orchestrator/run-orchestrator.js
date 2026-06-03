import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { createOpenAIClient } from '../lib/openai-client.js'
import { createSchemaValidator } from '../lib/schema-validator.js'
import { writePatch } from '../lib/patch-store.js'
import { logError, logInfo, logWarn } from '../lib/logger.js'
import { prioritizeCompounds } from '../lib/prioritization.js'
import { harvestMetadataBatch } from '../lib/metadata-harvester.js'

import { runValidationAgent } from '../agents/validation-agent.js'
import { runScoringAgent } from '../agents/scoring-agent.js'
import { runEnrichmentAgent } from '../agents/enrichment-agent.js'
import { runAffiliateAgent } from '../agents/affiliate-agent.js'
import { runDedupeAgent } from '../agents/dedupe-agent.js'

const repoRoot = process.cwd()

const MODE_CONFIG = {
  fast: {
    batch: 20,
    enrichment: false,
    depth: 'metadata_only',
  },
  standard: {
    batch: 5,
    enrichment: true,
    depth: 'lightweight_enrichment',
  },
  deep: {
    batch: 1,
    enrichment: true,
    depth: 'full_enrichment',
  },
}

function loadSchema(file) {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'agent', 'schemas', file), 'utf8')
  )
}

function loadCompounds() {
  try {
    const file = path.join(repoRoot, 'public', 'data', 'compounds.json')
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
}

function parseArgs() {
  const args = process.argv.slice(2)

  const modeArg = args.find(arg => arg.startsWith('--mode='))
  const batchArg = args.find(arg => arg.startsWith('--batch='))

  const mode = modeArg?.split('=')[1] || 'standard'

  const requestedBatch = Number(batchArg?.split('=')[1])

  const config = MODE_CONFIG[mode] || MODE_CONFIG.standard

  const batch = Math.min(
    50,
    Math.max(1, Number.isFinite(requestedBatch) ? requestedBatch : config.batch)
  )

  return {
    mode,
    batch,
    config,
  }
}

function basePatch(slug, sourceAgent, patchType, researchDepth) {
  return {
    patch_id: crypto.randomUUID(),
    schema_version: '2.0',
    source_agent: sourceAgent,
    agent_version: '2.0',
    created_at: new Date().toISOString(),
    slug,
    patch_type: patchType,
    research_depth: researchDepth,
    metadata_sources: [],
    confidence_notes: [],
    seo_assets: {},
    review_flags: [],
  }
}

function buildSeoAssets(slug) {
  return {
    faq_candidates: [
      `What is ${slug} used for?`,
      `Is ${slug} evidence-based?`,
    ],
    seo_topics: [
      `${slug} benefits`,
      `${slug} safety`,
      `${slug} evidence`,
    ],
    internal_link_targets: ['sleep', 'focus', 'recovery'],
    comparison_candidates: [`${slug} vs magnesium`],
    best_for: ['general wellness'],
    avoid_if: ['medication interactions'],
    product_quality_notes: ['Prefer reputable third-party tested brands'],
  }
}

function confidenceArbitration(validation, scoring) {
  const notes = []
  const flags = []

  if ((validation?.rejection_reasons || []).length > 0) {
    notes.push('Validation layer identified inconsistent or incomplete evidence.')
    flags.push('validation_conflicts')
  }

  if ((scoring?.confidence_score || 0) < 0.45) {
    notes.push('Evidence confidence downgraded due to weak or conflicting support.')
    flags.push('low_confidence')
  }

  return {
    notes,
    flags,
  }
}

async function main() {
  const { mode, batch, config } = parseArgs()

  logInfo(`orchestrator mode=${mode} batch=${batch}`)

  const compounds = loadCompounds()

  const prioritized = prioritizeCompounds(compounds)
    .slice(0, batch)
    .map(row => row.compound)

  const metadataResults = await harvestMetadataBatch({
    compounds: prioritized,
  })

  let client = null

  if (config.enrichment) {
    try {
      client = createOpenAIClient()
    } catch {
      logWarn('missing OPENAI_API_KEY, enrichment disabled')
    }
  }

  const validateEvidence = createSchemaValidator(loadSchema('evidence.schema.json'))

  for (const result of metadataResults) {
    try {
      const evidenceRows = [
        ...(result.pubmed?.pmids || []).map(pmid => ({
          pmid_or_source: pmid,
          study_type: 'unknown',
        })),
        ...(result.clinical_trials?.trial_ids || []).map(id => ({
          pmid_or_source: id,
          study_type: 'clinical_trial',
        })),
      ]

      const validation = runValidationAgent(evidenceRows)
      const dedupedEvidence = runDedupeAgent(validation.approved_rows || [])
      const scoring = runScoringAgent(dedupedEvidence)

      const arbitration = confidenceArbitration(validation, scoring)

      const evidencePatch = {
        ...basePatch(result.slug, 'metadata-harvester', 'evidence', config.depth),
        evidence: dedupedEvidence,
        validation,
        scoring,
        metadata_sources: result.metadata_sources,
        confidence_notes: arbitration.notes,
        review_flags: arbitration.flags,
        seo_assets: buildSeoAssets(result.slug),
      }

      if (validateEvidence(evidencePatch)) {
        writePatch({
          slug: result.slug,
          sourceAgent: 'metadata-harvester',
          patchId: evidencePatch.patch_id,
          data: evidencePatch,
        })

        logInfo(`wrote metadata patch for ${result.slug}`)
      }

      if (
        config.enrichment &&
        client &&
        scoring.confidence_score >= 0.45
      ) {
        const enrichmentPatch = {
          ...basePatch(result.slug, 'enrichment-agent', 'enrichment', config.depth),
          enrichment: runEnrichmentAgent(result.slug),
          metadata_sources: result.metadata_sources,
          confidence_notes: arbitration.notes,
          review_flags: arbitration.flags,
          seo_assets: buildSeoAssets(result.slug),
        }

        writePatch({
          slug: result.slug,
          sourceAgent: 'enrichment-agent',
          patchId: enrichmentPatch.patch_id,
          data: enrichmentPatch,
        })

        if (mode === 'deep') {
          const affiliatePatch = {
            ...basePatch(result.slug, 'affiliate-agent', 'affiliate', config.depth),
            affiliate: runAffiliateAgent(),
            metadata_sources: result.metadata_sources,
            seo_assets: buildSeoAssets(result.slug),
          }

          writePatch({
            slug: result.slug,
            sourceAgent: 'affiliate-agent',
            patchId: affiliatePatch.patch_id,
            data: affiliatePatch,
          })
        }
      }
    } catch (error) {
      logError(`pipeline failed for ${result.slug}`, error)
    }
  }
}

main().catch(error => {
  logError('orchestrator failed', error)
  process.exit(0)
})
