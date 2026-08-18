#!/usr/bin/env node
/**
 * Build-time image optimizer.
 * Converts local raster images to responsive WebP variants under
 * public/images/optimized/ while mirroring source directories so paths remain
 * deterministic and collision-free.
 *
 * Default mode scans all raster images for the manual `npm run build:images`
 * workflow. Production uses `--monograph-registry` so we generate only the
 * images referenced by the canonical monograph image registry.
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
const WIDTHS = [400, 800, 1200]
const QUALITY = 85
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.avif', '.tif', '.tiff', '.webp'])
const registryOnly = process.argv.includes('--monograph-registry')

async function dirExists(dirPath) {
  try {
    await access(dirPath)
    return true
  } catch {
    return false
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath)
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

async function getMonographRegistryImageFiles() {
  const source = await readFile(MONOGRAPH_REGISTRY, 'utf8')
  const srcPattern = /\bsrc:\s*['"](\/images\/[^'"]+\.(?:jpe?g|png|gif|avif|tiff?|webp))['"]/gi
  const imagePaths = new Set()

  for (const match of source.matchAll(srcPattern)) {
    const publicPath = match[1]
    const inputPath = path.join(repoRoot, 'public', publicPath.replace(/^\//, ''))
    const resolved = path.resolve(inputPath)

    if (!resolved.startsWith(`${path.resolve(INPUT_DIR)}${path.sep}`)) {
      throw new Error(`Registry image resolved outside public/images: ${publicPath}`)
    }
    if (!SUPPORTED_EXTS.has(path.extname(inputPath).toLowerCase())) continue
    imagePaths.add(inputPath)
  }

  if (imagePaths.size === 0) {
    throw new Error(`No local raster image sources found in ${path.relative(repoRoot, MONOGRAPH_REGISTRY)}`)
  }

  const missing = []
  for (const inputPath of imagePaths) {
    if (!(await fileExists(inputPath))) missing.push(path.relative(repoRoot, inputPath))
  }
  if (missing.length) {
    throw new Error(`Monograph registry references missing local image(s): ${missing.join(', ')}`)
  }

  return [...imagePaths].sort()
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

  if (!(await dirExists(INPUT_DIR))) {
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
  const scope = registryOnly ? 'monograph-registry' : 'all-images'
  console.log(`[optimize-images] Done (${scope}). ${files.length} source image(s) → ${totalGenerated} WebP output(s) in ${elapsed}s.`)
}

main().catch(err => {
  console.error('[optimize-images] Fatal error:', err)
  process.exit(1)
})
