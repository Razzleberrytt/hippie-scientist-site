#!/usr/bin/env node

/**
 * Build Cache Manager
 *
 * Implements deterministic hashing of inputs to skip expensive build steps
 * when inputs haven't changed.
 *
 * Usage:
 *   import { CacheManager } from './build-cache-manager.mjs'
 *   const cache = new CacheManager()
 *
 *   // Check if step needs to run
 *   const shouldRun = await cache.shouldRunStep('build-runtime-from-workbook', ['workbook.xlsx', 'data/*.json'])
 *
 *   // Mark step as complete
 *   await cache.markStepComplete('build-runtime-from-workbook', outputFiles)
 */

import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import globPkg from 'glob'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')
const cacheDir = path.join(projectRoot, '.build-cache')
const CACHE_VERSION = 2

function arrayish(value) {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === '') return []
  return [value]
}

/**
 * Deterministic hash of file contents
 */
function hashFile(filePath) {
  const content = fs.readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Deterministic hash of multiple files
 */
async function hashFiles(patterns, baseDir = projectRoot) {
  const files = []

  for (const pattern of arrayish(patterns)) {
    const cleanPattern = String(pattern || '').trim()
    if (!cleanPattern) continue
    const fullPattern = path.join(baseDir, cleanPattern)
    const matches = globPkg.sync(fullPattern, { absolute: true, nodir: true })
    files.push(...matches)
  }

  // Sort for deterministic order
  files.sort()

  const hashes = files.map(f => {
    try {
      return `${f}:${hashFile(f)}`
    } catch {
      return `${f}:NOT_FOUND`
    }
  })

  return createHash('sha256')
    .update(hashes.join('\n'))
    .digest('hex')
    .substring(0, 16)
}

/**
 * Hash of configuration/dependencies
 */
function hashConfig(config) {
  return createHash('sha256')
    .update(JSON.stringify({ cacheVersion: CACHE_VERSION, ...config }, null, 2))
    .digest('hex')
    .substring(0, 16)
}

export class CacheManager {
  constructor() {
    this.cacheDir = cacheDir
    this.manifestPath = path.join(cacheDir, 'manifest.json')

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    this.manifest = this._loadManifest()
  }

  _loadManifest() {
    if (fs.existsSync(this.manifestPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'))
      } catch {
        return {}
      }
    }
    return {}
  }

  _saveManifest() {
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2))
  }

  /**
   * Check if a build step should run
   * Returns false if inputs haven't changed
   */
  async shouldRunStep(stepName, inputPatterns = [], config = {}) {
    const currentInputHash = await hashFiles(inputPatterns)
    const currentConfigHash = hashConfig(config)

    const cached = this.manifest[stepName]

    if (!cached) {
      // First time running this step
      return true
    }

    const isCacheValid =
      cached.inputHash === currentInputHash &&
      cached.configHash === currentConfigHash &&
      cached.outputHash

    if (isCacheValid) {
      console.log(`✓ [CACHE HIT] ${stepName}`)
      return false
    }

    console.log(`⚠️ [CACHE MISS] ${stepName}`)
    return true
  }

  /**
   * Mark a step as complete and cache its outputs
   */
  async markStepComplete(stepName, outputPatterns = [], inputPatterns = [], config = {}) {
    const inputHash = await hashFiles(inputPatterns)
    const configHash = hashConfig(config)
    const outputHash = await hashFiles(outputPatterns)

    this.manifest[stepName] = {
      timestamp: new Date().toISOString(),
      inputHash,
      configHash,
      outputHash,
      outputs: arrayish(outputPatterns),
    }

    this._saveManifest()
  }

  /**
   * Get cache info for a step
   */
  getCacheInfo(stepName) {
    return this.manifest[stepName] || null
  }

  /**
   * Clear cache for a specific step
   */
  clearStep(stepName) {
    delete this.manifest[stepName]
    this._saveManifest()
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.manifest = {}
    this._saveManifest()
    console.log('✓ Build cache cleared')
  }

  /**
   * Print cache status
   */
  printStatus() {
    const count = Object.keys(this.manifest).length
    console.log(`Build cache: ${count} cached steps`)
    for (const [step, info] of Object.entries(this.manifest)) {
      console.log(`  ${step}: ${info.timestamp}`)
    }
  }
}

// CLI Execution
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].endsWith('build-cache-manager.mjs'))) {
  const manager = new CacheManager()
  const cmd = process.argv[2]
  if (cmd === 'clear') {
    manager.clearAll()
  } else if (cmd === 'status') {
    manager.printStatus()
  } else if (cmd === 'clear-step') {
    const step = process.argv[3]
    if (!step) {
      console.error('Error: Please specify a step name.')
      process.exit(1)
    }
    manager.clearStep(step)
    console.log(`✓ Cleared cache for step: ${step}`)
  } else {
    console.log('Build Cache Manager')
    console.log('Usage:')
    console.log('  node scripts/cache/build-cache-manager.mjs status')
    console.log('  node scripts/cache/build-cache-manager.mjs clear')
    console.log('  node scripts/cache/build-cache-manager.mjs clear-step <stepName>')
  }
}
