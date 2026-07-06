#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'

const DEFAULT_WORKBOOK = 'data-sources/herb_monograph_master.xlsx'
const ENTITY_SHEET_NAME = 'Entity_Master'
const REQUIRED_FIELDS = new Set([
  'entity_type',
  'slug',
  'name',
  'summary',
  'primary_effects_or_targets',
  'evidence_tier',
  'runtime_export_decision',
  'profile_status',
])
const RUNTIME_EXPORT_DECISIONS = new Set([
  '',
  'full_public_runtime',
  'primary_runtime_priority',
  'publish',
  'publishable',
  'ready',
  'limited',
  'hidden_until_grounded',
  'research_archive_runtime',
  'hide',
  'hidden',
  'blocked',
  'block',
  'alias_redirect_only',
])
const PROFILE_STATUSES = new Set([
  '',
  'complete',
  'near_complete',
  'top50_authority_patched',
  'commercial_ready',
  'partial',
  'moderate',
  'minimal',
  'research_only',
  'weak',
  'thin',
  'stub',
  'research_needed',
  'none',
])

function usage(exitCode = 0) {
  const stream = exitCode === 0 ? process.stdout : process.stderr
  stream.write(`Targeted Entity_Master XLSX cell editor\n\nUsage:\n  node scripts/data/edit-entity-master-cell.mjs --slug nac --column summary --value "..." --dry-run\n  node scripts/data/edit-entity-master-cell.mjs --slug nac --column summary --value "..." --out /tmp/edited.xlsx\n  node scripts/data/edit-entity-master-cell.mjs --roundtrip --out /tmp/roundtrip.xlsx\n\nOptions:\n  --workbook <path>  Workbook path. Default: ${DEFAULT_WORKBOOK}\n  --slug <slug>      Entity_Master slug to edit. Required unless --roundtrip is used.\n  --column <name>    Entity_Master column to edit. Required unless --roundtrip is used.\n  --value <value>    New cell value. Required unless --roundtrip is used.\n  --out <path>       Output workbook path. Required for writes unless --in-place is used.\n  --in-place         Replace the workbook atomically through a temporary file.\n  --dry-run          Print the target cell and proposed value without writing.\n  --roundtrip        Repack the workbook without changing Entity_Master values. Requires --out.\n  --help             Show this help.\n`)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const args = {
    workbook: DEFAULT_WORKBOOK,
    slug: '',
    column: '',
    value: undefined,
    out: '',
    dryRun: false,
    inPlace: false,
    roundtrip: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const nextValue = () => {
      index += 1
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`)
      return argv[index]
    }

    switch (arg) {
      case '--help':
      case '-h':
        usage(0)
        break
      case '--workbook':
        args.workbook = nextValue()
        break
      case '--slug':
        args.slug = nextValue()
        break
      case '--column':
        args.column = nextValue()
        break
      case '--value':
        args.value = nextValue()
        break
      case '--out':
        args.out = nextValue()
        break
      case '--dry-run':
        args.dryRun = true
        break
      case '--in-place':
        args.inPlace = true
        break
      case '--roundtrip':
        args.roundtrip = true
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (args.roundtrip) {
    if (!args.out) throw new Error('--roundtrip requires --out')
    return args
  }

  if (!args.slug) throw new Error('--slug is required')
  if (!args.column) throw new Error('--column is required')
  if (args.value == null) throw new Error('--value is required')
  if (!args.dryRun && !args.out && !args.inPlace) throw new Error('Writes require --out or --in-place. Use --dry-run to inspect only.')
  if (args.out && args.inPlace) throw new Error('Use either --out or --in-place, not both.')

  return args
}

function fail(message) {
  throw new Error(`[edit-entity-master-cell] ${message}`)
}

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function normalizeHeader(value) {
  return normalize(value)
}

function normalizeSlug(value) {
  return normalize(value).toLowerCase()
}

function decodeXmlEntities(value) {
  return String(value ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function encodeXmlText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function encodeXmlAttribute(value) {
  return encodeXmlText(value).replace(/"/g, '&quot;')
}

function getAttribute(xml, name) {
  const pattern = new RegExp(`\\b${name.replace(':', ':')}="([^"]*)"`)
  const match = xml.match(pattern)
  return match ? decodeXmlEntities(match[1]) : ''
}

