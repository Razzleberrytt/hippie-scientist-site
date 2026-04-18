import path from 'node:path'

const DEFAULT_WORKBOOK_RELATIVE_PATH = 'data-sources/thehippiescientist_icariin_epimedium_brevicornum_unlock.xlsx'

export function resolveWorkbookPath(rootDir, { envPath = process.env.HERB_XLSX_PATH } = {}) {
  if (typeof envPath === 'string' && envPath.trim()) {
    return path.resolve(rootDir, envPath.trim())
  }

  return path.resolve(rootDir, DEFAULT_WORKBOOK_RELATIVE_PATH)
}