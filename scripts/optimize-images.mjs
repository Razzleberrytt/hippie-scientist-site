#!/usr/bin/env node
/**
 * Build-time image optimizer.
 * Converts local raster images to responsive WebP variants under
 * public/images/optimized/ while mirroring source directories so paths remain
 * deterministic and collision-free.
 *
 * Default mode scans all raster images for the manual `npm run build:images`
 * workflow. Production uses `--monograph-registry`, which derives the required
 * image set from the canonical featured-image registry plus explicit local image
 * overrides in the built monograph runtime data.
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --monograph-registry
 *   npm run build:images
 */

import { createRequire } from 'node:module'
import { readdir, mkdir, access, rm, readFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const INPUT_DIR = path.join(repoRoot, 'public', 'images')
const OUTPUT_DIR = path.join(INPUT_DIR, 'optimized')
const MONOGRAPH_REGISTRY = path.join(repoRoot, 'lib', 'monograph-images.ts')
const RUNTIME_DATA_DIR = path.join(repoRoot, 'public', 'data')
const WIDTHS = [400, 800, 1200]
const QUALITY = 85
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.avif', '.tif', '.tiff', '.webp'])
const EXPLICIT_IMAGE_FIELDS = new Set(['image', 'imageUrl', 'og', 'thumbnail'])
const LOCAL_RASTER_RE = /^\/images\/(?!optimized\/)(.+)\.(jpe?g|png|gif|avif|tiff?|webp)$/i
const registryOnly = process.argv.includes('--monograph-registry')

async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function getImageFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (path.resolve(fullPath) === path.resolve(OUTPUT_DIR)) continue
      files.push(...await getImageFiles(fullPath))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (SUPPORTED_EXTS.has(ext)) files.push(fullPath)
  }
  return files
}

async function getJsonFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await getJsonFiles(fullPath))
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath)
  }
  return files
}

function collectExplicitLocalRasterPaths(value, output) {
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    for (const item of value) collectExplicitLocalRasterPaths(item, output)
    return
  }

  for (const [key, child] of Object.entries(value)) {
    if (EXPLICIT_IMAGE_FIELDS.has(key) && typeof child === 'string' && LOCAL_RASTER_RE.test(child.trim())) {
      output.add(child.trim())
    }
    if (child && typeof child === 'object') collectExplicitLocalRasterPaths(child, output)
  }
}

async function collectRuntimeExplicitImagePaths() {
  const paths = new Set()
  const files = [
    path.join(RUNTIME_DATA_DIR, 'herbs.json'),
    path.join(RUNTIME_DATA_DIR, 'compounds.json'),
    ...await getJsonFiles(path.join(RUNTIME_DATA_DIR, 'herbs-detail')),
    ...await getJsonFiles(path.join(RUNTIME_DATA_DIR, 'compounds-detail')),
  ]

  for (const filePath of files) {
    if (!(await pathExists(filePath))) continue
    try {
      const parsed = JSON.parse(await readFile(filePath, 'utf8'))
      collectExplicitLocalRasterPaths(parsed, paths)
    } catch (err) {
      throw new Error(`Unable to inspect monograph image fields in ${path.relative(repoRoot, filePath)}: ${err.message}`)
    }
  }

  return paths
}

async function resolveLocalImagePaths(publicPaths) {
  const imagePaths = new Set()
  const missing = []
  const inputRoot = path.resolve(INPUT_DIR)

  for (const publicPath of publicPaths) {
    if (!LOCAL_RASTER_RE.test(publicPath)) continue
    const inputPath = path.join(repoRoot, 'public', publicPath.replace(/^\//, ''))
    const resolved = path.resolve(inputPath)

    if (!resolved.startsWith(`${inputRoot}${path.sep}`)) {
      throw new Error(`Monograph image resolved outside public/images: ${publicPath}`)
    }
    if (!(await pathExists(inputPath))) {
      missing.push(publicPath)
      continue
    }
    imagePaths.add(inputPath)
  }

  if (missing.length) {
    throw new Error(`Monograph data references missing local raster image(s): ${missing.join(', ')}`)
  }

  return [...imagePaths].sort()
}

async function getMonographRegistryImageFiles() {
  const source = await readFile(MONOGRAPH_REGISTRY, 'utf8')
  const literalPattern = /['"](\/images\/(?!optimized\/)[^'"]+\.(?:jpe?g|png|gif|avif|tiff?|webp))['"]/gi
  const publicPaths = new Set()

  for (const match of source.matchAll(literalPattern)) {
    publicPaths.add(match[1])
  }

  const explicitRuntimePaths = await collectRuntimeExplicitImagePaths()
  for (const publicPath of explicitRuntimePaths) publicPaths.add(publicPath)

  if (publicPaths.size === 0) {
    throw new Error('No local raster monograph image sources were discovered from the registry/runtime data')
  }

  return resolveLocalImagePaths(publicPaths)
}

async function optimizeImage(sharp, inputPath) {
  const relativePath = path.relative(INPUT_DIR, inputPath)
  const relativeDir = path.dirname(relativePath)
  const basename = path.basename(inputPath, path.extname(inputPath))
  const outputDir = path.join(OUTPUT_DIR, relativeDir)
  const results = []

  await mkdir(outputDir, { recursive: true })

  for (const width of WIDTHS) {
    const outputName = `${basename}-${width}w.webp`
    const outputPath = path.join(outputDir, outputName)

    await sharp(inputPath, { animated: false })
      .rotate()
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath)

    results.push(path.relative(OUTPUT_DIR, outputPath).split(path.sep).join('/'))
  }

  return results
}

async function main() {
  const start = performance.now()

  if (!(await pathExists(INPUT_DIR))) {
    console.log('[optimize-images] public/images/ not found — skipping (no images to optimize).')
    return
  }

  const files = registryOnly
    ? await getMonographRegistryImageFiles()
    : await getImageFiles(INPUT_DIR)

  if (files.length === 0) {
    console.log('[optimize-images] No supported images found in public/images/ — skipping.')
    return
  }

  // Derived assets are reproducible. Rebuild the directory from source so
  // deleted/renamed originals cannot leave stale variants behind.
  await rm(OUTPUT_DIR, { recursive: true, force: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  const require = createRequire(import.meta.url)
  let sharp
  try {
    sharp = require('sharp')
  } catch (err) {
    console.error('[optimize-images] sharp not available — install it with: npm install --save-dev sharp')
    console.error(err.message)
    process.exit(1)
  }

  let totalGenerated = 0
  let failed = 0
  for (const inputPath of files) {
    const rel = path.relative(repoRoot, inputPath)
    try {
      const outputs = await optimizeImage(sharp, inputPath)
      totalGenerated += outputs.length
      console.log(`[optimize-images] ${rel} → ${outputs.join(', ')}`)
    } catch (err) {
      failed += 1
      console.error(`[optimize-images] ERROR: failed to process ${rel}: ${err.message}`)
    }
  }

  if (failed > 0) {
    throw new Error(`${failed} source image(s) failed optimization`)
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(2)
  const scope = registryOnly ? 'monograph-sources' : 'all-images'
  console.log(`[optimize-images] Done (${scope}). ${files.length} source image(s) → ${totalGenerated} WebP output(s) in ${elapsed}s.`)
}

main().catch(err => {
  console.error('[optimize-images] Fatal error:', err)
  process.exit(1)
})
