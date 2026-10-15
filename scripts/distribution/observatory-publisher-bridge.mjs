// AO #6810: read-only join between an existing Publisher PUBLISHED receipt
// and the already-registered, immutable EvidenceMotion R8.10 flywheel.
// Never dispatches, posts, rewrites scientific content, or infers missing metrics.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { buildPublicationIdentity } from './social-publisher-core.mjs'
import { getFlywheelVideo, appendFlywheelObservation } from './evidencemotion-flywheel.mjs'

const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
const shaPattern = /^[0-9a-f]{64}$/
const videoPattern = /^[a-z0-9][a-z0-9_-]{2,79}$/
const stable = (value) => JSON.stringify(value, null, 2) + '\n'
const utc = (value, label) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value))) throw Error('AO ' + label + ' must be an actual UTC timestamp')
  return Date.parse(value)
}
const fileBytes = (file, label) => {
  if (!file || typeof file !== 'string') throw Error('AO ' + label + ' must be an existing local file')
  return fs.readFileSync(path.resolve(file))
}
const safeVideoId = (id) => {
  if (!videoPattern.test(String(id || ''))) throw Error('AO invalid video ID')
  return id
}

export function videoIdFromPublicUrl(platform, publishedUrl) {
  let url
  try { url = new URL(publishedUrl) } catch { throw Error('AO invalid published URL') }
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('AO publication URL must be public HTTPS')
  const host = url.hostname.toLowerCase()
  if (platform === 'tiktok') {
    if (!['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'].includes(host)) throw Error('AO wrong TikTok host')
    const match = url.pathname.match(/^\/@[^/]+\/video\/(\d+)\/?$/)
    if (!match) throw Error('AO missing TikTok public video ID')
    return match[1]
  }
  if (platform === 'youtube') {
    if (host === 'youtu.be') {
      const match = url.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/)
      if (!match) throw Error('AO invalid YouTube public video ID')
      return match[1]
    }
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) throw Error('AO wrong YouTube host')
    const shorts = url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]{11})\/?$/)
    if (shorts) return shorts[1]
    if (url.pathname === '/watch' && /^[A-Za-z0-9_-]{11}$/.test(url.searchParams.get('v') || '')) return url.searchParams.get('v')
    throw Error('AO invalid YouTube public video ID')
  }
  throw Error('AO platform not supported by this pilot')
}

function verifiedPublisherJob(bytes) {
  const job = JSON.parse(bytes.toString('utf8'))
  if (job?.schemaVersion !== 'ths-publication-job-v1' || job.state !== 'PUBLISHED') {
    throw Error('AO requires canonical Publisher PUBLISHED state, not a draft or accepted upload')
  }
  const identity = job.identity
  if (!identity || !shaPattern.test(String(identity.artifactSha256 || ''))) throw Error('AO invalid Publisher media identity')
  const expected = buildPublicationIdentity(identity)
  if (job.publicationId !== expected.publicationId || identity.publicationId !== expected.publicationId ||
    identity.experimentId !== expected.experimentId || identity.platform !== expected.platform ||
    identity.intendedTime !== expected.intendedTime || identity.artifactSha256 !== expected.artifactSha256) {
    throw Error('AO canonical Publisher publicationId or identity mismatch')
  }
  const receipt = job.providerReceipt
  const officialProvider = receipt?.provider === identity.platform
  const manualProvider = ['manual', 'manual-reconciliation'].includes(receipt?.provider)
  if (!receipt || (!officialProvider && !manualProvider) || !String(receipt.externalId || '').trim()) {
    throw Error('AO missing Publisher verified external public video ID')
  }
  const external = String(receipt.externalId).trim()
  const externalIsUrl = /^https:\/\//.test(external)
  let externalPostId
  if (externalIsUrl) externalPostId = videoIdFromPublicUrl(identity.platform, external)
  else if (officialProvider && (
    (identity.platform === 'tiktok' && /^\d+$/.test(external)) ||
    (identity.platform === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(external))
  )) externalPostId = external
  else throw Error('AO Publisher external video ID must be a valid platform ID or public URL')
  const verifiedMs = utc(receipt.verifiedPublishedAt, 'verifiedPublishedAt')
  if (receipt.publicationId && receipt.publicationId !== job.publicationId) {
    throw Error('AO Publisher verification receipt publicationId mismatch')
  }
  if (!Array.isArray(job.providerReceipts) || !job.providerReceipts.some((r) =>
    r.provider === receipt.provider && r.externalId === receipt.externalId &&
    r.verifiedPublishedAt === receipt.verifiedPublishedAt)) {
    throw Error('AO missing Publisher publication verification history')
  }
  for (const publicUrl of [receipt.publicUrl, job.publicUrl].filter(Boolean)) {
    if (videoIdFromPublicUrl(identity.platform, publicUrl) !== externalPostId) {
      throw Error('AO Publisher stored public URL does not match verified video identity')
    }
  }
  if (!Array.isArray(job.attempts)) throw Error('AO missing Publisher attempt history')
  if (manualProvider) {
    // The canonical /api/publisher/manual route can publish a QUEUED job
    // without any provider dispatch attempt. Its receipt is URL-based.
    if (!externalIsUrl || !receipt.publicUrl || !job.publicUrl ||
        !receipt.providerOperationId || !job.publishedAt ||
        receipt.publicationId !== job.publicationId ||
        videoIdFromPublicUrl(identity.platform, receipt.publicUrl) !== externalPostId ||
        videoIdFromPublicUrl(identity.platform, job.publicUrl) !== externalPostId ||
        utc(job.publishedAt, 'manual publishedAt') !== verifiedMs) {
      throw Error('AO incomplete canonical manual publication receipt')
    }
    if (receipt.provider === 'manual-reconciliation' && !job.reconciliationReceipts?.some((r) =>
      r.outcome === 'published' && r.publicUrl &&
      videoIdFromPublicUrl(identity.platform, r.publicUrl) === externalPostId)) {
      throw Error('AO missing published reconciliation evidence')
    }
  } else if (!job.attempts.length) {
    throw Error('AO missing Publisher dispatch attempt history')
  }
  utc(identity.intendedTime, 'intendedTime')
  return { job, identity, receipt, verifiedMs, externalPostId }
}

