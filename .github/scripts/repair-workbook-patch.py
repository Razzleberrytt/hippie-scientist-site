from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


runner_path = Path('scripts/data/apply-workbook-patch.mjs')
runner = runner_path.read_text()

runner = replace_once(
    runner,
    "import { fileURLToPath } from 'node:url'\nimport { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'",
    "import { fileURLToPath } from 'node:url'\nimport JSZip from 'jszip'\nimport { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'",
    'add JSZip import',
)

namespace_helpers = r'''
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeRelationshipXml(xml) {
  const rootMatch = xml.match(/<([A-Za-z_][\w.-]*):Relationships\b/)
  if (!rootMatch) return xml

  const prefix = escapeRegExp(rootMatch[1])
  return xml
    .replace(new RegExp(`<(/?)${prefix}:Relationships\\b`, 'g'), '<$1Relationships')
    .replace(new RegExp(`<(/?)${prefix}:Relationship\\b`, 'g'), '<$1Relationship')
    .replace(new RegExp(`\\sxmlns:${prefix}=`, 'g'), ' xmlns=')
}

function normalizeSpreadsheetMainXml(xml) {
  const namespaceMatch = xml.match(
    /xmlns:([A-Za-z_][\w.-]*)="http:\/\/schemas\.openxmlformats\.org\/spreadsheetml\/2006\/main"/,
  )
  if (!namespaceMatch) return xml

  const prefix = escapeRegExp(namespaceMatch[1])
  return xml
    .replace(new RegExp(`<(/?)${prefix}:`, 'g'), '<$1')
    .replace(new RegExp(`\\sxmlns:${prefix}=`, 'g'), ' xmlns=')
}

async function createNormalizedWorkbookCopy(filePath) {
  const source = fs.readFileSync(filePath)
  const zip = await JSZip.loadAsync(source)
  let changedFiles = 0

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue

    let normalizeXml = null
    if (entry.name.endsWith('.rels')) {
      normalizeXml = normalizeRelationshipXml
    } else if (entry.name.startsWith('xl/') && entry.name.endsWith('.xml')) {
      normalizeXml = normalizeSpreadsheetMainXml
    }
    if (!normalizeXml) continue

    const xml = await entry.async('string')
    const normalized = normalizeXml(xml)
    if (normalized === xml) continue

    zip.file(entry.name, normalized)
    changedFiles += 1
  }

  if (changedFiles === 0) return null

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hippie-workbook-normalized-'))
  const tempPath = path.join(tempDir, path.basename(filePath))
  const output = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
  fs.writeFileSync(tempPath, output)

  return { tempDir, tempPath, changedFiles }
}
'''.strip()

runner = replace_once(
    runner,
    "const SCHEMA_VALIDATOR = path.join(repoRoot, 'scripts/ci/validate-workbook-schema.mjs')\n\nconst PATCH_STATUSES",
    "const SCHEMA_VALIDATOR = path.join(repoRoot, 'scripts/ci/validate-workbook-schema.mjs')\n\n" + namespace_helpers + "\n\nconst PATCH_STATUSES",
    'insert namespace normalization helpers',
)

runner = replace_once(
    runner,
    'function applyPatch({ patch, changes, workbookPath, outPath, inPlace, approveHumanReview, entitySheet }) {',
    'async function applyPatch({ patch, changes, workbookPath, outPath, inPlace, approveHumanReview, entitySheet }) {',
    'make applyPatch async',
)

runner = replace_once(
    runner,
    """  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hippie-workbook-patch-'))
  let currentInput = workbookPath
  try {
    for (const [index, change] of changes.entries()) {""",
    """  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hippie-workbook-patch-'))
  let normalizedCopy = null
  let currentInput = workbookPath
  try {
    normalizedCopy = await createNormalizedWorkbookCopy(workbookPath)
    if (normalizedCopy) {
      currentInput = normalizedCopy.tempPath
      console.log(
        `[workbook-patch] Normalized namespace-prefixed OOXML in ${normalizedCopy.changedFiles} file(s) before writing`,
      )
    }

    for (const [index, change] of changes.entries()) {""",
    'normalize source workbook before surgical edits',
)

runner = replace_once(
    runner,
    """  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}""",
    """  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
    if (normalizedCopy) fs.rmSync(normalizedCopy.tempDir, { recursive: true, force: true })
  }
}""",
    'clean normalized workbook copy',
)

runner = replace_once(
    runner,
    """  applyPatch({
    patch,""",
    """  await applyPatch({
    patch,""",
    'await applyPatch',
)

runner_path.write_text(runner)
