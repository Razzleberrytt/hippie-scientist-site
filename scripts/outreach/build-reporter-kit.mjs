#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'artifacts/reporter-kit')
const siteUrl = 'https://thehippiescientist.net'

function read(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
}
function nameOf(r) { return String(r.displayName || r.name || r.slug || '') }
function gradeOf(r) {
  const g = String(r.evidence_grade || r.evidenceGrade || '').trim()
  return g || 'Unclassified'
}

const herbs = read(path.join(root, 'public/data/herbs.json'))
const compounds = read(path.join(root, 'public/data/compounds.json'))
const records = [...herbs.map(r => ({...r, type:'herb'})), ...compounds.map(r => ({...r, type:'compound'}))]
const counts = new Map()
for (const record of records) counts.set(gradeOf(record), (counts.get(gradeOf(record)) || 0) + 1)
const rows = [...counts].map(([grade, count]) => ({ grade, count, pct: records.length ? Number((count / records.length * 100).toFixed(1)) : 0 })).sort((a,b) => a.grade.localeCompare(b.grade))
const strong = records.filter(r => /^A$/i.test(gradeOf(r))).slice(0, 25).map(r => ({ name:nameOf(r), type:r.type, slug:r.slug }))

fs.mkdirSync(outDir, { recursive: true })
const dataset = { generatedAt: new Date().toISOString(), recordCount: records.length, evidenceDistribution: rows, aGradeExamples: strong, source: `${siteUrl}/evidence/evidence-report/`, methodology: `${siteUrl}/info/methodology/` }
fs.writeFileSync(path.join(outDir, 'evidence-report-summary.json'), `${JSON.stringify(dataset, null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'evidence-grade-distribution.csv'), `grade,count,percent\n${rows.map(r => `${JSON.stringify(r.grade)},${r.count},${r.pct}`).join('\n')}\n`)

const factSheet = `# The Hippie Scientist — reporter fact sheet

Generated: ${dataset.generatedAt}\n\n## What this dataset is\n\nA structured snapshot of the evidence labels currently attached to ${records.length} herb and compound records in The Hippie Scientist research library. It is an editorial dataset, not a clinical guideline, and the site’s evidence grades are proprietary-but-transparent labels rather than externally validated medical standards.\n\n## Current evidence-label distribution\n\n| Grade / label | Records | Share |\n|---|---:|---:|\n${rows.map(r => `| ${r.grade} | ${r.count} | ${r.pct}% |`).join('\n')}\n\n## Reporter-safe ways to cite the data\n\n- Attribute the figures to **The Hippie Scientist Supplement Evidence Report**.\n- Link to ${siteUrl}/evidence/evidence-report/.\n- Describe the numbers as counts within The Hippie Scientist’s current structured library, not as estimates of all supplements on the market.\n- Link methodology context: ${siteUrl}/info/methodology/.\n- For a specific ingredient claim, use that ingredient page and its primary-study citations rather than this aggregate sheet alone.\n\n## Reusable resources\n\n- Evidence Report: ${siteUrl}/evidence/evidence-report/\n- Evidence Checker: ${siteUrl}/evidence/evidence-checker/\n- Methodology: ${siteUrl}/info/methodology/\n- Infographics: ${siteUrl}/info/infographics/\n- Press / data questions: ${siteUrl}/info/contact/\n\n## Caveats\n\nThe dataset changes as records are corrected, enriched, reclassified or removed from public publication. Aggregate figures should be cited with the report date. Evidence strength and safety are separate concepts; a strong efficacy grade does not mean a substance is safe for every person or situation.\n`
fs.writeFileSync(path.join(outDir, 'fact-sheet.md'), factSheet)
fs.writeFileSync(path.join(outDir, 'CITATION.txt'), `The Hippie Scientist. Supplement Evidence Report. ${siteUrl}/evidence/evidence-report/ (accessed ${new Date().toISOString().slice(0,10)}).\n`)
console.log(`[reporter-kit] generated fact sheet + aggregate data for ${records.length} records in ${path.relative(root,outDir)}`)
