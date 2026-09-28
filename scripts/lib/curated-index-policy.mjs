import fs from 'node:fs'
import path from 'node:path'

const POLICY_RELATIVE_PATH = 'data/curated-index-policy.json'
const KINDS = ['herbs', 'compounds']

function validateEntries(entries, kind) {
  if (!Array.isArray(entries)) {
    throw new Error(`[curated-index-policy] ${kind} must be an array`)
  }

  const seen = new Set()
  for (const entry of entries) {
    const slug = String(entry?.slug || '').trim()
    if (!slug) throw new Error(`[curated-index-policy] ${kind} entry is missing slug`)
    if (seen.has(slug)) throw new Error(`[curated-index-policy] duplicate ${kind} slug: ${slug}`)
    if (typeof entry?.governanceIndexBypass !== 'boolean') {
      throw new Error(`[curated-index-policy] ${kind}/${slug} is missing boolean governanceIndexBypass`)
    }
    seen.add(slug)
  }

  return entries
}

export function loadCuratedIndexPolicy(root = process.cwd()) {
  const policyPath = path.join(root, POLICY_RELATIVE_PATH)
  if (!fs.existsSync(policyPath)) {
    throw new Error(`[curated-index-policy] missing ${POLICY_RELATIVE_PATH}`)
  }

  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'))
  for (const kind of KINDS) validateEntries(policy?.[kind], kind)
  return policy
}

export function curatedPolicySlugs(policy, kind, { governanceIndexBypassOnly = false } = {}) {
  if (!KINDS.includes(kind)) throw new Error(`[curated-index-policy] unsupported kind: ${kind}`)
  return (policy[kind] || [])
    .filter((entry) => !governanceIndexBypassOnly || entry.governanceIndexBypass === true)
    .map((entry) => entry.slug)
}

export function curatedPolicySlugSet(policy, kind, options = {}) {
  return new Set(curatedPolicySlugs(policy, kind, options))
}

export { POLICY_RELATIVE_PATH }
