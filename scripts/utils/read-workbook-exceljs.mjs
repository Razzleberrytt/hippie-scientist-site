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

export async function readWorkbookExcelJS(filePath) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)

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
