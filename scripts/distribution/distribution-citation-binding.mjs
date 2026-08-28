import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const __filename = fileURLToPath(import.meta.url)
const moduleDir = path.dirname(__filename)

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function loadCanonicalSourcePage(sourceUrl) {
  const url = new URL(String(sourceUrl ?? ''))
  if (url.origin !== SITE_ORIGIN || url.search || url.hash) throw new Error('citation binding requires a canonical Hippie Scientist source page')
  const match = url.pathname.match(/^\/(herbs|compounds)\/([a-z0-9-]+)\/?$/)
  if (!match) throw new Error('citation binding source page must be a herb or compound detail page')
  const detailDir = match[1] === 'herbs' ? 'herbs-detail' : 'compounds-detail'
  const file = path.resolve(moduleDir, `../../public/data/${detailDir}/${match[2]}.json`)
  if (!fs.existsSync(file)) throw new Error(`canonical citation source page is missing for ${sourceUrl}`)
  const page = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!Array.isArray(page.claimMap) || !Array.isArray(page.sources)) throw new Error('canonical citation source page must expose claimMap and sources')
  return page
}

export function validateDistributionCitationBinding(pack, researchObject) {
  const errors = []
  const findingClaimId = clean(researchObject?.findingClaimId)
  const primarySourceId = clean(researchObject?.primarySourceId)
  const primarySourceUrl = clean(researchObject?.primarySourceUrl)
  const finding = clean(researchObject?.finding)

  if (!/^clm_[a-f0-9]+$/.test(findingClaimId)) errors.push('findingClaimId must be a canonical claim id')
  if (!/^src_[a-f0-9]+$/.test(primarySourceId)) errors.push('primarySourceId must be a canonical source id')
  try { new URL(primarySourceUrl) } catch { errors.push('primarySourceUrl must be an absolute URL') }
  if (errors.length) return errors

  let page
  try {
    page = loadCanonicalSourcePage(researchObject.sourceUrl)
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)]
  }

  const claimMatches = page.claimMap.filter(({ id }) => clean(id) === findingClaimId)
  if (claimMatches.length !== 1) return [`findingClaimId ${findingClaimId} must resolve exactly once on the canonical source page`]
  const claim = claimMatches[0]
  if (clean(claim.reviewStatus) !== 'approved') errors.push(`findingClaimId ${findingClaimId} must be approved`)
  if (clean(claim.predicate) !== 'supports_outcome') errors.push(`findingClaimId ${findingClaimId} must be a supports_outcome claim`)
  if (clean(claim.claim) !== finding) errors.push(`finding must exactly equal approved canonical claim ${findingClaimId}`)
  if (!Array.isArray(claim.sourceRefIds) || !claim.sourceRefIds.map(clean).includes(primarySourceId)) {
    errors.push(`primarySourceId ${primarySourceId} must be cited by canonical claim ${findingClaimId}`)
  }

  const sourceMatches = page.sources.filter(({ id }) => clean(id) === primarySourceId)
  if (sourceMatches.length !== 1) errors.push(`primarySourceId ${primarySourceId} must resolve exactly once on the canonical source page`)
  else {
    const source = sourceMatches[0]
    if (clean(source.reviewStatus) && clean(source.reviewStatus) !== 'approved') errors.push(`primarySourceId ${primarySourceId} must be approved when review status is present`)
    if (clean(source.url) !== primarySourceUrl) errors.push(`primarySourceUrl must exactly equal canonical source ${primarySourceId}`)
  }

  if (clean(pack?.source?.findingClaimId) !== findingClaimId) errors.push('pack source findingClaimId must equal canonical research-object findingClaimId')
  if (clean(pack?.source?.primarySourceId) !== primarySourceId) errors.push('pack source primarySourceId must equal canonical research-object primarySourceId')
  if (clean(pack?.source?.primarySourceUrl) !== primarySourceUrl) errors.push('pack source primarySourceUrl must equal canonical research-object primarySourceUrl')
  return errors
}

export function assertDistributionCitationBinding(pack, researchObject) {
  const errors = validateDistributionCitationBinding(pack, researchObject)
  if (errors.length) throw new Error(`distribution citation binding failed: ${errors.join('; ')}`)
  return pack
}
