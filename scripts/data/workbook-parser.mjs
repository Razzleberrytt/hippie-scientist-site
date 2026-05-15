import XLSX from 'xlsx'

// Workbook parser adapter boundary.
//
// xlsx is allowed only in trusted Node build/data scripts. Do not use this
// parser for browser input, user uploads, request bodies, or remote URLs.
// Any future runtime spreadsheet parsing must go through a reviewed safer
// boundary instead of importing xlsx directly.
//
// This module intentionally isolates direct xlsx usage so the workbook
// pipeline can later migrate to exceljs (or another parser) without
// rewriting downstream normalization and export logic.
//
// IMPORTANT:
// Preserve current workbook semantics exactly unless a dedicated
// migration/parity pass explicitly changes them.
//
// Current invariants:
// - blank cells become ''
// - row object keys match xlsx sheet_to_json behavior
// - workbook shape exposes Sheets + SheetNames
// - downstream exporters depend on deterministic row object structure

export function readWorkbook(filePath) {
  return XLSX.readFile(filePath)
}

export function getSheetNames(workbook) {
  return workbook?.SheetNames || []
}

export function getSheet(workbook, sheetName) {
  return workbook?.Sheets?.[sheetName] || null
}

export function sheetToRows(sheet) {
  if (!sheet) return []

  // Preserve legacy workbook parsing semantics.
  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
  })
}
