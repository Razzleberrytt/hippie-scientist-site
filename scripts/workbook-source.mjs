import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_WORKBOOK_CANDIDATES = [
  'data-sources/herb_monograph_master_updated_pass15.xlsx',
  'data-sources/herb_monograph_master.xlsx',
]

export function resolveWorkbookPath(rootDir, { envPath = process.env.HERB_XLSX_PATH } = {}) {
  if (typeof envPath === 'string' && envPath.trim()) {
    return path.resolve(rootDir, envPath.trim())
  }

  for (const relativePath of DEFAULT_WORKBOOK_CANDIDATES) {
    const candidate = path.resolve(rootDir, relativePath)
    if (fs.existsSync(candidate)) return candidate
  }

  return path.resolve(rootDir, DEFAULT_WORKBOOK_CANDIDATES[0])
}
