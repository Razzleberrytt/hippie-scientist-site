import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const trim = (value) => String(value ?? '').trim()
const safe = /^[a-z0-9][a-z0-9_-]{1,70}$/
const hex = /^[a-f0-9]{64}$/i
const approvedLicenses = new Set(['original-owned', 'cc0-verified', 'cc-by-attributed'])
const approvedTypes = new Set(['vector-actor', 'beat-layout', 'caption-style', 'hook-preview', 'source-trust-card', 'cover-preview'])
function createImmutable(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file)) {
    if (Buffer.compare(fs.readFileSync(file), bytes) !== 0) throw Error('R8.11 immutable asset conflict')
    return false
  }
  fs.writeFileSync(file, bytes, { flag: 'wx', mode: 0o444 })
  return true
}
export function registerR811Asset(root, { content, type, name, version, license, creator, licenseSourceUrl = null,
  reusableAcrossTopics = false, sourcePacketSha256 = null, topic = null, altText, createdFromVideoId }) {
  if (typeof content !== 'string' || !content.startsWith('<svg') || !content.includes('</svg>') ||
      /<script\b|<foreignObject\b|(?:href|src)\s*=\s*["']https?:/i.test(content)) throw Error('R8.11 asset must be self-contained safe SVG; no scripts or network assets')
  if (!approvedTypes.has(type) || !safe.test(name) || !/^[a-z0-9-]+-v[1-9]\d*$/.test(version)) throw Error('R8.11 asset type, name and component version required')
  if (!approvedLicenses.has(license) || !trim(creator)) throw Error('R8.11 reusable assets need explicit verifiable license and creator')
  if (license === 'cc-by-attributed' && (!trim(licenseSourceUrl) || !/^https:\/\//.test(licenseSourceUrl))) throw Error('R8.11 CC-BY asset needs source attribution')
  if (!trim(altText) || !safe.test(createdFromVideoId)) throw Error('R8.11 accessible description and origin video ID required')
  if (reusableAcrossTopics && (sourcePacketSha256 || topic || type === 'source-trust-card' || type === 'hook-preview')) {
    throw Error('R8.11 science-specific or claim-bearing assets may not be reused across unrelated topics')
  }
  if (!reusableAcrossTopics && (!hex.test(sourcePacketSha256) || !trim(topic))) throw Error('R8.11 topic-bound visuals need pinned science source and topic')
  const bytes = Buffer.from(content, 'utf8')
  const contentSha256 = hash(bytes)
  const metadata = {
    schemaVersion: 'ths-evidencemotion-r811-asset-v1', type, name, version,
    contentSha256, format: 'svg', license, creator, licenseSourceUrl,
    reusableAcrossTopics, sourcePacketSha256: reusableAcrossTopics ? null : sourcePacketSha256,
    topic: reusableAcrossTopics ? null : topic, altText: trim(altText),
    createdFromVideoId, scientificCopyAuthority: false, autoPublicationAllowed: false,
    futureReuseRequiresHumanReview: true,
  }
  const dir = path.join(path.resolve(root), contentSha256.slice(0, 2), contentSha256)
  createImmutable(path.join(dir, 'asset.svg'), bytes)
  const metaPath = path.join(dir, 'asset.json')
  createImmutable(metaPath, Buffer.from(JSON.stringify(metadata, null, 2) + '\n'))
  return { contentSha256, metadataPath: metaPath, assetPath: path.join(dir, 'asset.svg') }
}
export function loadR811Asset(root, digest, { topic = null, sourcePacketSha256 = null } = {}) {
  if (!hex.test(digest)) throw Error('R8.11 invalid asset content hash')
  const dir = path.join(path.resolve(root), digest.slice(0, 2), digest)
  const bytes = fs.readFileSync(path.join(dir, 'asset.svg'))
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'asset.json'), 'utf8'))
  if (hash(bytes) !== digest || m.contentSha256 !== digest) throw Error('R8.11 reusable asset corrupted')
  if (!m.reusableAcrossTopics && (trim(m.topic) !== trim(topic) || m.sourcePacketSha256 !== sourcePacketSha256)) {
    throw Error('R8.11 cannot leak a science-specific illustration into an unrelated research topic')
  }
  return { metadata: m, svg: bytes.toString('utf8') }
}
export function listR811Assets(root) {
  const dir = path.resolve(root)
  if (!fs.existsSync(dir)) return []
  const inventory = []
  for (const prefix of fs.readdirSync(dir).filter(x => /^[a-f0-9]{2}$/.test(x))) {
    for (const id of fs.readdirSync(path.join(dir,prefix)).filter(x => hex.test(x))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir,prefix,id,'asset.json'),'utf8'))
      inventory.push(data)
    }
  }
  return inventory.sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
}
export function r811AssetReuseReport(root) {
  const inventory = listR811Assets(root)
  return {
    uniqueReusableAssets: inventory.length,
    topicIndependent: inventory.filter(a => a.reusableAcrossTopics).length,
    topicBound: inventory.filter(a => !a.reusableAcrossTopics).length,
    // Savings cannot be calculated without actual render time/credit measurements.
    measuredMinutesSaved: null,
    note: 'Asset reuse is recorded; productivity or cost savings are unknown until measured.',
  }
}
