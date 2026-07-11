import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ExcelJS from 'exceljs'
import JSZip from 'jszip'

function normalizeCellValue(cell) {
  const value = cell?.value

  if (value == null) return ''
  if (value instanceof Date) return value
  if (typeof value !== 'object') return value
  if ('result' in value) return value.result ?? ''
  if ('text' in value) return value.text ?? ''
  if ('hyperlink' in value && 'text' in value) return value.text ?? value.hyperlink ?? ''
  if ('richText' in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text || '').join('')
  }

  return String(value)
}

function rowHasValue(row) {
  return row.some((value) => String(value ?? '').trim() !== '')
}

function worksheetToRows(worksheet) {
  if (!worksheet) return []

  const headerRow = worksheet.getRow(1)
  const headers = []
  for (let columnIndex = 1; columnIndex <= worksheet.columnCount; columnIndex += 1) {
    const header = normalizeCellValue(headerRow.getCell(columnIndex))
    headers.push(String(header ?? '').trim())
  }

  const rows = []
  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex)
    const values = headers.map((_, columnOffset) => normalizeCellValue(row.getCell(columnOffset + 1)))
    if (!rowHasValue(values)) continue

    const record = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = values[index] ?? ''
    })
    rows.push(record)
  }

  return rows
}

function rawRowsToRecords(rawRows) {
  const headerValues = rawRows[0] || []
  const headers = headerValues.map((header) => String(header ?? '').trim())
  const rows = []

  for (const rawRow of rawRows.slice(1)) {
    const values = headers.map((_, index) => rawRow[index] ?? '')
    if (!rowHasValue(values)) continue

    const record = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = values[index] ?? ''
    })
    rows.push(record)
  }

  return rows
}

function rowToRawValues(row) {
  const values = []
  row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
    values[columnNumber - 1] = normalizeCellValue(cell)
  })
  return values.map((value) => value ?? '')
}

function isRelationshipNamespaceError(error) {
  const message = String(error?.message || '')
  return message.includes('Unexpected xml node in parseOpen') && message.includes('Relationships')
}

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

function getAttributeValue(tag, attributeName) {
  const match = tag.match(new RegExp(`\\s${escapeRegExp(attributeName)}="([^"]*)"`, 'i'))
  return match ? match[1] : ''
}

async function readSheetNameMapFromWorkbookXml(filePath) {
  const source = await readFile(filePath)
  const zip = await JSZip.loadAsync(source)
  const workbookXmlFile = zip.file('xl/workbook.xml')
  const workbookRelsFile = zip.file('xl/_rels/workbook.xml.rels')
  if (!workbookXmlFile || !workbookRelsFile) return new Map()

  const workbookXml = await workbookXmlFile.async('string')
  const workbookRelsXml = await workbookRelsFile.async('string')

  const relIdToSheetNo = new Map()
  for (const relMatch of workbookRelsXml.matchAll(/<[^>]*Relationship\b[^>]*>/gi)) {
    const tag = relMatch[0]
    const id = getAttributeValue(tag, 'Id')
    const target = getAttributeValue(tag, 'Target')
    const sheetNo = String(target || '').match(/(?:^|\/)sheet(\d+)\.xml$/i)?.[1]
    if (id && sheetNo) relIdToSheetNo.set(id, sheetNo)
  }

  const sheetNoToName = new Map()
  for (const sheetMatch of workbookXml.matchAll(/<[^>]*sheet\b[^>]*>/gi)) {
    const tag = sheetMatch[0]
    const name = getAttributeValue(tag, 'name')
    const relId = getAttributeValue(tag, 'r:id')
    const sheetNo = relIdToSheetNo.get(relId)
    if (sheetNo && name) sheetNoToName.set(sheetNo, name)
  }

  return sheetNoToName
}

async function createNormalizedWorkbookCopy(filePath) {
  const source = await readFile(filePath)
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

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'hippie-workbook-'))
  const tempPath = path.join(tempDir, path.basename(filePath))
  const output = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
  await writeFile(tempPath, output)

  return { tempDir, tempPath, changedFiles }
}

