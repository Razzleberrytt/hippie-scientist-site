# xlsx quarantine boundary
`xlsx` is high risk and is quarantined to `scripts/data/workbook-parser.mjs` (plus temporary migration parity scripts).
All workbook readers must consume adapter helpers (`readWorkbook/getSheet/sheetToRows`) rather than importing `xlsx` directly.
Allowlist removal requires migration to a safe drop-in parser and parity validation.
