import fs from 'node:fs/promises'
import path from 'node:path'

export const DELIBERATE_HOLD_DECISIONS = new Set([
  'hidden_until_grounded',
  'research_archive_runtime',
])

export const DELIBERATE_HOLD_PROFILE_STATUSES = new Set([
  'research_only',
  'minimal',
])

const RUNTIME_MAP_FILES = [
  'related-profiles.json',
  'comparison-map.json',
  'comparison-recommendations.json',
  'condition-to-herbs.json',
  'entity-to-conditions.json',
  'stack-map.json',
  'ecosystem-map.json',
  'authority-hubs.json',
]

// The flat workbook-derived runtime records are the authority for profile visibility.
// Per-slug detail files can carry richer editorial prose, but they must not override
// canonical route/indexability state when runtime-data.ts merges detail last.
const CANONICAL_DETAIL_AUTHORITY_FIELDS = [
  'profile_status',
  'runtime_export_decision',
  'robots',
  'sitemap_included',
  'indexability_status',
  'indexability_score',
  'indexability_reasons',
  'governance',
]

function cloneAuthorityValue(value) {
  if (Array.isArray(value)) return value.map((entry) => cloneAuthorityValue(entry))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneAuthorityValue(entry)]),
    )
  }
  return value
}

export function mirrorCanonicalGovernanceAuthority(detail, canonicalRecord) {
  if (!detail || typeof detail !== 'object' || !canonicalRecord || typeof canonicalRecord !== 'object') {
    return false
  }

  let changed = false
  for (const field of CANONICAL_DETAIL_AUTHORITY_FIELDS) {
    if (!(field in canonicalRecord)) continue

    const nextValue = cloneAuthorityValue(canonicalRecord[field])
    if (JSON.stringify(detail[field]) === JSON.stringify(nextValue)) continue

    detail[field] = nextValue
    changed = true
  }
  return changed
}

export function isDeliberateGovernanceHold(record) {
  if (!record || typeof record !== 'object') return false

  const decision = String(record.runtime_export_decision || '').trim().toLowerCase()
  if (DELIBERATE_HOLD_DECISIONS.has(decision)) return true

  const profileStatus = String(record.profile_status || '').trim().toLowerCase()
  if (DELIBERATE_HOLD_PROFILE_STATUSES.has(profileStatus)) return true

  const reasons = Array.isArray(record.indexability_reasons) ? record.indexability_reasons : []
  return reasons.some((reason) => {
    const [key, value] = String(reason).split(':')
    if (key === 'noindex-decision' && DELIBERATE_HOLD_DECISIONS.has(value)) return true
    if (key === 'profile-status' && DELIBERATE_HOLD_PROFILE_STATUSES.has(value)) return true
    return false
  })
}

export function applyDeliberateGovernanceHold(record) {
  if (!isDeliberateGovernanceHold(record)) return false

  record.indexability_status = 'NEEDS_REVIEW'
  record.robots = 'noindex,follow'
  record.sitemap_included = false

  if (!Array.isArray(record.indexability_reasons)) record.indexability_reasons = []
  if (!record.indexability_reasons.includes('deliberate_governance_hold')) {
    record.indexability_reasons.push('deliberate_governance_hold')
  }

  const governance = record.governance && typeof record.governance === 'object'
    ? record.governance
    : {}

  record.governance = {
    ...governance,
    reviewStatus: 'needs_review',
    indexingAllowed: false,
    recommendationAllowed: false,
    requiresHumanReview: true,
    reason: 'deliberate_governance_hold',
  }

  return true
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((output, key) => {
        output[key] = stableClone(value[key])
        return output
      }, {})
  }
  return value
}

async function writeDeterministicJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(stableClone(value))}\n`, 'utf8')
}

async function reconcileCollection(dataDir, listFile, detailDirName) {
  const listPath = path.join(dataDir, listFile)
  const records = await readJson(listPath, [])
  if (!Array.isArray(records)) return { corrected: [], synchronizedDetails: [] }

  const corrected = []
  const synchronizedDetails = []
  for (const record of records) {
    const slug = String(record?.slug || '').trim()
    if (!slug) continue

    // Deliberate-hold detection is based on the canonical runtime record, never on a
    // stale legacy detail payload. This prevents an old detail-only status from
    // overriding a later editorial promotion such as cluster_member_runtime.
    const held = applyDeliberateGovernanceHold(record)
    if (held) corrected.push(slug)

    const detailPath = path.join(dataDir, detailDirName, `${slug}.json`)
    const detail = await readJson(detailPath, null)
    if (detail && typeof detail === 'object') {
      const changed = mirrorCanonicalGovernanceAuthority(detail, record)
      if (changed) {
        await writeJson(detailPath, detail)
        synchronizedDetails.push(slug)
      }
    }
  }

  if (corrected.length > 0) await writeJson(listPath, records)
  return {
    corrected: corrected.sort(),
    synchronizedDetails: synchronizedDetails.sort(),
  }
}

function recordReferencesHeldSlug(value, heldSlugs) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return ['slug', 'sourceSlug', 'targetSlug'].some((key) => {
    const slug = String(value[key] || '').trim()
    return slug && heldSlugs.has(slug)
  })
}

function sanitizeRuntimeMap(value, heldSlugs) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => !recordReferencesHeldSlug(entry, heldSlugs))
      .map((entry) => sanitizeRuntimeMap(entry, heldSlugs))
  }

  if (value && typeof value === 'object') {
    const output = {}
    for (const [key, entry] of Object.entries(value)) {
      if (heldSlugs.has(key)) continue
      output[key] = sanitizeRuntimeMap(entry, heldSlugs)
    }
    return output
  }

  return value
}

async function reconcileRuntimeMaps(dataDir, heldSlugs) {
  if (heldSlugs.size === 0) return []

  const runtimeMapDir = path.join(dataDir, 'runtime-maps')
  const corrected = []

  for (const fileName of RUNTIME_MAP_FILES) {
    const filePath = path.join(runtimeMapDir, fileName)
    const current = await readJson(filePath, null)
    if (current === null) continue

    const sanitized = sanitizeRuntimeMap(current, heldSlugs)
    if (JSON.stringify(sanitized) === JSON.stringify(current)) continue

    await writeDeterministicJson(filePath, sanitized)
    corrected.push(fileName)
  }

  return corrected.sort()
}

export async function reconcileDeliberateGovernanceHolds({ dataDir = 'public/data' } = {}) {
  const root = path.resolve(process.cwd(), dataDir)
  const herbs = await reconcileCollection(root, 'herbs.json', 'herbs-detail')
  const compounds = await reconcileCollection(root, 'compounds.json', 'compounds-detail')
  const heldSlugs = new Set([...herbs.corrected, ...compounds.corrected])
  const runtimeMaps = await reconcileRuntimeMaps(root, heldSlugs)

  return {
    herbs: herbs.corrected,
    compounds: compounds.corrected,
    synchronizedDetails: {
      herbs: herbs.synchronizedDetails,
      compounds: compounds.synchronizedDetails,
    },
    runtimeMaps,
    total: herbs.corrected.length + compounds.corrected.length,
  }
}