function columnNameToNumber(columnName) {
  let total = 0
  for (const char of String(columnName || '').toUpperCase()) {
    if (char < 'A' || char > 'Z') fail(`Invalid column reference: ${columnName}`)
    total = total * 26 + (char.charCodeAt(0) - 64)
  }
  return total
}

function columnNumberToName(columnNumber) {
  let number = columnNumber
  let name = ''
  while (number > 0) {
    const remainder = (number - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    number = Math.floor((number - 1) / 26)
  }
  return name
}

function parseCellRef(ref) {
  const match = String(ref || '').match(/^([A-Z]+)(\d+)$/i)
  if (!match) fail(`Invalid cell reference: ${ref}`)
  return { columnName: match[1].toUpperCase(), column: columnNameToNumber(match[1]), row: Number(match[2]) }
}

const CRC_TABLE = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  CRC_TABLE[index] = crc >>> 0
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear())
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { dosTime, dosDate }
}

function findEndOfCentralDirectory(buffer) {
  const min = Math.max(0, buffer.length - 0xffff - 22)
  for (let offset = buffer.length - 22; offset >= min; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset
  }
  fail('Could not find ZIP end-of-central-directory record')
}

function readZip(filePath) {
  const buffer = fs.readFileSync(filePath)
  const eocd = findEndOfCentralDirectory(buffer)
  const entriesCount = buffer.readUInt16LE(eocd + 10)
  const centralOffset = buffer.readUInt32LE(eocd + 16)
  const entries = []
  let offset = centralOffset

  for (let index = 0; index < entriesCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) fail(`Invalid ZIP central directory at offset ${offset}`)
    const flags = buffer.readUInt16LE(offset + 8)
    const method = buffer.readUInt16LE(offset + 10)
    const modTime = buffer.readUInt16LE(offset + 12)
    const modDate = buffer.readUInt16LE(offset + 14)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const uncompressedSize = buffer.readUInt32LE(offset + 24)
    const fileNameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const externalAttrs = buffer.readUInt32LE(offset + 38)
    const localOffset = buffer.readUInt32LE(offset + 42)
    const name = buffer.slice(offset + 46, offset + 46 + fileNameLength).toString('utf8')

    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) fail(`Invalid ZIP local header for ${name}`)
    const localNameLength = buffer.readUInt16LE(localOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localOffset + 28)
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength
    const compressed = buffer.slice(dataOffset, dataOffset + compressedSize)
    let data
    if (method === 0) data = compressed
    else if (method === 8) data = zlib.inflateRawSync(compressed)
    else fail(`Unsupported ZIP compression method ${method} for ${name}`)

    if (data.length !== uncompressedSize) fail(`Uncompressed size mismatch for ${name}`)
    entries.push({ name, flags, method, modTime, modDate, externalAttrs, data })
    offset += 46 + fileNameLength + extraLength + commentLength
  }

  return entries
}

