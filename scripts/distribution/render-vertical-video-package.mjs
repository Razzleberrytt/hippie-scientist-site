import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { assertValidDistributionPack } from './distribution-pack-contract.mjs'
import { CREATIVE_BRAND_TOKENS, validateCreativeContrast } from './creative-spec.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const roundMillis = (value) => Math.round(Number(value) * 1000) / 1000

function escapeXml(value) {
  return clean(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
}

function treatment(name) {
  const token = CREATIVE_BRAND_TOKENS.color.treatments[name]
  if (!token) throw new Error(`unknown color treatment: ${name}`)
  return {
    foreground: CREATIVE_BRAND_TOKENS.color.palette[token.foreground],
    background: CREATIVE_BRAND_TOKENS.color.palette[token.background],
  }
}

function wrapTextLosslessly(value, maxChars = 26, maxLines = 8) {
  const words = clean(value).split(' ').filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (word.length > maxChars) throw new Error(`vertical video renderer cannot losslessly wrap token longer than ${maxChars} characters`)
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxChars) line = candidate
    else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) throw new Error(`vertical video renderer requires upstream lossless pagination for copy exceeding ${maxLines} lines`)
  return lines
}

function formatSrtTime(seconds) {
  const milliseconds = Math.round(seconds * 1000)
  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const secs = Math.floor((milliseconds % 60_000) / 1000)
  const millis = milliseconds % 1000
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

function splitCaptionPayloadLosslessly(value) {
  const maxCharsPerLine = CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine
  const maxLines = CREATIVE_BRAND_TOKENS.typography.captionMaxLines
  const lines = wrapTextLosslessly(value, maxCharsPerLine, Number.POSITIVE_INFINITY)
  const chunks = []
  for (let index = 0; index < lines.length; index += maxLines) {
    chunks.push(lines.slice(index, index + maxLines))
  }
  return chunks
}

function buildSrt(scenes) {
  const cues = []
  for (const scene of scenes) {
    const voiceover = clean(scene.voiceover)
    if (!voiceover) continue
    const chunks = splitCaptionPayloadLosslessly(voiceover)
    const sceneDuration = scene.end - scene.start
    chunks.forEach((lines, chunkIndex) => {
      const start = roundMillis(scene.start + (sceneDuration * chunkIndex / chunks.length))
      const end = chunkIndex === chunks.length - 1
        ? scene.end
        : roundMillis(scene.start + (sceneDuration * (chunkIndex + 1) / chunks.length))
      cues.push({ start, end, text: lines.join('\n') })
    })
  }
  const rendered = cues.map((cue, index) => `${index + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}`)
  return `${rendered.join('\n\n')}\n`
}

function canonicalLosslessPages(section, name) {
  const pages = section?.pages
  if (!Array.isArray(pages) || pages.length === 0) throw new Error(`creative spec verticalVideo.losslessCopy.${name}.pages is required`)
  const normalized = pages.map((page, index) => {
    const content = clean(page?.content)
    if (!content) throw new Error(`${name} lossless page ${index + 1} is empty`)
    if (page?.truncationAllowed === true || page?.rewriteAllowed === true) throw new Error(`${name} lossless pages may not authorize truncation or rewrite`)
    return {
      content,
      factualAuthority: clean(page?.factualAuthority) || 'canonical-input',
      continuationIndex: Number(page?.index ?? index + 1),
      continuationTotal: Number(page?.total ?? pages.length),
    }
  })
  const reconstructed = clean(normalized.map((page) => page.content).join(' '))
  const source = clean(section?.sourceText ?? section?.original ?? section?.input ?? reconstructed)
  if (source && reconstructed !== source) throw new Error(`${name} lossless pages do not reconstruct their governed source text exactly`)
  return normalized
}

function validateIdentity(mediaPack, creativeSpec) {
  assertValidDistributionPack(mediaPack)
  if (creativeSpec?.claimSafetyStatus !== 'validated-lossless') throw new Error('creative spec must be validated-lossless before video packaging')
  const researchObjectId = clean(mediaPack.researchObjectIds?.[0])
  if (!researchObjectId || clean(creativeSpec?.sourceIdentity?.id) !== researchObjectId) throw new Error('creative spec source identity must match the validated media pack research object')
  if (clean(creativeSpec?.sourceIdentity?.sourceUrl) !== mediaPack.source.url || clean(creativeSpec?.delivery?.landingUrl) !== mediaPack.source.url) {
    throw new Error('creative spec source URL must match the validated media pack canonical source URL')
  }
  if (!clean(creativeSpec?.delivery?.disclosure)) throw new Error('creative spec governed disclosure is required')
  const video = creativeSpec?.verticalVideo
  if (!video || Number(video.durationSeconds) !== 30 || clean(video.format) !== '1080x1920') throw new Error('vertical video creative spec must define the canonical 30-second 1080x1920 profile')
  const canvas = video.canvas ?? CREATIVE_BRAND_TOKENS.canvas.vertical
  if (Number(canvas.width) !== 1080 || Number(canvas.height) !== 1920) throw new Error('vertical video canvas must be 1080x1920')
}

function buildTimeline(mediaPack, creativeSpec) {
  validateIdentity(mediaPack, creativeSpec)
  const contrastErrors = validateCreativeContrast()
  if (contrastErrors.length) throw new Error(`invalid brand contrast: ${contrastErrors.join('; ')}`)

  const video = creativeSpec.verticalVideo
  const findingPages = canonicalLosslessPages(video.losslessCopy?.finding, 'finding')
  const limitationPages = canonicalLosslessPages(video.losslessCopy?.limitation, 'limitation')
  const evidenceScene = video.scenes?.find((scene) => scene.role === 'evidence')
  const contextScene = video.scenes?.find((scene) => scene.role === 'context')
  const ctaScene = video.scenes?.find((scene) => scene.role === 'cta')
  const hookText = clean(video.firstTwoSecondHook)
  if (!hookText) throw new Error('vertical video firstTwoSecondHook is required')
  if (!clean(evidenceScene?.onScreenText) || !clean(evidenceScene?.voiceover)) throw new Error('governed evidence scene is required')
  if (!clean(contextScene?.onScreenText) || !clean(contextScene?.voiceover)) throw new Error('fixed disclosure context scene is required')
  if (!clean(ctaScene?.onScreenText) || !clean(ctaScene?.voiceover)) throw new Error('fixed CTA scene is required')

  const factual = [
    ...findingPages.map((page) => ({ role: 'finding', onScreenText: page.content, voiceover: page.content, factualAuthority: page.factualAuthority, colorTreatment: 'evidence', continuation: { index: page.continuationIndex, total: page.continuationTotal } })),
    { role: 'evidence', onScreenText: clean(evidenceScene.onScreenText), voiceover: clean(evidenceScene.voiceover), factualAuthority: clean(evidenceScene.factualAuthority) || 'canonical-input', colorTreatment: clean(evidenceScene.colorTreatment) || 'evidence' },
    ...limitationPages.map((page) => ({ role: 'limitation', onScreenText: page.content, voiceover: page.content, factualAuthority: page.factualAuthority, colorTreatment: 'primaryLight', continuation: { index: page.continuationIndex, total: page.continuationTotal } })),
  ]

  if (factual.length < 3 || factual.length > 9) throw new Error('lossless vertical video package supports 3-9 factual scenes inside the canonical 30-second timing budget')
  const factualDuration = Math.min(7, 23 / factual.length)
  if (factualDuration < 2.5) throw new Error('lossless factual scene count exceeds the canonical minimum scene duration')
  const factualTotal = factualDuration * factual.length
  const outroDuration = (28 - factualTotal) / 2
  if (outroDuration < 2.5 || outroDuration > 7) throw new Error('canonical 30-second timing budget cannot satisfy scene-duration guardrails')

  const scenes = [{
    role: 'hook', start: 0, end: 2, onScreenText: hookText, voiceover: hookText,
    factualAuthority: 'canonical-input', colorTreatment: 'primaryDark',
  }]
  let cursor = 2
  for (const scene of factual) {
    const start = roundMillis(cursor)
    cursor += factualDuration
    scenes.push({ ...scene, start, end: roundMillis(cursor) })
  }
  const contextStart = roundMillis(cursor)
  cursor += outroDuration
  scenes.push({
    role: 'context', start: contextStart, end: roundMillis(cursor),
    onScreenText: clean(contextScene.onScreenText), voiceover: clean(contextScene.voiceover),
    factualAuthority: clean(contextScene.factualAuthority) || 'fixed-disclosure',
    colorTreatment: clean(contextScene.colorTreatment) || 'disclosure',
  })
  scenes.push({
    role: 'cta', start: roundMillis(cursor), end: 30,
    onScreenText: clean(ctaScene.onScreenText), voiceover: clean(ctaScene.voiceover),
    factualAuthority: clean(ctaScene.factualAuthority) || 'fixed-cta',
    colorTreatment: clean(ctaScene.colorTreatment) || 'primaryDark',
  })

  const minimum = CREATIVE_BRAND_TOKENS.timing.minimumSceneSeconds
  const maximum = CREATIVE_BRAND_TOKENS.timing.maximumSceneSeconds
  for (const scene of scenes) {
    const duration = roundMillis(scene.end - scene.start)
    if (scene.role === 'hook') {
      if (duration !== CREATIVE_BRAND_TOKENS.timing.hookSeconds) throw new Error('hook must occupy exactly the canonical first two seconds')
    } else if (duration < minimum || duration > maximum) {
      throw new Error(`scene ${scene.role} violates canonical scene-duration guardrails`)
    }
  }
  if (scenes[0].start !== 0 || scenes.at(-1).end !== 30) throw new Error('vertical video timeline must cover exactly 30 seconds')
  for (let index = 1; index < scenes.length; index += 1) {
    if (scenes[index - 1].end !== scenes[index].start) throw new Error('vertical video timeline must be contiguous')
  }
  return scenes
}

function verticalPlatformIntersection() {
  const zones = Object.values(CREATIVE_BRAND_TOKENS.platformSafeZones)
    .filter((zone) => zone.format === 'vertical')
  return {
    top: Math.max(...zones.map((zone) => zone.top)),
    bottom: Math.max(...zones.map((zone) => zone.bottom)),
    left: Math.max(...zones.map((zone) => zone.left)),
    right: Math.max(...zones.map((zone) => zone.right)),
  }
}

export function renderVerticalVideoSceneSvg(scene, options = {}) {
  const canvas = CREATIVE_BRAND_TOKENS.canvas.vertical
  const { foreground, background } = treatment(scene.colorTreatment)
  const fontSize = Math.max(CREATIVE_BRAND_TOKENS.typography.minimumBodyPxAt1080, Number(options.fontSize ?? 44))
  const lines = wrapTextLosslessly(scene.onScreenText, options.maxChars ?? 26)
  const sourceUrl = clean(options.sourceUrl)
  const contentHash = clean(options.contentHash)
  const disclosure = clean(options.disclosure)
  if (!sourceUrl || !contentHash || !disclosure) throw new Error('sourceUrl, contentHash, and disclosure are required for video scene provenance')
  const safe = verticalPlatformIntersection()
  const x = safe.left
  const safeRight = canvas.width - safe.right
  const safeWidth = safeRight - x
  const contentTop = safe.top + 160
  const lineHeight = Math.ceil(fontSize * 1.42)
  const headline = lines.map((line, index) => `<text x="${x}" y="${contentTop + (index * lineHeight)}" font-size="${fontSize}" font-weight="700" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const disclosureY = canvas.height - safe.bottom - 70
  const provenanceY = canvas.height - safe.bottom - 26
  const metadata = JSON.stringify({
    sourceUrl,
    contentHash,
    factualAuthority: scene.factualAuthority,
    renderer: 'vertical-video-package-v1',
    role: scene.role,
    start: scene.start,
    end: scene.end,
    safeArea: { x, right: safeRight, width: safeWidth, top: safe.top, bottom: canvas.height - safe.bottom },
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-label="${escapeXml(`${scene.role} scene`)}"><rect width="100%" height="100%" fill="${background}"/><text x="${x}" y="${safe.top + 70}" font-size="32" font-weight="600" fill="${foreground}">The Hippie Scientist</text>${headline}<text x="${x}" y="${disclosureY}" font-size="24" fill="${foreground}" textLength="${safeWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(disclosure)}</text><text x="${x}" y="${provenanceY}" font-size="22" fill="${foreground}" textLength="${safeWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(sourceUrl)}</text><metadata>${escapeXml(metadata)}</metadata></svg>`
  return { svg, width: canvas.width, height: canvas.height, hash: sha256(`${svg}\n`) }
}

export function renderVerticalVideoPackage({ mediaPack, creativeSpec, outputDir }) {
  const scenes = buildTimeline(mediaPack, creativeSpec)
  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const disclosure = clean(creativeSpec.delivery.disclosure)

  const assets = scenes.map((scene, index) => {
    const rendered = renderVerticalVideoSceneSvg(scene, {
      sourceUrl: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
      disclosure,
    })
    const file = `video-scene-${String(index + 1).padStart(2, '0')}.svg`
    const bytes = `${rendered.svg}\n`
    fs.writeFileSync(path.join(dir, file), bytes)
    return {
      id: `video-scene-${index + 1}`,
      type: 'vertical-video-scene',
      format: 'svg',
      file,
      sha256: sha256(bytes),
      width: rendered.width,
      height: rendered.height,
      start: scene.start,
      end: scene.end,
      duration: roundMillis(scene.end - scene.start),
      role: scene.role,
      factualAuthority: scene.factualAuthority,
      sourceContentHash: mediaPack.source.contentHash,
      sourceUrl: mediaPack.source.url,
    }
  })

  const timeline = {
    schemaVersion: '1.0.0',
    renderer: 'vertical-video-package-v1',
    packId: mediaPack.packId,
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds: 30,
    scenes: assets.map(({ id, file, sha256: hash, start, end, duration, role, factualAuthority }) => ({ id, file, sha256: hash, start, end, duration, role, factualAuthority })),
  }
  const timelineBytes = `${JSON.stringify(timeline, null, 2)}\n`
  fs.writeFileSync(path.join(dir, 'video-timeline.json'), timelineBytes)

  const captions = buildSrt(scenes)
  fs.writeFileSync(path.join(dir, 'captions.srt'), captions)

  const manifest = {
    schemaVersion: '1.0.0',
    packId: mediaPack.packId,
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    renderer: 'vertical-video-package-v1',
    durationSeconds: 30,
    timeline: { file: 'video-timeline.json', sha256: sha256(timelineBytes) },
    captions: { file: 'captions.srt', sha256: sha256(captions), format: 'srt', lossless: true },
    assets,
  }
  fs.writeFileSync(path.join(dir, 'video-asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
