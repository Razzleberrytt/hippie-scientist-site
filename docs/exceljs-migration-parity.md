# ExcelJS Migration Parity

Generated: June 1, 2026

Command:

```text
node scripts/tests/workbook-reader-parity.test.mjs
```

Output summary:

```text
[workbook-source] Resolved: C:\Users\Will\Documents\hippie-scientist-site\data-sources\herb_monograph_master.xlsx
WORKBOOK READER PARITY REPORT
=============================
Workbook: C:\Users\Will\Documents\hippie-scientist-site\data-sources\herb_monograph_master.xlsx
Sheets: 116

All 116 sheets matched row counts and the first 10 rows per sheet matched field values.

Parity: 100%
Ready to migrate downstream scripts.
```

No discrepancies were reported for dates, numbers, merged cells, formulas, or text fields in the sampled parity check.

Migration complete on June 1, 2026. xlsx removed from package.json.