function writeZip(entries, filePath) {
  const localParts = []
  const centralParts = []
  let offset = 0
  const now = dosDateTime()

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8')
    const directory = entry.name.endsWith('/')
    const method = directory ? 0 : 8
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data)
    const compressed = method === 0 ? data : zlib.deflateRawSync(data)
    const crc = crc32(data)
    const modTime = entry.modTime || now.dosTime
    const modDate = entry.modDate || now.dosDate

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0x0800, 6)
    localHeader.writeUInt16LE(method, 8)
    localHeader.writeUInt16LE(modTime, 10)
    localHeader.writeUInt16LE(modDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(compressed.length, 18)
    localHeader.writeUInt32LE(data.length, 22)
    localHeader.writeUInt16LE(nameBuffer.length, 26)
    localHeader.writeUInt16LE(0, 28)
    localParts.push(localHeader, nameBuffer, compressed)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0x0800, 8)
    centralHeader.writeUInt16LE(method, 10)
    centralHeader.writeUInt16LE(modTime, 12)
    centralHeader.writeUInt16LE(modDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(compressed.length, 20)
    centralHeader.writeUInt32LE(data.length, 24)
    centralHeader.writeUInt16LE(nameBuffer.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(entry.externalAttrs || 0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    centralParts.push(centralHeader, nameBuffer)

    offset += localHeader.length + nameBuffer.length + compressed.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralDirectory.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)

  fs.writeFileSync(filePath, Buffer.concat([...localParts, centralDirectory, eocd]))
}

function entriesByName(entries) {
  return new Map(entries.map((entry) => [entry.name, entry]))
}

function getXml(entryMap, entryName) {
  const entry = entryMap.get(entryName)
  if (!entry) fail(`Missing XLSX part: ${entryName}`)
  return entry.data.toString('utf8')
}

function setXml(entryMap, entryName, xml) {
  const entry = entryMap.get(entryName)
  if (!entry) fail(`Missing XLSX part: ${entryName}`)
  entry.data = Buffer.from(xml, 'utf8')
}

function parseRelationships(xml) {
  const rels = new Map()
  for (const match of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const tag = match[0]
    const id = getAttribute(tag, 'Id')
    const target = getAttribute(tag, 'Target')
    if (id && target) rels.set(id, target)
  }
  return rels
}

function locateEntityMasterWorksheet(entryMap) {
  const workbookXml = getXml(entryMap, 'xl/workbook.xml')
  const relsXml = getXml(entryMap, 'xl/_rels/workbook.xml.rels')
  const rels = parseRelationships(relsXml)

  for (const sheetMatch of workbookXml.matchAll(/<sheet\b[^>]*>/g)) {
    const tag = sheetMatch[0]
    const name = getAttribute(tag, 'name')
    if (name !== ENTITY_SHEET_NAME) continue
    const relId = getAttribute(tag, 'r:id')
    const target = rels.get(relId)
    if (!target) fail(`Workbook sheet ${ENTITY_SHEET_NAME} references ${relId}, but that relationship is missing`)
    const normalized = target.startsWith('/') ? target.slice(1) : target.startsWith('xl/') ? target : `xl/${target}`
    if (!entryMap.has(normalized)) fail(`Workbook sheet ${ENTITY_SHEET_NAME} points to missing worksheet part: ${normalized}`)
    return normalized
  }

  fail(`Workbook sheet ${ENTITY_SHEET_NAME} is missing`)
}

function parseSharedStrings(entryMap) {
  const entry = entryMap.get('xl/sharedStrings.xml')
  if (!entry) return []
  const xml = entry.data.toString('utf8')
  const strings = []
  for (const match of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
    const inner = match[1]
    const parts = [...inner.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXmlEntities(part[1]))
    strings.push(parts.join(''))
  }
  return strings
}

function getCellValue(cellXml, sharedStrings) {
  const type = getAttribute(cellXml, 't')
  if (type === 's') {
    const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/)
    const index = Number(valueMatch ? valueMatch[1] : NaN)
    return Number.isFinite(index) ? sharedStrings[index] ?? '' : ''
  }
  if (type === 'inlineStr') {
    const parts = [...cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXmlEntities(part[1]))
    return parts.join('')
  }
  const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/)
  return valueMatch ? decodeXmlEntities(valueMatch[1]) : ''
}

function parseRows(sheetXml, sharedStrings) {
  const rows = []
  for (const rowMatch of sheetXml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*(?:>[\s\S]*?<\/row>|\/>)/g)) {
    const rowXml = rowMatch[0]
    const rowNumber = Number(rowMatch[1])
    const cells = new Map()
    for (const cellMatch of rowXml.matchAll(/<c\b[^>]*\br="([A-Z]+\d+)"[^>]*(?:\/>|>[\s\S]*?<\/c>)/g)) {
      const cellXml = cellMatch[0]
      const ref = cellMatch[1]
      const parsed = parseCellRef(ref)
      cells.set(parsed.column, { ref, column: parsed.column, xml: cellXml, value: getCellValue(cellXml, sharedStrings) })
    }
    rows.push({ rowNumber, xml: rowXml, cells, start: rowMatch.index, end: rowMatch.index + rowXml.length })
  }
  return rows
}

