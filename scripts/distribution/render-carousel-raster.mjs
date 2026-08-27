import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function assertSvgParent(asset, outputDir) {
  if (asset?.type !== 'carousel-slide' || asset?.format !== 'svg' || !asset?.file || !asset?.sha256) {
    throw new Error('raster exporter requires canonical SVG carousel assets')
  }
  const svgPath = path.resolve(outputDir, asset.file)
  if (!fs.existsSync(svgPath)) throw new Error(`missing SVG parent: ${asset.file}`)
  const bytes = fs.readFileSync(svgPath)
  if (sha256(bytes) !== asset.sha256) throw new Error(`SVG parent hash mismatch: ${asset.file}`)
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
    const { bytes: svgBytes } = assertSvgParent(parent, dir)
    for (const format of uniqueFormats) {
      const rasterBytes = await rasterize(svgBytes, format)
      const file = parent.file.replace(/\.svg$/i, `.${format}`)
      fs.writeFileSync(path.join(dir, file), rasterBytes)
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
