import fs from 'node:fs';
import path from 'node:path';
import xlsx from 'xlsx';

const CANDIDATE_PATHS = [
  'data/import/citations.xlsx',
  'data/import/citations.csv',
  'public/data/import/citations.xlsx',
  'public/data/import/citations.csv',
];

function detectFilePath() {
  return CANDIDATE_PATHS.find((candidate) => fs.existsSync(candidate)) || null;
}

function normalizeHeader(value, index) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return `column_${index + 1}`;
}

function summarizeRows(rows, headers) {
  return rows.slice(0, 10).map((row, rowIndex) => {
    const values = headers.map((_, headerIndex) => row[headerIndex] ?? null);
    const nonEmptyCount = values.filter(
      (value) => value !== null && value !== '' && value !== undefined,
    ).length;

    const populatedColumns = [];
    headers.forEach((header, headerIndex) => {
      const value = values[headerIndex];
      if (value !== null && value !== '' && value !== undefined) {
        populatedColumns.push(header);
      }
    });

    return {
      rowNumber: rowIndex + 1,
      columnCount: values.length,
      nonEmptyCount,
      populatedColumns,
    };
  });
}

function inspectSheet(rows) {
  if (!rows.length) {
    return {
      headers: [],
      rowCount: 0,
      firstTenRows: [],
    };
  }

  const headers = rows[0].map(normalizeHeader);
  const dataRows = rows.slice(1);

  return {
    headers,
    rowCount: dataRows.length,
    firstTenRows: summarizeRows(dataRows, headers),
  };
}

function readWorkbook(targetPath) {
  const extension = path.extname(targetPath).toLowerCase();

  if (extension === '.xlsx') {
    const workbook = xlsx.readFile(targetPath, { cellDates: true });
    const sheets = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
        defval: null,
        raw: false,
      });
      return {
        sheetName,
        ...inspectSheet(rows),
      };
    });

    return {
      type: 'xlsx',
      sheets,
    };
  }

  const workbook = xlsx.readFile(targetPath, {
    type: 'string',
    raw: false,
    codepage: 65001,
  });
  const [sheetName] = workbook.SheetNames;
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
    raw: false,
  });

  return {
    type: 'csv',
    sheets: [
      {
        sheetName,
        ...inspectSheet(rows),
      },
    ],
  };
}

const detectedPath = detectFilePath();

if (!detectedPath) {
  console.error('No citation import file found at configured candidate paths.');
  process.exit(1);
}

const result = {
  detectedPath,
  ...readWorkbook(detectedPath),
};

console.log(JSON.stringify(result, null, 2));
