import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const __filename = fileURLToPath(import.meta.url)
const moduleDir = path.dirname(__filename)

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function detailPathForSourceUrl(sourceUrl) {
  let url
  try {
    url = new URL(String(sourceUrl ?? ''))
  } catch {
    return null
  }
  if (url.origin !== SITE_ORIGIN || url.search || url.hash) return null
  const match = url.pathname.match(/^\/(herbs|compounds)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  if (!match) return null
  const detailDir = match[1] === 'herbs' ? 'herbs-detail' : 'compounds-detail'
  return path.resolve(moduleDir, `../../public/data/${detailDir}/${match[2]}.json`)
}

export function resolveApprovedSafetyClaim(sourceUrl, claimId, statement) {
  const detailPath = detailPathForSourceUrl(sourceUrl)
  if (!detailPath || !fs.existsSync(detailPath)) {
    return { ok: false, message: 'safety ownership requires an existing canonical herb/compound detail source page' }
  }

  let detail
  try {
    detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'))
  } catch (error) {
    return { ok: false, message: `canonical source-page detail is unreadable: ${error instanceof Error ? error.message : String(error)}` }
  }

  const matches = (Array.isArray(detail?.claimMap) ? detail.claimMap : []).filter((claim) => (
    clean(claim?.id) === clean(claimId)
    && clean(claim?.predicate) === 'has_safety_warning'
    && clean(claim?.reviewStatus) === 'approved'
  ))

  if (matches.length !== 1) {
    return { ok: false, message: `safetyClaimId ${clean(claimId)} must resolve to exactly one approved has_safety_warning claim on the canonical source page` }
  }
  if (clean(matches[0].claim) !== clean(statement)) {
    return { ok: false, message: 'safetyStatement must equal the approved source-page safety claim without rewriting' }
  }
  return { ok: true, claim: matches[0] }
}
