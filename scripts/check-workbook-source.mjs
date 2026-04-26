import { assertWorkbookExists, getRepoRoot, resolveWorkbookPath } from './workbook-source.mjs'

try {
  const rootDir = getRepoRoot()
  const workbookPath = resolveWorkbookPath(rootDir)
  assertWorkbookExists(workbookPath)
  console.log(`WORKBOOK_SOURCE_OK — workbook found at ${workbookPath}`)
  process.exit(0)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exit(1)
}
