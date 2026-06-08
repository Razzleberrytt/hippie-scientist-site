import fs from 'node:fs'

const files = ['public/data/workbook-herbs.json', 'public/data/workbook-compounds.json']
const VALID = new Set(['Generally well tolerated', 'Use caution', 'Interaction risk', 'Safety review pending', 'Limited safety data'])
const out = []
let bad = 0
for (const file of files) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const row of rows) {
    const raw = String(row.safety_level || '').trim()
    if (!raw) continue
    if (!VALID.has(raw)) {
      bad++
      out.push({ file, slug: row.slug, safety_level: raw })
    }
  }
}
fs.mkdirSync('public/data/reports', { recursive: true })
fs.writeFileSync('public/data/reports/invalid-safety-report.json', JSON.stringify({ generatedAt: new Date().toISOString(), invalid: out }, null, 2))
if (bad > 0) {
  console.error(`[safety] invalid safety_level values: ${bad}. see public/data/reports/invalid-safety-report.json`)
  process.exit(1)
}
console.log('[safety] safety_level enum validation passed')
