import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_WORKBOOK_RELATIVE_PATH = 'data-sources/herb_monograph_master.xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function getRepoRoot() {
  return path.resolve(__dirname, '..')
}

function isRemoteWorkbookPath(value) {
  return /^https?:\/\//i.test(String(value || '').trim())
}

export function resolveWorkbookPath(rootDir, options = {}) {
  const candidatePath =
    options.envPath ?? process.env.HERB_XLSX_PATH ?? DEFAULT_WORKBOOK_RELATIVE_PATH

  const normalizedCandidate = String(candidatePath || '').trim()

  if (!normalizedCandidate) {
    throw new Error('Workbook path cannot be empty')
  }

  // xlsx parsing is restricted to trusted local filesystem inputs.
  // Do not allow workbook parsing from remote URLs, uploads, browser
  // input, request bodies, or other runtime-controlled sources.
  if (isRemoteWorkbookPath(normalizedCandidate)) {
    throw new Error(`Remote workbook URLs are not allowed: ${normalizedCandidate}`)
  }

  const absolutePath = path.isAbsolute(normalizedCandidate)
    ? path.normalize(normalizedCandidate)
    : path.resolve(rootDir, normalizedCandidate)

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
