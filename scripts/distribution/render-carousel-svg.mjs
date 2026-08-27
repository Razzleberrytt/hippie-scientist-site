import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { CREATIVE_BRAND_TOKENS, validateCreativeContrast } from './creative-spec.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const escapeXml = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function wrapText(value, maxChars = 34) {
  const words = clean(value).split(' ').filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (word.length > maxChars) throw new Error(`carousel renderer cannot losslessly wrap token longer than ${maxChars} characters`)
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
  const bodyLines = slide.body ? wrapText(slide.body, options.bodyMaxChars ?? 38) : []
  const sourceUrl = clean(options.sourceUrl)
  const contentHash = clean(options.contentHash)
  if (!sourceUrl || !contentHash) throw new Error('sourceUrl and contentHash are required for rendered asset provenance')

  const headline = headlineLines.map((line, index) => `<text x="80" y="${360 + (index * 76)}" font-size="58" font-weight="700" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const bodyStart = 360 + (headlineLines.length * 76) + 80
  const body = bodyLines.map((line, index) => `<text x="80" y="${bodyStart + (index * 58)}" font-size="42" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-label="${escapeXml(slide.eyebrow || slide.role)}"><rect width="100%" height="100%" fill="${background}"/><text x="80" y="180" font-size="34" font-weight="600" fill="${foreground}">${escapeXml(slide.eyebrow || '')}</text>${headline}${body}<text x="80" y="1220" font-size="28" fill="${foreground}">The Hippie Scientist · ${escapeXml(sourceUrl)}</text><metadata>${escapeXml(JSON.stringify({ contentHash, sourceUrl, factualAuthority: 'validated-distribution-pack', renderer: 'carousel-svg-v1' }))}</metadata></svg>`
  return { svg, hash: sha256(svg), width: canvas.width, height: canvas.height }
}

export function renderCarouselAssets({ mediaPack, creativeSpec, outputDir }) {
  if (!mediaPack?.source?.contentHash || !mediaPack?.source?.url) throw new Error('validated media pack source provenance is required')
  if (!creativeSpec?.carousel?.slides?.length) throw new Error('creativeSpec.carousel.slides is required')
  if (creativeSpec.claimSafetyStatus !== 'validated-lossless') throw new Error('creative spec must be validated-lossless before rendering')
  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const assets = creativeSpec.carousel.slides.map((slide, index) => {
    const rendered = renderCarouselSlideSvg(slide, { sourceUrl: mediaPack.source.url, contentHash: mediaPack.source.contentHash })
    const file = `carousel-${String(index + 1).padStart(2, '0')}.svg`
    fs.writeFileSync(path.join(dir, file), `${rendered.svg}\n`)
    return { id: `carousel-${index + 1}`, type: 'carousel-slide', format: 'svg', file, sha256: rendered.hash, width: rendered.width, height: rendered.height, sourceContentHash: mediaPack.source.contentHash, sourceUrl: mediaPack.source.url }
  })
  const manifest = { schemaVersion: '1.0.0', packId: mediaPack.packId, sourceContentHash: mediaPack.source.contentHash, renderer: 'carousel-svg-v1', assets }
  fs.writeFileSync(path.join(dir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
