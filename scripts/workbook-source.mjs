import path from 'node:path'

const DEFAULT_WORKBOOK_RELATIVE_PATH = 'data-sources/herb_monograph_master.xlsx'

export function resolveWorkbookPath(rootDir, { envPath = process.env.HERB_XLSX_PATH } = {}) {
  let resolvedPath

  if (typeof envPath === 'string' && envPath.trim()) {
    resolvedPath = path.resolve(rootDir, envPath.trim())
  } else {
    resolvedPath = path.resolve(rootDir, DEFAULT_WORKBOOK_RELATIVE_PATH)
  }

  console.log(`[workbook-source] Resolved workbook path: ${resolvedPath}`)
  return resolvedPath
}