async function readWorkbookStreaming(filePath, originalError) {
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
    entries: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    styles: 'ignore',
    worksheets: 'emit',
  })
  // Collect entries during streaming; real names are resolved after the loop
  // because workbookReader.model is only fully populated once all entries are read.
  const sheetEntries = []

  try {
    for await (const worksheetReader of workbookReader) {
      const rawRows = []

      for await (const row of worksheetReader) {
        rawRows[row.number - 1] = rowToRawValues(row)
      }

      sheetEntries.push({
        id: worksheetReader.id,
        name: worksheetReader.name,
        rows: rawRowsToRecords(rawRows.filter(Boolean)),
      })
    }
  } catch (streamingError) {
    streamingError.cause = originalError
    throw streamingError
  }

  // ExcelJS streaming fails to set worksheetReader.name when workbook.xml.rels
  // uses absolute-style targets ("/xl/worksheets/sheetN.xml") instead of the
  // relative form ("worksheets/sheetN.xml") the matching logic expects.
  // After streaming completes, workbookReader.model.sheets and
  // workbookReader.workbookRels are both populated; use them to build a
  // sheetNo→realName map keyed by the number extracted from the filename.
  let sheetNoToName = new Map()
  const model = workbookReader.model
  const rels = workbookReader.workbookRels
  if (model && Array.isArray(model.sheets) && Array.isArray(rels)) {
    for (const rel of rels) {
      const match = String(rel.Target || '').match(/\/sheet(\d+)\.xml$/i)
      if (!match) continue
      const sheetNo = match[1]
      const sheet = model.sheets.find((s) => s.rId === rel.Id)
      if (sheet && sheet.name) sheetNoToName.set(sheetNo, sheet.name)
    }
  }
  if (sheetNoToName.size === 0) {
    sheetNoToName = await readSheetNameMapFromWorkbookXml(filePath)
  }

  const sheetNames = []
  const sheets = new Map()
  for (const { id, name, rows } of sheetEntries) {
    const realName = sheetNoToName.get(String(id)) || name
    sheetNames.push(realName)
    sheets.set(realName, rows)
  }

  return {
    workbook: null,
    getSheetNames() {
      return sheetNames
    },
    getSheetData(sheetName) {
      return sheets.get(sheetName) || []
    },
  }
}

async function readWorkbookStreamingWithNamespaceFallback(filePath, originalError) {
  try {
    return await readWorkbookStreaming(filePath, originalError)
  } catch (streamingError) {
    if (!isRelationshipNamespaceError(streamingError)) throw streamingError

    const normalizedCopy = await createNormalizedWorkbookCopy(filePath)
    if (!normalizedCopy) throw streamingError

    console.warn(
      `[workbook-source] Normalized namespace-prefixed OOXML in ${normalizedCopy.changedFiles} file(s); retrying streaming read from a temporary copy`,
    )

    try {
      return await readWorkbookStreaming(normalizedCopy.tempPath, originalError)
    } finally {
      await rm(normalizedCopy.tempDir, { recursive: true, force: true })
    }
  }
}

export async function readWorkbookExcelJS(filePath) {
  const workbook = new ExcelJS.Workbook()

  try {
    await workbook.xlsx.readFile(filePath)
  } catch (error) {
    console.warn(`[workbook-source] ExcelJS full workbook read failed; falling back to streaming row reader: ${error.message}`)
    const normalizedCopy = await createNormalizedWorkbookCopy(filePath)
    if (normalizedCopy) {
      console.warn(
        `[workbook-source] Normalized namespace-prefixed OOXML in ${normalizedCopy.changedFiles} file(s); retrying workbook read from a temporary copy`,
      )

      try {
        const normalizedWorkbook = new ExcelJS.Workbook()
        await normalizedWorkbook.xlsx.readFile(normalizedCopy.tempPath)
        return {
          workbook: normalizedWorkbook,
          getSheetNames() {
            return normalizedWorkbook.worksheets.map((worksheet) => worksheet.name)
          },
          getSheetData(sheetName) {
            return worksheetToRows(normalizedWorkbook.getWorksheet(sheetName))
          },
        }
      } catch (normalizedError) {
        console.warn(`[workbook-source] Normalized workbook read failed; falling back to streaming row reader: ${normalizedError.message}`)
        return await readWorkbookStreaming(normalizedCopy.tempPath, error)
      } finally {
        await rm(normalizedCopy.tempDir, { recursive: true, force: true })
      }
    }
    return readWorkbookStreamingWithNamespaceFallback(filePath, error)
  }

  return {
    workbook,
    getSheetNames() {
      return workbook.worksheets.map((worksheet) => worksheet.name)
    },
    getSheetData(sheetName) {
      return worksheetToRows(workbook.getWorksheet(sheetName))
    },
  }
}

export async function getSheetData(filePath, sheetName) {
  const workbook = await readWorkbookExcelJS(filePath)
  return workbook.getSheetData(sheetName)
}
