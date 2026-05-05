import crypto from 'node:crypto'

import { runJsonPrompt } from '../lib/openai-client.js'
import { handleAgentError, AgentError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

const SYSTEM_PROMPT = `You are the Discovery Agent for The Hippie Scientist.
Extract ONLY human clinical evidence.

Allowed:
- randomized controlled trials
- meta-analyses
- systematic reviews

Forbidden:
- invented PMIDs
- invented effect sizes
- animal studies
- in vitro studies
- marketing claims
- mechanistic speculation

Return strict JSON only.`

export async function runDiscovery(compound) {
  try {
    logger.info(`Discovery started for ${compound.slug}`)

    const userPrompt = `Find conservative human clinical evidence for ${compound.slug}.
Focus on RCTs and meta-analyses only.
Return structured JSON data only.`

    const raw = await runJsonPrompt(SYSTEM_PROMPT, userPrompt, 0.1)

    if (!raw?.entries?.length) {
      throw new AgentError(
        'No valid discovery entries returned',
        'discovery',
        {
          slug: compound.slug,
        }
      )
    }

    const result = {
      success: true,
      data: {
        patch_type: 'discovery_candidates',
        patch_id: crypto.randomUUID(),
        schema_version: '1.0',
        source_agent: 'discovery-agent',
        agent_version: '1.5',
        slug: compound.slug,
        created_at: new Date().toISOString(),
        entries: raw.entries,
      },
    }

    logger.success(`Discovery completed: ${raw.entries.length} entries`)

    return result
  } catch (error) {
    return handleAgentError(error, 'discovery', {
      slug: compound.slug,
    })
  }
}
