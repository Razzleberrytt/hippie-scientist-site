import fs from 'node:fs/promises'
import path from 'node:path'
import {
  CLUSTER_MEMBER_RUNTIME_DECISION,
  getClusterMemberRuntimeTrustRecord,
} from '../../config/cluster-member-runtime-trust.mjs'

const GENERIC_SOURCE_DOWNGRADE_REASON = 'missing_record_level_sources'
const CLUSTER_TRUST_REASON = 'cluster_member_runtime_trust'
const DELIBERATE_HOLD_PROFILE_STATUSES = new Set(['research_only', 'minimal'])

function stableValue(value) {
  return JSON.stringify(value)
}

export function isValidatedClusterMember(record) {
  if (!record || typeof record !== 'object') return false
  const slug = String(record.slug || '').trim()
  if (!slug) return false
  if (String(record.runtime_export_decision || '').trim() !== CLUSTER_MEMBER_RUNTIME_DECISION) return false
  if (DELIBERATE_HOLD_PROFILE_STATUSES.has(String(record.profile_status || '').trim().toLowerCase())) return false
  return Boolean(getClusterMemberRuntimeTrustRecord(slug))
}

export function applyValidatedClusterMemberGovernance(record) {
  if (!isValidatedClusterMember(record)) return false

  const before = stableValue(record)
  const reasons = Array.isArray(record.indexability_reasons)
    ? record.indexability_reasons.filter((reason) => String(reason) !== GENERIC_SOURCE_DOWNGRADE_REASON)
    : []
  if (!reasons.includes(CLUSTER_TRUST_REASON)) reasons.push(CLUSTER_TRUST_REASON)

  record.indexability_status = 'PUBLISH'
  record.robots = 'index,follow'
  record.sitemap_included = true
  record.indexability_reasons = reasons
  record.governance = {
    ...(record.governance && typeof record.governance === 'object' ? record.governance : {}),
    reviewStatus: 'approved',
    indexingAllowed: true,
    requiresHumanReview: false,
    reason: CLUSTER_TRUST_REASON,
  }

  return before !== stableValue(record)
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

async function reconcileCollection(dataDir, listFile, detailDirName) {
  const listPath = path.join(dataDir, listFile)
  const records = await readJson(listPath, [])
  if (!Array.isArray(records)) return []

  const corrected = []
  let listChanged = false

  for (const record of records) {
    if (!isValidatedClusterMember(record)) continue
    const slug = String(record.slug).trim()

    if (applyValidatedClusterMemberGovernance(record)) listChanged = true

    const detailPath = path.join(dataDir, detailDirName, `${slug}.json`)
    const detail = await readJson(detailPath, null)
    if (detail && typeof detail === 'object') {
      // The canonical record owns route/indexability state. Preserve the richer local
      // narrative while making late detail merges incapable of reintroducing noindex.
      detail.runtime_export_decision = record.runtime_export_decision
      if ('profile_status' in record) detail.profile_status = record.profile_status
      detail.indexability_status = record.indexability_status
      detail.robots = record.robots
      detail.sitemap_included = record.sitemap_included
      detail.indexability_reasons = [...record.indexability_reasons]
      detail.governance = { ...record.governance }
      await writeJson(detailPath, detail)
    }

    corrected.push(slug)
  }

  if (listChanged) await writeJson(listPath, records)
  return corrected.sort()
}

export async function reconcileValidatedClusterMemberGovernance({ dataDir = 'public/data' } = {}) {
  const root = path.resolve(process.cwd(), dataDir)
  const herbs = await reconcileCollection(root, 'herbs.json', 'herbs-detail')
  const compounds = await reconcileCollection(root, 'compounds.json', 'compounds-detail')

  return {
    herbs,
    compounds,
    total: herbs.length + compounds.length,
  }
}
