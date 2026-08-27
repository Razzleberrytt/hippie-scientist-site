import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const CANONICAL_SVG_FILE = /^carousel-\d{2,}\.svg$/

function decodeXml(value) {
  return value.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

function embeddedProvenance(bytes) {
  const svg = bytes.toString('utf8')
  const match = svg.match(/<metadata>([\s\S]*?)<\/metadata>/)
  if (!match) throw new Error('SVG parent is missing authenticated provenance metadata')
  let metadata
  try { metadata = JSON.parse(decodeXml(match[1])) } catch { throw new Error('SVG parent provenance metadata is invalid') }
  if (metadata?.renderer !== 'carousel-svg-v1' || !metadata?.contentHash || !metadata?.sourceUrl) {
    throw new Error('SVG parent provenance metadata is incomplete')
  }
  return metadata
}

function canonicalAssetPath(outputDir, file) {
  if (typeof file !== 'string' || !CANONICAL_SVG_FILE.test(file) || path.basename(file) !== file) {
    throw new Error(`noncanonical SVG parent filename: ${String(file)}`)
  }
  const root = path.resolve(outputDir)
  const resolved = path.resolve(root, file)
  if (path.dirname(resolved) !== root) throw new Error(`SVG parent escapes output directory: ${file}`)
  return resolved
}

function assertSvgParent(asset, outputDir, manifest) {
  if (asset?.type !== 'carousel-slide' || asset?.format !== 'svg' || !asset?.file || !asset?.sha256) {
    throw new Error('raster exporter requires canonical SVG carousel assets')
  }
  const svgPath = canonicalAssetPath(outputDir, asset.file)
  if (!fs.existsSync(svgPath)) throw new Error(`missing SVG parent: ${asset.file}`)
  const bytes = fs.readFileSync(svgPath)
  if (sha256(bytes) !== asset.sha256) throw new Error(`SVG parent hash mismatch: ${asset.file}`)
  const provenance = embeddedProvenance(bytes)
  if (provenance.contentHash !== manifest.sourceContentHash || provenance.contentHash !== asset.sourceContentHash || provenance.sourceUrl !== asset.sourceUrl) {
    throw new Error(`SVG parent provenance mismatch: ${asset.file}`)
  }
  return { svgPath, bytes }
}

function assertManifest(manifest) {
  if (!manifest?.packId || !manifest?.sourceContentHash || manifest?.renderer !== 'carousel-svg-v1' || !Array.isArray(manifest.assets)) {
    throw new Error('raster exporter requires a carousel-svg-v1 asset manifest')
  }
  for (const asset of manifest.assets) {
    if (asset.sourceContentHash !== manifest.sourceContentHash || !asset.sourceUrl) {
      throw new Error('SVG asset provenance must match the source manifest')
    }
  }
}

async function rasterize(svgBytes, format) {
  const pipeline = sharp(svgBytes, { density: 96, failOn: 'error' }).rotate()
  if (format === 'png') return pipeline.png({ compressionLevel: 9, adaptiveFiltering: false, palette: false }).toBuffer()
  if (format === 'webp') return pipeline.webp({ quality: 92, alphaQuality: 100, smartSubsample: false, effort: 6 }).toBuffer()
  throw new Error(`unsupported raster format: ${format}`)
}

export async function renderCarouselRasterAssets({ manifest, outputDir, formats = ['png', 'webp'] }) {
  assertManifest(manifest)
  const uniqueFormats = [...new Set(formats)]
  if (!uniqueFormats.length || uniqueFormats.some((format) => !['png', 'webp'].includes(format))) {
    throw new Error('formats must contain only png and/or webp')
  }

  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const assets = []

  for (const parent of manifest.assets) {
    const { bytes: svgBytes } = assertSvgParent(parent, dir, manifest)
    for (const format of uniqueFormats) {
      const rasterBytes = await rasterize(svgBytes, format)
      const file = parent.file.replace(/\.svg$/i, `.${format}`)
      const outputPath = path.resolve(dir, file)
      if (path.dirname(outputPath) !== dir) throw new Error(`raster output escapes output directory: ${file}`)
      fs.writeFileSync(outputPath, rasterBytes)
      assets.push({
        id: `${parent.id}-${format}`,
        type: 'carousel-slide-raster',
        format,
        file,
        sha256: sha256(rasterBytes),
        width: parent.width,
        height: parent.height,
        sourceContentHash: manifest.sourceContentHash,
        sourceUrl: parent.sourceUrl,
        parentSvgSha256: parent.sha256,
        parentSvgFile: parent.file,
        exporter: 'carousel-raster-v1',
      })
    }
  }

  const derivedManifest = {
    schemaVersion: '1.0.0',
    packId: manifest.packId,
    sourceContentHash: manifest.sourceContentHash,
    parentRenderer: manifest.renderer,
    exporter: 'carousel-raster-v1',
    assets,
  }
  fs.writeFileSync(path.join(dir, 'raster-asset-manifest.json'), `${JSON.stringify(derivedManifest, null, 2)}\n`)
  return derivedManifest
}
