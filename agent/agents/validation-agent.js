import crypto from 'node:crypto'

import { handleAgentError, AgentError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

const SYSTEM_PROMPT = `You are the Validation Firewall for The Hippie Scientist.
Reject hallucinated citations, animal-only data, in-vitro-only data, vague claims, unsupported medical claims, and low-quality entries.
Be extremely strict and conservative.`

const INVALID_TERMS = [
  'mouse',
  'mice',
  'murine',
  'rat',
  'rodent',
  'in vitro',
  'cell culture',
]

function isInvalidPmid(source) {
  return /^\d+$/.test(source) && source.length < 6
}

export async function runValidation(discoveryData) {
  try {
    const slug = discoveryData?.slug || 'unknown'
    const entries = discoveryData?.entries || discoveryData?.evidence || []

    logger.info(`Validation started for ${slug}`)

    if (!Array.isArray(entries)) {
      throw new AgentError('Validation input entries must be an array', 'validation', {
        slug,
      })
    }

    const approved = []
    const rejectionReasons = []

    for (const row of entries) {
      if (!row?.compound_slug || !row?.study_type || !row?.population) {
        rejectionReasons.push('missing_required_fields')
        continue
      }

      const source = String(row?.pmid_or_source || '').trim()

      if (source && isInvalidPmid(source)) {
        rejectionReasons.push('invalid_pmid')
        continue
      }

      const blob = JSON.stringify(row).toLowerCase()

      if (INVALID_TERMS.some(term => blob.includes(term))) {
        rejectionReasons.push('non_human_or_preclinical_evidence')
        continue
      }

      if (/cure|proven|guaranteed|miracle|prevents disease/i.test(blob)) {
        rejectionReasons.push('overconfident_language')
        continue
      }

      approved.push(row)
    }

    if (!approved.length) {
      rejectionReasons.push('no_approved_entries')
    }

    const data = {
      patch_type: 'validated_evidence',
      patch_id: crypto.randomUUID(),
      schema_version: '1.0',
      source_agent: 'validation-agent',
      agent_version: '1.5',
      slug,
      created_at: new Date().toISOString(),
      system_prompt: SYSTEM_PROMPT,
      validation_status: approved.length ? 'approved' : 'rejected',
      rejection_reasons: [...new Set(rejectionReasons)],
      entries: approved,
    }

    logger.success(`Validation completed: ${approved.length} approved`)

    return {
      success: true,
      data,
    }
  } catch (error) {
    return handleAgentError(error, 'validation', {
      slug: discoveryData?.slug || 'unknown',
    })
  }
}

export const runValidationAgent = runValidation
