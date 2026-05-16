import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_WORKBOOK_RELATIVE_PATH = 'data-sources/herb_monograph_master.xlsx'

// Workbook path boundary for xlsx consumers: only trusted local files in the
// repository data source directory are valid. Never pass user uploads, request
// bodies, browser input, or remote URLs into workbook parsing. Runtime
// spreadsheet parsing needs a separately reviewed safer boundary.

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function getRepoRoot() {
  return path.resolve(__dirname, '..')
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value)
}

function isPathInside(parentDir, childPath) {
  const relativePath = path.relative(parentDir, childPath)
  return Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
}

export function resolveWorkbookPath(rootDir, options = {}) {
  const candidatePath =
    options.envPath ?? process.env.HERB_XLSX_PATH ?? DEFAULT_WORKBOOK_RELATIVE_PATH

  const normalizedCandidate = String(candidatePath).trim()
  if (!normalizedCandidate) {
    throw new Error('Invalid workbook path (empty paths are not allowed)')
  }

  if (isHttpUrl(normalizedCandidate)) {
    throw new Error(`Invalid workbook path (remote URLs are not allowed): ${normalizedCandidate}`)
  }

  const repoRoot = path.resolve(rootDir)
  const dataSourceDir = path.join(repoRoot, 'data-sources')
  const absolutePath = path.isAbsolute(normalizedCandidate)
    ? path.normalize(normalizedCandidate)
    : path.resolve(repoRoot, normalizedCandidate)

  if (!isPathInside(repoRoot, absolutePath)) {
    throw new Error(`Invalid workbook path (must stay inside repository): ${absolutePath}`)
  }

  if (!isPathInside(dataSourceDir, absolutePath)) {
    throw new Error(`Invalid workbook path (must stay inside data-sources): ${absolutePath}`)
  }

  console.log(`[workbook-source] Resolved: ${absolutePath}`)
  return absolutePath
}

export function assertWorkbookExists(absolutePath) {
  if (!path.isAbsolute(absolutePath)) {
    throw new Error(`Invalid workbook path (must be absolute): ${absolutePath}`)
  }

  if (!absolutePath.toLowerCase().endsWith('.xlsx')) {
    throw new Error(`Invalid workbook extension (expected .xlsx): ${absolutePath}`)
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Workbook file does not exist: ${absolutePath}`)
  }

  const stats = fs.statSync(absolutePath)
  if (!stats.isFile()) {
    throw new Error(`Workbook path is not a file: ${absolutePath}`)
  }

  return true
}
