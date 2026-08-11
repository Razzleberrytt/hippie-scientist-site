import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyDeliberateGovernanceHold,
  isDeliberateGovernanceHold,
} from './governance-hold-policy.mjs'

test('hidden_until_grounded remains held even when a curated overlay promoted it', () => {
  const record = {
    slug: 'black-cohosh',
    runtime_export_decision: 'hidden_until_grounded',
    indexability_status: 'PUBLISH',
    robots: 'index,follow',
    sitemap_included: true,
    indexability_reasons: ['noindex-decision:hidden_until_grounded', 'curated_allowlist'],
    governance: {
      indexingAllowed: true,
      reviewStatus: 'approved',
      recommendationAllowed: true,
      requiresHumanReview: false,
      reason: 'curated_allowlist',
    },
  }

  assert.equal(isDeliberateGovernanceHold(record), true)
  assert.equal(applyDeliberateGovernanceHold(record), true)
  assert.equal(record.indexability_status, 'NEEDS_REVIEW')
  assert.equal(record.robots, 'noindex,follow')
  assert.equal(record.sitemap_included, false)
  assert.equal(record.governance.indexingAllowed, false)
  assert.equal(record.governance.requiresHumanReview, true)
  assert.equal(record.governance.recommendationAllowed, false)
})

test('research_only profile status outranks curated allowlisting', () => {
  const record = {
    slug: 'acetyl-l-carnitine',
    profile_status: 'research_only',
    indexability_status: 'PUBLISH',
    robots: 'index,follow',
    sitemap_included: true,
    indexability_reasons: ['profile-status:research_only', 'curated_allowlist'],
  }

  assert.equal(applyDeliberateGovernanceHold(record), true)
  assert.equal(record.indexability_status, 'NEEDS_REVIEW')
})

test('normal curated publish records are unchanged', () => {
  const record = {
    slug: 'magnesium',
    runtime_export_decision: 'full_public_runtime',
    profile_status: 'complete',
    indexability_status: 'PUBLISH',
    robots: 'index,follow',
    sitemap_included: true,
    indexability_reasons: ['curated_allowlist'],
  }

  assert.equal(isDeliberateGovernanceHold(record), false)
  assert.equal(applyDeliberateGovernanceHold(record), false)
  assert.equal(record.indexability_status, 'PUBLISH')
})