function getHeaderMap(rows) {
  const headerRow = rows.find((row) => row.rowNumber === 1)
  if (!headerRow) fail(`${ENTITY_SHEET_NAME} is missing header row 1`)
  const headers = new Map()
  for (const [column, cell] of headerRow.cells.entries()) {
    const header = normalizeHeader(cell.value)
    if (!header) continue
    headers.set(header, column)
  }
  return headers
}

function validateProposedValue(column, value) {
  const normalizedColumn = normalizeHeader(column)
  const normalizedValue = normalize(value)

  if (REQUIRED_FIELDS.has(normalizedColumn) && !normalizedValue) {
    fail(`Refusing to blank required field ${normalizedColumn}`)
  }

  if (normalizedColumn === 'runtime_export_decision') {
    const decision = normalizedValue.toLowerCase()
    if (!RUNTIME_EXPORT_DECISIONS.has(decision)) {
      fail(`Invalid runtime_export_decision "${value}". Allowed: ${[...RUNTIME_EXPORT_DECISIONS].filter(Boolean).join(', ')}`)
    }
  }

  if (normalizedColumn === 'profile_status') {
    const status = normalizedValue.toLowerCase()
    if (!PROFILE_STATUSES.has(status)) {
      fail(`Invalid profile_status "${value}". Allowed: ${[...PROFILE_STATUSES].filter(Boolean).join(', ')}`)
    }
  }
}