// Link is an evidence projection, NOT a new Publisher state or permission.
// Only a genuine locally available approved master and manifest can match the
// hashes in both the existing Flywheel registry and Publisher identity.
export function linkPublishedFlywheelVideo(root, {
  videoId, publisherJobFile, masterFile, productionManifestFile,
} = {}) {
  const id = safeVideoId(videoId)
  const publisherBytes = fileBytes(publisherJobFile, 'Publisher receipt')
  const { job, identity, receipt, verifiedMs, externalPostId } = verifiedPublisherJob(publisherBytes)
  if (!['tiktok', 'youtube'].includes(identity.platform)) throw Error('AO pilot supports TikTok or YouTube only')
  const video = getFlywheelVideo(root, id)
  if (video.platform !== identity.platform) throw Error('AO platform mismatch with Flywheel')
  if (video.manifest.artifactSha256 !== identity.artifactSha256 ||
      sha(fileBytes(masterFile, 'encoded master')) !== identity.artifactSha256) {
    throw Error('AO exact encoded master hash mismatch')
  }
  if (sha(fileBytes(productionManifestFile, 'production manifest')) !== video.manifest.productionManifestSha256) {
    throw Error('AO original production manifest hash mismatch')
  }
  const postId = videoIdFromPublicUrl(identity.platform, video.publishedUrl)
  if (postId !== externalPostId) throw Error('AO Publisher external video ID does not match Flywheel URL')
  if (utc(video.publishedAt, 'publishedAt') > verifiedMs) {
    throw Error('AO observed publication time is after Publisher verification')
  }
  const link = {
    schemaVersion: 'ths-observatory-publisher-link-v1',
    videoId: id,
    publicationId: job.publicationId,
    experimentId: identity.experimentId,
    platform: identity.platform,
    platformPostId: externalPostId,
    publishedAt: video.publishedAt,
    verifiedPublishedAt: receipt.verifiedPublishedAt,
    publisherJobSnapshotSha256: sha(publisherBytes),
    artifactSha256: identity.artifactSha256,
    productionManifestSha256: video.manifest.productionManifestSha256,
    publicationEvidence: video.publicationEvidence,
    authority: 'read-only-verified-publication-join',
    publishingAuthority: false,
    automaticScientificCopy: false,
  }
  const videosDir = path.join(path.resolve(root), 'videos')
  const destination = path.join(videosDir, id, 'PUBLISHER_LINK.json')
  for (const d of fs.readdirSync(videosDir, { withFileTypes: true })) {
    if (!d.isDirectory() || !videoPattern.test(d.name) || d.name === id) continue
    const other = path.join(videosDir, d.name, 'PUBLISHER_LINK.json')
    if (!fs.existsSync(other)) continue
    const prior = JSON.parse(fs.readFileSync(other, 'utf8'))
    if (prior.publicationId === link.publicationId ||
      (prior.platform === link.platform && prior.platformPostId === link.platformPostId)) {
      throw Error('AO duplicate Publisher/public video identity already linked to another Flywheel video')
    }
  }
  const bytes = stable(link)
  if (fs.existsSync(destination)) {
    if (fs.readFileSync(destination, 'utf8') !== bytes) throw Error('AO immutable Publisher link conflict')
    return { ...link, idempotent: true }
  }
  fs.writeFileSync(destination, bytes, { flag: 'wx', mode: 0o444 })
  return { ...link, idempotent: false }
}

// First slice: owner-entered platform-native observations only. This refuses
// fake provider-verified exports; those require a separately reviewed adapter.
export function appendLinkedFlywheelObservation(root, {
  publicationId, platform, platformPostId, observation,
} = {}) {
  const id = safeVideoId(observation?.videoId)
  const linkPath = path.join(path.resolve(root), 'videos', id, 'PUBLISHER_LINK.json')
  const link = JSON.parse(fs.readFileSync(linkPath, 'utf8'))
  if (link.publicationId !== publicationId || link.platform !== platform ||
    link.platformPostId !== platformPostId) throw Error('AO metric observation Publisher identity mismatch')
  if (observation.source !== 'manual-owner-entry') {
    throw Error('AO pilot allows only explicitly manual-owner-entry metrics; provider adapter not verified')
  }
  // Underlying R8.10 handles real timestamp/age window, null versus zero,
  // no backwards revisions, exact deduplication and immutable snapshots.
  return appendFlywheelObservation(root, observation)
}
