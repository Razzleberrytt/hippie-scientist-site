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

const { glob } = globPkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')
const cacheDir = path.join(projectRoot, '.build-cache')

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

  for (const pattern of patterns) {
    const fullPattern = path.join(baseDir, pattern)
    const matches = await glob(fullPattern, { absolute: true, nodir: true })
    // Ensure matches is an array before spreading
    if (Array.isArray(matches)) {
      files.push(...matches)
    }
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
    .update(JSON.stringify(config, null, 2))
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
    const combinedHash = `${currentInputHash}:${currentConfigHash}`

    const cached = this.manifest[stepName]

    if (!cached) {
      // First time running this step
      return true
    }

    const isCacheValid = cached.inputHash === combinedHash && cached.outputHash

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
      outputs: outputPatterns,
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
    console.log(`\n📦 Build Cache Status (${count} steps cached):\n`)

    Object.entries(this.manifest).forEach(([step, info]) => {
      const ts = new Date(info.timestamp)
      const ago = this._timeAgo(ts)
      console.log(`  ${step}`)
      console.log(`    Input Hash: ${info.inputHash}`)
      console.log(`    Cached: ${ago}`)
    })
  }

  _timeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2]
  const cache = new CacheManager()

  switch (cmd) {
    case 'clear':
      cache.clearAll()
      break
    case 'status':
      cache.printStatus()
      break
    case 'clear-step':
      cache.clearStep(process.argv[3])
      console.log(`✓ Cleared cache for: ${process.argv[3]}`)
      break
    default:
      console.log(`
Build Cache Manager

Usage:
  node build-cache-manager.mjs <command>

Commands:
  status          Show cache status
  clear           Clear all cached data
  clear-step      Clear cache for a specific step
      `)
  }
}
