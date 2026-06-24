import { execFileSync } from 'node:child_process'

function readWorkbookInSubprocess(filePath, sheetNames = []) {
  const script = `
    const ExcelJS = require('exceljs');
    const filePath = process.argv[1];
    const requested = JSON.parse(process.argv[2] || '[]');
    (async () => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const wanted = requested.length ? new Set(requested) : null;
      const result = { SheetNames: [], Sheets: {} };
      for (const worksheet of workbook.worksheets) {
        if (wanted && !wanted.has(worksheet.name)) continue;
        const headers = [];
        const headerRow = worksheet.getRow(1);
        for (let columnIndex = 1; columnIndex <= worksheet.columnCount; columnIndex += 1) {
          const value = headerRow.getCell(columnIndex).value;
          headers.push(String(value == null ? '' : value).trim());
        }
        const rows = [];
        for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
          const row = worksheet.getRow(rowIndex);
          const record = {};
          let hasValue = false;
          headers.forEach((header, offset) => {
            if (!header) return;
            let value = row.getCell(offset + 1).value;
            if (value && typeof value === 'object') value = value.result ?? value.text ?? value.hyperlink ?? '';
            if (value == null) value = '';
            if (String(value).trim()) hasValue = true;
            record[header] = value;
          });
          if (hasValue) rows.push(record);
        }
        result.SheetNames.push(worksheet.name);
        result.Sheets[worksheet.name] = rows;
      }
      process.stdout.write(JSON.stringify(result));
    })().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  `

  return JSON.parse(execFileSync(process.execPath, ['-e', script, filePath, JSON.stringify(sheetNames)], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 200,
  }))
}

function writeWorkbookInSubprocess(workbook, filePath) {
  const script = `
    const ExcelJS = require('exceljs');
    const fs = require('fs');
    const payload = JSON.parse(fs.readFileSync(0, 'utf8'));
    (async () => {
      const workbook = new ExcelJS.Workbook();
      for (const sheetName of payload.SheetNames || []) {
        const worksheet = workbook.addWorksheet(sheetName);
        const rows = payload.Sheets[sheetName] || [];
        const headers = [...new Set(rows.flatMap((row) => Object.keys(row || {})))];
        if (headers.length) worksheet.addRow(headers);
        for (const row of rows) worksheet.addRow(headers.map((header) => row?.[header] ?? ''));
      }
      await workbook.xlsx.writeFile(payload.filePath);
    })().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  `

  execFileSync(process.execPath, ['-e', script], {
    input: JSON.stringify({ ...workbook, filePath }),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 200,
  })
}

const compat = {
  readFile(filePath, options = {}) {
    return readWorkbookInSubprocess(filePath, options.sheets || [])
  },
  writeFile(workbook, filePath) {
    writeWorkbookInSubprocess(workbook, filePath)
  },
  utils: {
    sheet_to_json(sheet) {
      return Array.isArray(sheet) ? sheet : []
    },
    json_to_sheet(rows) {
      return Array.isArray(rows) ? rows : []
    },
  },
}

export default compat
