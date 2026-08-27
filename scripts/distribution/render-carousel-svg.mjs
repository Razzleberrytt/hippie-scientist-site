import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { CREATIVE_BRAND_TOKENS, validateCreativeContrast } from './creative-spec.mjs'
import { assertValidDistributionPack } from './distribution-pack-contract.mjs'

// Presentation-only boundary: factual authority remains the validated media pack and
// validated-lossless creative spec. This renderer may wrap/layout text, never rewrite it.
// Long non-URL tokens fail closed; URL-only wrapping is a layout exception that preserves bytes.
// Deterministic output intentionally excludes timestamps, random IDs, and provider-generated metadata.
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const escapeXml = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function isUrlToken(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function wrapText(value, maxChars = 34, options = {}) {
  const words = clean(value).split(' ').filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (word.length > maxChars) {
      if (!options.allowUrlTokens || !isUrlToken(word)) {
        throw new Error(`carousel renderer cannot losslessly wrap token longer than ${maxChars} characters`)
      }
      if (line) {
        lines.push(line)
        line = ''
      }
      for (let offset = 0; offset < word.length; offset += maxChars) lines.push(word.slice(offset, offset + maxChars))
      continue
    }
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxChars) line = candidate
    else { lines.push(line); line = word }
  }
  if (line) lines.push(line)
  if (lines.length > 8) throw new Error('carousel renderer requires upstream lossless pagination for copy exceeding eight lines')
  return lines
}

function treatment(name) {
  const token = CREATIVE_BRAND_TOKENS.color.treatments[name]
  if (!token) throw new Error(`unknown color treatment: ${name}`)
  return {
    foreground: CREATIVE_BRAND_TOKENS.color.palette[token.foreground],
    background: CREATIVE_BRAND_TOKENS.color.palette[token.background],
  }
}

export function renderCarouselSlideSvg(slide, options = {}) {
  const contrastErrors = validateCreativeContrast()
  if (contrastErrors.length) throw new Error(`invalid brand contrast: ${contrastErrors.join('; ')}`)
  const canvas = CREATIVE_BRAND_TOKENS.canvas.portrait
  const { foreground, background } = treatment(slide.colorTreatment)
  const headlineLines = wrapText(slide.headline || '', options.headlineMaxChars ?? 32)
  const bodyLines = slide.body
    ? wrapText(slide.body, options.bodyMaxChars ?? 38, { allowUrlTokens: slide.role === 'source' })
    : []
  const sourceUrl = clean(options.sourceUrl)
  const contentHash = clean(options.contentHash)
  const disclosure = clean(options.disclosure)
  if (!sourceUrl || !contentHash) throw new Error('sourceUrl and contentHash are required for rendered asset provenance')
  if (!disclosure) throw new Error('governed disclosure is required for rendered assets')

  const headline = headlineLines.map((line, index) => `<text x="80" y="${360 + (index * 76)}" font-size="58" font-weight="700" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const bodyStart = 360 + (headlineLines.length * 76) + 80
  const body = bodyLines.map((line, index) => `<text x="80" y="${bodyStart + (index * 58)}" font-size="42" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const safeBottomY = canvas.height - canvas.safeBottom
  const disclosureY = safeBottomY - 58
  const provenanceY = safeBottomY - 18
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-label="${escapeXml(slide.eyebrow || slide.role)}"><rect width="100%" height="100%" fill="${background}"/><text x="80" y="180" font-size="34" font-weight="600" fill="${foreground}">${escapeXml(slide.eyebrow || '')}</text>${headline}${body}<text x="80" y="${disclosureY}" font-size="24" fill="${foreground}">${escapeXml(disclosure)}</text><text x="80" y="${provenanceY}" font-size="22" fill="${foreground}">The Hippie Scientist · ${escapeXml(sourceUrl)}</text><metadata>${escapeXml(JSON.stringify({ contentHash, sourceUrl, factualAuthority: 'validated-distribution-pack', renderer: 'carousel-svg-v1' }))}</metadata></svg>`
  return { svg, hash: sha256(`${svg}\n`), width: canvas.width, height: canvas.height }
}

export function renderCarouselAssets({ mediaPack, creativeSpec, outputDir }) {
  assertValidDistributionPack(mediaPack)
  if (!creativeSpec?.carousel?.slides?.length) throw new Error('creativeSpec.carousel.slides is required')
  if (creativeSpec.claimSafetyStatus !== 'validated-lossless') throw new Error('creative spec must be validated-lossless before rendering')

  const canonicalResearchObjectId = mediaPack.researchObjectIds?.[0]
  const creativeSourceId = clean(creativeSpec.sourceIdentity?.id)
  const creativeSourceUrl = clean(creativeSpec.sourceIdentity?.sourceUrl)
  if (!creativeSourceId || creativeSourceId !== canonicalResearchObjectId) {
    throw new Error('creative spec source identity must match the validated media pack research object')
  }
  if (!creativeSourceUrl || creativeSourceUrl !== mediaPack.source.url || clean(creativeSpec.delivery?.landingUrl) !== mediaPack.source.url) {
    throw new Error('creative spec source URL must match the validated media pack canonical source URL')
  }

  const disclosure = clean(creativeSpec.delivery?.disclosure)
  if (!disclosure) throw new Error('creative spec governed disclosure is required')

  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const assets = creativeSpec.carousel.slides.map((slide, index) => {
    const rendered = renderCarouselSlideSvg(slide, {
      sourceUrl: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
      disclosure,
    })
    const file = `carousel-${String(index + 1).padStart(2, '0')}.svg`
    const fileBytes = `${rendered.svg}\n`
    fs.writeFileSync(path.join(dir, file), fileBytes)
    return { id: `carousel-${index + 1}`, type: 'carousel-slide', format: 'svg', file, sha256: sha256(fileBytes), width: rendered.width, height: rendered.height, sourceContentHash: mediaPack.source.contentHash, sourceUrl: mediaPack.source.url }
  })
  const manifest = { schemaVersion: '1.0.0', packId: mediaPack.packId, sourceContentHash: mediaPack.source.contentHash, renderer: 'carousel-svg-v1', assets }
  fs.writeFileSync(path.join(dir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
