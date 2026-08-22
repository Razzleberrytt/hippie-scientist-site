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
import { readdir, mkdir, access, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const INPUT_DIR = path.join(repoRoot, 'public', 'images')
const OUTPUT_DIR = path.join(repoRoot, 'public', 'images', 'optimized')
const MANIFEST_PATH = path.join(repoRoot, 'lib', 'generated', 'optimized-images.json')

/** Variants actually re-encoded this run; the rest were already fresh. */
let reencoded = 0
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

/**
 * Walk `public/images/` recursively.
 *
 * This used to `continue` on every directory, so only the two images sitting at
 * the top level were ever optimized and the 213 under `guides/` and
 * `monographs/photos/` were silently skipped — including every profile hero.
 * `optimized/` is excluded so repeated runs do not re-encode their own output.
 */
async function getImageFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (full === OUTPUT_DIR) continue
      files.push(...(await getImageFiles(full)))
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (SUPPORTED_EXTS.has(ext)) {
      files.push(full)
    }
  }
  return files
}

/**
 * Emit WebP variants for one source image, mirroring its path under
 * `optimized/` so `guides/ashwagandha-herb.jpg` becomes
 * `optimized/guides/ashwagandha-herb-800w.webp` and two images with the same
 * basename in different folders cannot overwrite each other.
 *
 * Returns the widths that were actually written. `withoutEnlargement` means a
 * source narrower than a requested width yields the same pixels at that width,
 * so the variant is still emitted and remains safe to serve.
 */
async function optimizeImage(sharp, inputPath) {
  const relFromInput = path.relative(INPUT_DIR, inputPath)
  const relDir = path.dirname(relFromInput)
  const basename = path.basename(inputPath, path.extname(inputPath))
  const outputDir = path.join(OUTPUT_DIR, relDir === '.' ? '' : relDir)
  await mkdir(outputDir, { recursive: true })

  // Re-encoding 215 images takes ~40s, and this now runs in every build path
  // that renders pages. Skip any variant already newer than its source so
  // repeat builds are effectively free while a changed image still rebuilds.
  const sourceMtime = (await stat(inputPath)).mtimeMs
  const widths = []
  for (const width of WIDTHS) {
    const outputPath = path.join(outputDir, `${basename}-${width}w.webp`)

    let fresh = false
    try {
      fresh = (await stat(outputPath)).mtimeMs >= sourceMtime
    } catch {
      fresh = false
    }

    if (!fresh) {
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outputPath)
      reencoded += 1
    }

    widths.push(width)
  }

  const publicSrc = `/images/${relFromInput.split(path.sep).join('/')}`
  return { publicSrc, widths }
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
  const failures = []
  /** @type {Record<string, number[]>} */
  const manifest = {}

  for (const inputPath of files) {
    const rel = path.relative(repoRoot, inputPath)
    try {
      const { publicSrc, widths } = await optimizeImage(sharp, inputPath)
      totalGenerated += widths.length
      manifest[publicSrc] = widths
    } catch (err) {
      failures.push(rel)
      console.warn(`[optimize-images] WARN: failed to process ${rel}: ${err.message}`)
    }
  }

  // The loader rewrites an image to its WebP variant only if that variant is in
  // this manifest, so a source that failed to encode keeps serving the original
  // rather than 404ing.
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
  await writeFile(MANIFEST_PATH, `${JSON.stringify(ordered, null, 2)}
`, 'utf8')

  const elapsed = ((performance.now() - start) / 1000).toFixed(2)
  console.log(
    `[optimize-images] Done. ${files.length} source image(s) → ${totalGenerated} WebP output(s) (${reencoded} re-encoded) in ${elapsed}s.`,
  )
  console.log(`[optimize-images] Manifest: ${path.relative(repoRoot, MANIFEST_PATH)} (${Object.keys(ordered).length} images)`)

  // A run that silently optimizes nothing is how this pipeline stayed broken.
  if (Object.keys(ordered).length === 0) {
    console.error('[optimize-images] FAILED: no images were optimized.')
    process.exit(1)
  }
  if (failures.length > files.length / 10) {
    console.error(`[optimize-images] FAILED: ${failures.length} of ${files.length} images failed to encode.`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('[optimize-images] Fatal error:', err)
  process.exit(1)
})
