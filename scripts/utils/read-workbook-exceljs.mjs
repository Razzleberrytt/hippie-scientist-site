import ExcelJS from 'exceljs'

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

async function readWorkbookStreaming(filePath, originalError) {
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
    entries: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    styles: 'ignore',
    worksheets: 'emit',
  })
  const sheetNames = []
  const sheets = new Map()

  try {
    for await (const worksheetReader of workbookReader) {
      const rawRows = []
      sheetNames.push(worksheetReader.name)

      for await (const row of worksheetReader) {
        rawRows[row.number - 1] = rowToRawValues(row)
      }

      sheets.set(worksheetReader.name, rawRowsToRecords(rawRows.filter(Boolean)))
    }
  } catch (streamingError) {
    streamingError.cause = originalError
    throw streamingError
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

export async function readWorkbookExcelJS(filePath) {
  const workbook = new ExcelJS.Workbook()

  try {
    await workbook.xlsx.readFile(filePath)
  } catch (error) {
    console.warn(`[workbook-source] ExcelJS full workbook read failed; falling back to streaming row reader: ${error.message}`)
    return readWorkbookStreaming(filePath, error)
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
