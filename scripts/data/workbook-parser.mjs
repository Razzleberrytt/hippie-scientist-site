import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

// Workbook parser adapter boundary.
//
// ExcelJS is used only for trusted local Node build/data scripts. Do not use
// this parser for browser input, user uploads, request bodies, or remote URLs.
// Any future runtime spreadsheet parsing must go through a reviewed safer
// boundary.
//
// IMPORTANT:
// Preserve current workbook semantics exactly unless a dedicated
// migration/parity pass explicitly changes them.
//
// Current invariants:
// - blank cells become ''
// - row object keys match legacy sheet_to_json behavior
// - workbook shape exposes Sheets + SheetNames
// - downstream exporters depend on deterministic row object structure

export async function readWorkbook(filePath, options = {}) {
  const excelWorkbook = await readWorkbookExcelJS(filePath)
  const sheetNames = excelWorkbook.getSheetNames()
  const requestedSheets = Array.isArray(options.sheets) && options.sheets.length
    ? new Set(options.sheets)
    : null
  const sheetsToRead = requestedSheets
    ? sheetNames.filter((sheetName) => requestedSheets.has(sheetName))
    : sheetNames
  const sheets = Object.fromEntries(
    sheetsToRead.map((sheetName) => [sheetName, excelWorkbook.getSheetData(sheetName)]),
  )

  return {
    SheetNames: sheetNames,
    Sheets: sheets,
  }
}

export function getSheetNames(workbook) {
  return workbook?.SheetNames || []
}

export function getSheet(workbook, sheetName) {
  return workbook?.Sheets?.[sheetName] || null
}

export function sheetToRows(sheet) {
  return Array.isArray(sheet) ? sheet : []
}