function makeInlineStringCell(ref, value, existingCellXml = '') {
  const style = getAttribute(existingCellXml, 's')
  const preserve = /^\s|\s$/.test(String(value ?? '')) ? ' xml:space="preserve"' : ''
  const styleAttr = style ? ` s="${encodeXmlAttribute(style)}"` : ''
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t${preserve}>${encodeXmlText(value)}</t></is></c>`
}

function patchRowCell(rowXml, rowNumber, targetColumn, value) {
  const targetColumnName = columnNumberToName(targetColumn)
  const targetRef = `${targetColumnName}${rowNumber}`
  const cellRegex = /<c\b[^>]*\br="([A-Z]+\d+)"[^>]*(?:\/>|>[\s\S]*?<\/c>)/g
  const cells = [...rowXml.matchAll(cellRegex)]
  const existing = cells.find((match) => match[1].toUpperCase() === targetRef)
  const replacement = makeInlineStringCell(targetRef, value, existing?.[0] || '')

  if (existing) {
    return rowXml.slice(0, existing.index) + replacement + rowXml.slice(existing.index + existing[0].length)
  }

  for (const match of cells) {
    const parsed = parseCellRef(match[1])
    if (parsed.column > targetColumn) {
      return rowXml.slice(0, match.index) + replacement + rowXml.slice(match.index)
    }
  }

  if (rowXml.endsWith('/>')) {
    return rowXml.replace(/\/>$/, `>${replacement}</row>`)
  }

  return rowXml.replace(/<\/row>$/, `${replacement}</row>`)
}

function patchSheetXml(sheetXml, row, targetColumn, value) {
  const patchedRow = patchRowCell(row.xml, row.rowNumber, targetColumn, value)
  return sheetXml.slice(0, row.start) + patchedRow + sheetXml.slice(row.end)
}

function findTargetRow(rows, slugColumn, wantedSlug) {
  const matches = []
  for (const row of rows) {
    if (row.rowNumber === 1) continue
    const slug = normalizeSlug(row.cells.get(slugColumn)?.value)
    if (!slug) continue
    if (slug === wantedSlug) matches.push(row)
  }

  if (matches.length === 0) fail(`Slug not found in ${ENTITY_SHEET_NAME}: ${wantedSlug}`)
  if (matches.length > 1) fail(`Duplicate slug in ${ENTITY_SHEET_NAME}: ${wantedSlug} appears on rows ${matches.map((row) => row.rowNumber).join(', ')}`)
  return matches[0]
}

function editCell({ workbookPath, slug, column, value, dryRun }) {
  const entries = readZip(workbookPath)
  const entryMap = entriesByName(entries)
  const worksheetPath = locateEntityMasterWorksheet(entryMap)
  const sharedStrings = parseSharedStrings(entryMap)
  const sheetXml = getXml(entryMap, worksheetPath)
  const rows = parseRows(sheetXml, sharedStrings)
  const headers = getHeaderMap(rows)
  const slugColumn = headers.get('slug')
  if (!slugColumn) fail(`${ENTITY_SHEET_NAME} is missing required slug column`)

  const normalizedColumn = normalizeHeader(column)
  const targetColumn = headers.get(normalizedColumn)
  if (!targetColumn) fail(`${ENTITY_SHEET_NAME} is missing target column: ${normalizedColumn}`)
  validateProposedValue(normalizedColumn, value)

  const wantedSlug = normalizeSlug(slug)
  const targetRow = findTargetRow(rows, slugColumn, wantedSlug)
  const targetCell = targetRow.cells.get(targetColumn)
  const oldValue = targetCell?.value ?? ''
  const cellRef = `${columnNumberToName(targetColumn)}${targetRow.rowNumber}`

  const report = {
    sheet: ENTITY_SHEET_NAME,
    worksheetPath,
    row: targetRow.rowNumber,
    slug: wantedSlug,
    column: normalizedColumn,
    cell: cellRef,
    oldValue,
    newValue: value,
  }

  if (dryRun) return { entries, report, changed: false }

  const patchedSheetXml = patchSheetXml(sheetXml, targetRow, targetColumn, value)
  setXml(entryMap, worksheetPath, patchedSheetXml)
  return { entries, report, changed: true }
}

function copyRoundtrip(workbookPath) {
  return readZip(workbookPath)
}

function writeOutput(entries, inputPath, outPath, inPlace) {
  if (inPlace) {
    const directory = path.dirname(inputPath)
    const tempPath = path.join(directory, `.${path.basename(inputPath)}.${process.pid}.${Date.now()}.tmp`)
    writeZip(entries, tempPath)
    fs.renameSync(tempPath, inputPath)
    return inputPath
  }

  writeZip(entries, outPath)
  return outPath
}

function printReport(report, dryRun) {
  console.log(`[edit-entity-master-cell] ${dryRun ? 'DRY RUN' : 'EDIT'}:`)
  console.log(`  sheet: ${report.sheet}`)
  console.log(`  worksheet: ${report.worksheetPath}`)
  console.log(`  row: ${report.row}`)
  console.log(`  slug: ${report.slug}`)
  console.log(`  column: ${report.column}`)
  console.log(`  cell: ${report.cell}`)
  console.log(`  old: ${JSON.stringify(report.oldValue)}`)
  console.log(`  new: ${JSON.stringify(report.newValue)}`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const workbookPath = path.resolve(args.workbook)
  if (!fs.existsSync(workbookPath)) fail(`Workbook not found: ${workbookPath}`)

  if (args.roundtrip) {
    const outPath = path.resolve(args.out)
    if (outPath === workbookPath) fail('--roundtrip output must not equal the source workbook')
    const entries = copyRoundtrip(workbookPath)
    writeOutput(entries, workbookPath, outPath, false)
    console.log(`[edit-entity-master-cell] Roundtrip workbook written to ${outPath}`)
    console.log('[edit-entity-master-cell] Next: run validate:workbook-schema, data:build, and guard:source-of-truth to verify deterministic generated output.')
    return
  }

  const { entries, report, changed } = editCell({
    workbookPath,
    slug: args.slug,
    column: args.column,
    value: args.value,
    dryRun: args.dryRun,
  })
  printReport(report, args.dryRun)

  if (!changed) {
    console.log('[edit-entity-master-cell] No file written.')
    return
  }

  const outputPath = args.inPlace ? workbookPath : path.resolve(args.out)
  if (!args.inPlace && outputPath === workbookPath) fail('Output path equals input workbook. Use --in-place for atomic replacement.')
  const written = writeOutput(entries, workbookPath, outputPath, args.inPlace)
  console.log(`[edit-entity-master-cell] Workbook written to ${written}`)
  console.log('[edit-entity-master-cell] Next: run validate:workbook-schema, data:build, and guard:source-of-truth before committing.')
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
