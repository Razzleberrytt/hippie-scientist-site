import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { CREATIVE_BRAND_TOKENS, validateCreativeContrast } from './creative-spec.mjs'
import { assertValidDistributionPack } from './distribution-pack-contract.mjs'
import { buildAssetProvenance, hashStableValue } from './asset-provenance.mjs'

// Presentation-only boundary: factual authority remains the validated media pack and
// validated-lossless creative spec. This renderer may wrap/layout text, never rewrite it.
// Long non-URL tokens fail closed; URL-only wrapping is a layout exception that preserves bytes.
// Deterministic output intentionally excludes timestamps, random IDs, provider metadata, and publish state.
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const escapeXml = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const RENDERER_VERSION = 'carousel-svg-v2'
const TEMPLATE_VERSION = 'carousel-editorial-v2'

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

function buildAccessibleDescription(slide, { sourceUrl, disclosure }) {
  const parts = [slide.headline, slide.body, disclosure, `Source: ${sourceUrl}`]
    .map(clean)
    .filter(Boolean)
  return parts.join(' ')
}

function rolePresentation(slide) {
  const role = clean(slide?.role).toLowerCase()
  if (role === 'hook') return { marker: 'EVIDENCE CHECK', headlineSize: 68, headlineLeading: 82, startY: 390, showSwipe: true }
  if (role === 'finding') return { marker: 'WHAT THE STUDIES SHOW', headlineSize: 56, headlineLeading: 70, startY: 370, showSwipe: false }
  if (role === 'limitation') return { marker: 'THE CATCH', headlineSize: 56, headlineLeading: 70, startY: 370, showSwipe: false }
  if (role === 'source') return { marker: 'SOURCE TRAIL', headlineSize: 62, headlineLeading: 76, startY: 370, showSwipe: false }
  return { marker: 'EVIDENCE NOTE', headlineSize: 58, headlineLeading: 72, startY: 370, showSwipe: false }
}

function decorativeScienceMotif({ foreground, accent, canvas }) {
  return [
    `<rect x="0" y="0" width="18" height="${canvas.height}" fill="${accent}"/>`,
    `<circle cx="930" cy="165" r="142" fill="${accent}" opacity="0.11"/>`,
    `<circle cx="930" cy="165" r="84" fill="none" stroke="${foreground}" stroke-width="3" opacity="0.16"/>`,
    `<circle cx="930" cy="165" r="18" fill="${foreground}" opacity="0.22"/>`,
    `<circle cx="804" cy="130" r="9" fill="${foreground}" opacity="0.34"/>`,
    `<circle cx="850" cy="248" r="7" fill="${accent}" opacity="0.72"/>`,
    `<path d="M804 130 L872 158 L850 248" fill="none" stroke="${foreground}" stroke-width="3" opacity="0.16"/>`,
    `<circle cx="1040" cy="1180" r="220" fill="${accent}" opacity="0.08"/>`,
  ].join('')
}

