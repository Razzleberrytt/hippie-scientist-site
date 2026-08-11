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

async function reconcileCollection(dataDir, listFile, detailDirName) {
  const listPath = path.join(dataDir, listFile)
  const records = await readJson(listPath, [])
  if (!Array.isArray(records)) return { corrected: [] }

  const corrected = []
  for (const record of records) {
    if (!applyDeliberateGovernanceHold(record)) continue
    const slug = String(record.slug || '').trim()
    if (!slug) continue
    corrected.push(slug)

    const detailPath = path.join(dataDir, detailDirName, `${slug}.json`)
    const detail = await readJson(detailPath, null)
    if (detail && typeof detail === 'object') {
      applyDeliberateGovernanceHold(detail)
      detail.indexability_status = record.indexability_status
      detail.robots = record.robots
      detail.sitemap_included = record.sitemap_included
      detail.indexability_reasons = [...record.indexability_reasons]
      detail.governance = { ...record.governance }
      await writeJson(detailPath, detail)
    }
  }

  if (corrected.length > 0) await writeJson(listPath, records)
  return { corrected: corrected.sort() }
}

export async function reconcileDeliberateGovernanceHolds({ dataDir = 'public/data' } = {}) {
  const root = path.resolve(process.cwd(), dataDir)
  const herbs = await reconcileCollection(root, 'herbs.json', 'herbs-detail')
  const compounds = await reconcileCollection(root, 'compounds.json', 'compounds-detail')
  return {
    herbs: herbs.corrected,
    compounds: compounds.corrected,
    total: herbs.corrected.length + compounds.corrected.length,
  }
}
