#!/usr/bin/env node
/**
 * Build-time image optimizer.
 * Converts images in public/images/ to WebP at responsive sizes for faster page loads.
 * Output goes to public/images/optimized/ — committed to the repo alongside originals.
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   npm run build:images
 */

import { createRequire } from 'node:module'
import { readdir, mkdir, access } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const INPUT_DIR = path.join(repoRoot, 'public', 'images')
const OUTPUT_DIR = path.join(repoRoot, 'public', 'images', 'optimized')
const WIDTHS = [400, 800, 1200]
const QUALITY = 85
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.avif', '.tiff', '.webp'])

async function dirExists(dirPath) {
  try {
    await access(dirPath)
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
    if (entry.isDirectory()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (SUPPORTED_EXTS.has(ext)) {
      files.push(path.join(dir, entry.name))
    }
  }
  return files
}

async function optimizeImage(sharp, inputPath, outputDir) {
  const basename = path.basename(inputPath, path.extname(inputPath))
  const results = []

  for (const width of WIDTHS) {
    const outputName = `${basename}-${width}w.webp`
    const outputPath = path.join(outputDir, outputName)

    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath)

    results.push(outputName)
  }

  return results
}

async function main() {
  const start = performance.now()

  if (!(await dirExists(INPUT_DIR))) {
    console.log('[optimize-images] public/images/ not found — skipping (no images to optimize).')
    return
  }

  const files = await getImageFiles(INPUT_DIR)
  if (files.length === 0) {
    console.log('[optimize-images] No supported images found in public/images/ — skipping.')
    return
  }

  await mkdir(OUTPUT_DIR, { recursive: true })

  // Use createRequire so this ESM file can load sharp (CJS package)
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
  for (const inputPath of files) {
    const rel = path.relative(repoRoot, inputPath)
    try {
      const outputs = await optimizeImage(sharp, inputPath, OUTPUT_DIR)
      totalGenerated += outputs.length
      console.log(`[optimize-images] ${rel} → ${outputs.join(', ')}`)
    } catch (err) {
      console.warn(`[optimize-images] WARN: failed to process ${rel}: ${err.message}`)
    }
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(2)
  console.log(`[optimize-images] Done. ${files.length} source image(s) → ${totalGenerated} WebP output(s) in ${elapsed}s.`)
}

main().catch(err => {
  console.error('[optimize-images] Fatal error:', err)
  process.exit(1)
})