export function renderCarouselSlideSvg(slide, options = {}) {
  const contrastErrors = validateCreativeContrast()
  if (contrastErrors.length) throw new Error(`invalid brand contrast: ${contrastErrors.join('; ')}`)
  const canvas = CREATIVE_BRAND_TOKENS.canvas.portrait
  const { foreground, background } = treatment(slide.colorTreatment)
  const accent = CREATIVE_BRAND_TOKENS.color.palette.terracotta
  const presentation = rolePresentation(slide)
  const headlineLines = wrapText(slide.headline || '', options.headlineMaxChars ?? 32)
  const bodyLines = slide.body
    ? wrapText(slide.body, options.bodyMaxChars ?? 38, { allowUrlTokens: slide.role === 'source' })
    : []
  const sourceUrl = clean(options.sourceUrl)
  const contentHash = clean(options.contentHash)
  const disclosure = clean(options.disclosure)
  const factualProvenanceFingerprint = clean(options.factualProvenanceFingerprint)
  if (!sourceUrl || !contentHash) throw new Error('sourceUrl and contentHash are required for rendered asset provenance')
  if (!disclosure) throw new Error('governed disclosure is required for rendered assets')

  const accessibleTitle = clean(slide.eyebrow || slide.role || 'Evidence card')
  const accessibleDescription = buildAccessibleDescription(slide, { sourceUrl, disclosure })
  if (!accessibleDescription) throw new Error('carousel slide accessibility description is required')

  const eyebrow = clean(slide.eyebrow || presentation.marker)
  const eyebrowWidth = Math.min(720, Math.max(210, (eyebrow.length * 18) + 58))
  const headline = headlineLines.map((line, index) => `<text x="80" y="${presentation.startY + (index * presentation.headlineLeading)}" font-size="${presentation.headlineSize}" font-weight="760" letter-spacing="-1.5" fill="${foreground}">${escapeXml(line)}</text>`).join('')
  const bodyStart = presentation.startY + (headlineLines.length * presentation.headlineLeading) + 62
  const body = bodyLines.map((line, index) => `<text x="80" y="${bodyStart + (index * 56)}" font-size="42" font-weight="450" fill="${foreground}" opacity="0.88">${escapeXml(line)}</text>`).join('')
  const safeBottomY = canvas.height - canvas.safeBottom
  const disclosureY = safeBottomY - 58
  const provenanceY = safeBottomY - 18
  const swipeHint = presentation.showSwipe
    ? `<text x="80" y="1010" font-size="27" font-weight="700" letter-spacing="1.4" fill="${foreground}" opacity="0.76">SWIPE FOR THE EVIDENCE →</text>`
    : ''
  const continuation = slide?.continuation?.total > 1
    ? `<text x="990" y="112" text-anchor="end" font-size="24" font-weight="650" fill="${foreground}" opacity="0.66">${escapeXml(`${slide.continuation.index}/${slide.continuation.total}`)}</text>`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-labelledby="slide-title slide-desc"><title id="slide-title">${escapeXml(accessibleTitle)}</title><desc id="slide-desc">${escapeXml(accessibleDescription)}</desc><rect width="100%" height="100%" fill="${background}"/>${decorativeScienceMotif({ foreground, accent, canvas })}<g font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"><text x="80" y="102" font-size="24" font-weight="760" letter-spacing="3.2" fill="${foreground}" opacity="0.78">THE HIPPIE SCIENTIST</text>${continuation}<rect x="80" y="154" width="${eyebrowWidth}" height="54" rx="27" fill="${foreground}" opacity="0.08"/><circle cx="108" cy="181" r="7" fill="${accent}"/><text x="130" y="190" font-size="25" font-weight="700" letter-spacing="0.8" fill="${foreground}">${escapeXml(eyebrow)}</text><rect x="56" y="278" width="968" height="720" rx="40" fill="none" stroke="${foreground}" stroke-width="2" opacity="0.10"/>${headline}${body}${swipeHint}<line x1="80" y1="${safeBottomY - 104}" x2="1000" y2="${safeBottomY - 104}" stroke="${foreground}" stroke-width="2" opacity="0.12"/><text x="80" y="${disclosureY}" font-size="24" fill="${foreground}" opacity="0.78">${escapeXml(disclosure)}</text><text x="80" y="${provenanceY}" font-size="22" fill="${foreground}" opacity="0.70">The Hippie Scientist · ${escapeXml(sourceUrl)}</text></g><metadata>${escapeXml(JSON.stringify({ contentHash, sourceUrl, factualProvenanceFingerprint: factualProvenanceFingerprint || null, factualAuthority: 'validated-distribution-pack', renderer: RENDERER_VERSION, templateVersion: TEMPLATE_VERSION }))}</metadata></svg>`
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

  const creativeSpecHash = hashStableValue(creativeSpec)
  const provenance = buildAssetProvenance({
    mediaPack,
    renderer: RENDERER_VERSION,
    templateVersion: TEMPLATE_VERSION,
    creativeSpecHash,
  })
  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const assets = creativeSpec.carousel.slides.map((slide, index) => {
    const rendered = renderCarouselSlideSvg(slide, {
      sourceUrl: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
      factualProvenanceFingerprint: provenance.factualProvenanceFingerprint,
      disclosure,
    })
    const file = `carousel-${String(index + 1).padStart(2, '0')}.svg`
    const fileBytes = `${rendered.svg}\n`
    fs.writeFileSync(path.join(dir, file), fileBytes)
    return {
      id: `carousel-${index + 1}`,
      type: 'carousel-slide',
      format: 'svg',
      file,
      sha256: sha256(fileBytes),
      width: rendered.width,
      height: rendered.height,
      sourceContentHash: mediaPack.source.contentHash,
      sourceUrl: mediaPack.source.url,
      factualProvenanceFingerprint: provenance.factualProvenanceFingerprint,
      presentationFingerprint: provenance.presentationFingerprint,
    }
  })
  const manifest = {
    schemaVersion: '1.1.0',
    packId: mediaPack.packId,
    ...provenance,
    assets,
  }
  fs.writeFileSync(path.join(dir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
