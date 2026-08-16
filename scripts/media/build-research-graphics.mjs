#!/usr/bin/env node
/**
 * Generates deterministic, data-backed social cards and evidence charts for
 * manual editorial review. Outputs live under artifacts/ rather than public/
 * so generated claims cannot ship without a human promotion step.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = process.cwd()
const outputDir = path.join(root, 'artifacts/research-graphics')
const siteUrl = 'https://thehippiescientist.net'
const prioritySlugs = ['ashwagandha', 'magnesium', 'melatonin', 'l-theanine', 'creatine', 'berberine']
const comparisonPairs = [
  ['ashwagandha', 'magnesium'],
  ['melatonin', 'l-theanine'],
  ['caffeine', 'l-theanine'],
]

function readJson(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function nameOf(record) {
  return String(record?.displayName || record?.name || record?.slug || '').trim()
}

function gradeOf(record) {
  const raw = String(record?.evidence_grade || record?.evidenceGrade || record?.evidence_tier || record?.evidenceTier || '').trim()
  const normalized = raw.toUpperCase()
  if (/^A(?:\b|[-+])/.test(normalized) || /STRONG/.test(normalized)) return 'A'
  if (/^B(?:\b|[-+])/.test(normalized) || /MODERATE/.test(normalized)) return 'B'
  if (/^C(?:\b|[-+])/.test(normalized) || /LIMITED|PRELIM/.test(normalized)) return 'C'
  if (/^D(?:\b|[-+])/.test(normalized) || /INSUFFICIENT|THEORETICAL/.test(normalized)) return 'D'
  return 'Unrated'
}

function recordUrl(record, collection) {
  return `${siteUrl}/${collection}/${record.slug}/`
}

function cardSvg({ eyebrow, title, subtitle, grade, sourceUrl, footer = 'Evidence-first supplement research' }) {
  const gradeMarkup = grade && grade !== 'Unrated'
    ? `<rect x="875" y="80" width="235" height="150" rx="36" fill="#143f28"/><text x="992" y="142" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#cfe9d6">EVIDENCE</text><text x="992" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="74" font-weight="800" fill="#ffffff">${esc(grade)}</text>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7f2e9"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/><rect x="44" y="44" width="1112" height="542" rx="34" fill="#ffffff" fill-opacity=".72" stroke="#143f28" stroke-opacity=".12"/>
  <text x="88" y="115" font-family="Arial, sans-serif" font-size="24" letter-spacing="4" font-weight="700" fill="#52715e">${esc(eyebrow.toUpperCase())}</text>
  ${gradeMarkup}
  <foreignObject x="88" y="155" width="760" height="245"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:66px;line-height:1.02;font-weight:800;color:#102018;letter-spacing:-2px">${esc(title)}</div></foreignObject>
  <foreignObject x="88" y="405" width="970" height="82"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:29px;line-height:1.25;color:#486152">${esc(subtitle)}</div></foreignObject>
  <text x="88" y="535" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#143f28">THE HIPPIE SCIENTIST</text>
  <text x="1110" y="535" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#61766a">${esc(footer)}</text>
  <metadata>${esc(JSON.stringify({ sourceUrl, attribution: 'The Hippie Scientist' }))}</metadata>
</svg>`
}

function chartSvg(items) {
  const score = { A: 4, B: 3, C: 2, D: 1, Unrated: 0 }
  const bars = items.map((item, index) => {
    const x = 105 + index * 165
    const value = score[item.grade] || 0
    const height = value * 82
    const y = 480 - height
    return `<rect x="${x}" y="${y}" width="105" height="${height}" rx="16" fill="#2f7d4a"/><text x="${x + 52}" y="${Math.max(105, y - 14)}" text-anchor="middle" font-family="Arial" font-size="34" font-weight="800" fill="#143f28">${esc(item.grade)}</text><foreignObject x="${x - 20}" y="495" width="145" height="72"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 20px Arial;text-align:center;color:#2c4436">${esc(item.name)}</div></foreignObject>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Priority supplement evidence grades"><rect width="1200" height="630" fill="#f4f8f4"/><text x="70" y="70" font-family="Arial" font-size="25" letter-spacing="4" font-weight="700" fill="#52715e">THE HIPPIE SCIENTIST · EVIDENCE SNAPSHOT</text><text x="70" y="125" font-family="Arial" font-size="46" font-weight="800" fill="#102018">Evidence grades for priority research profiles</text><line x1="70" y1="480" x2="1130" y2="480" stroke="#9eb4a5" stroke-width="2"/>${bars}<text x="1130" y="600" text-anchor="end" font-family="Arial" font-size="17" fill="#64786b">Source: thehippiescientist.net · generated for editorial review</text></svg>`
}

async function writeGraphic(baseName, svg, metadata, sharp) {
  const svgPath = path.join(outputDir, `${baseName}.svg`)
  const pngPath = path.join(outputDir, `${baseName}.png`)
  fs.writeFileSync(svgPath, svg)
  let pngGenerated = false
  if (sharp) {
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath)
    pngGenerated = true
  }
  return {
    ...metadata,
    svg: path.relative(root, svgPath).split(path.sep).join('/'),
    png: pngGenerated ? path.relative(root, pngPath).split(path.sep).join('/') : null,
    approvedForPublicUse: false,
    embedHtml: `<a href="${metadata.sourceUrl}"><img src="${metadata.publicSvgUrl}" alt="${esc(metadata.alt)}"></a><p>Source: <a href="${metadata.sourceUrl}">The Hippie Scientist</a></p>`,
  }
}

fs.mkdirSync(outputDir, { recursive: true })
let sharp = null
try { sharp = require('sharp') } catch { console.warn('[research-graphics] sharp unavailable; SVGs will still be generated') }

const herbs = readJson(path.join(root, 'public/data/herbs.json'))
const compounds = readJson(path.join(root, 'public/data/compounds.json'))
const all = [
  ...herbs.map((r) => ({ ...r, __collection: 'herbs' })),
  ...compounds.map((r) => ({ ...r, __collection: 'compounds' })),
]
const bySlug = new Map(all.map((record) => [String(record.slug || '').toLowerCase(), record]))
const manifest = []

for (const slug of prioritySlugs) {
  const record = bySlug.get(slug)
  if (!record) continue
  const name = nameOf(record)
  const grade = gradeOf(record)
  const sourceUrl = recordUrl(record, record.__collection)
  const baseName = `ingredient-${slug}`
  const svg = cardSvg({ eyebrow: 'Evidence profile', title: name, subtitle: 'Human evidence, safety context, studied forms, and source-linked limitations.', grade, sourceUrl })
  manifest.push(await writeGraphic(baseName, svg, {
    kind: 'ingredient-card', entitySlug: slug, evidenceGrade: grade, sourceUrl,
    alt: `${name} evidence profile — ${grade === 'Unrated' ? 'evidence under review' : `grade ${grade}`}`,
    publicSvgUrl: `${siteUrl}/media/research/${baseName}.svg`,
  }, sharp))
}

for (const [aSlug, bSlug] of comparisonPairs) {
  const a = bySlug.get(aSlug), b = bySlug.get(bSlug)
  if (!a || !b) continue
  const sourceUrl = `${siteUrl}/guides/compare/${aSlug}-vs-${bSlug}/`
  const baseName = `comparison-${aSlug}-vs-${bSlug}`
  const svg = cardSvg({
    eyebrow: 'Evidence comparison',
    title: `${nameOf(a)} vs ${nameOf(b)}`,
    subtitle: `Evidence: ${nameOf(a)} ${gradeOf(a)} · ${nameOf(b)} ${gradeOf(b)}. Compare evidence, safety, form, and dose context.`,
    sourceUrl,
  })
  manifest.push(await writeGraphic(baseName, svg, {
    kind: 'comparison-card', entitySlugs: [aSlug, bSlug], sourceUrl,
    alt: `${nameOf(a)} versus ${nameOf(b)} evidence comparison`,
    publicSvgUrl: `${siteUrl}/media/research/${baseName}.svg`,
  }, sharp))
}

const changed = readJson(path.join(root, 'data/evidence/evidence-changes.json'), [])
for (const change of Array.isArray(changed) ? changed.slice(0, 20) : []) {
  if (!change?.slug || !change?.from || !change?.to) continue
  const record = bySlug.get(String(change.slug).toLowerCase())
  const name = nameOf(record || change)
  const sourceUrl = record ? recordUrl(record, record.__collection) : `${siteUrl}/search/?q=${encodeURIComponent(name)}`
  const baseName = `evidence-changed-${change.slug}`
  const svg = cardSvg({ eyebrow: 'Evidence changed', title: `${name}: ${change.from} → ${change.to}`, subtitle: change.reason || 'The evidence rating changed after review of the underlying research.', grade: change.to, sourceUrl })
  manifest.push(await writeGraphic(baseName, svg, {
    kind: 'evidence-change-card', entitySlug: change.slug, sourceUrl,
    alt: `${name} evidence grade changed from ${change.from} to ${change.to}`,
    publicSvgUrl: `${siteUrl}/media/research/${baseName}.svg`,
  }, sharp))
}

const chartItems = prioritySlugs.map((slug) => bySlug.get(slug)).filter(Boolean).map((r) => ({ name: nameOf(r), grade: gradeOf(r), sourceUrl: recordUrl(r, r.__collection) }))
if (chartItems.length) {
  const baseName = 'priority-evidence-grades'
  manifest.push(await writeGraphic(baseName, chartSvg(chartItems), {
    kind: 'evidence-chart', sourceUrl: `${siteUrl}/evidence/`, alt: 'Evidence grades for priority supplement profiles',
    publicSvgUrl: `${siteUrl}/media/research/${baseName}.svg`, data: chartItems,
  }, sharp))
}

const review = {
  generatedAt: new Date().toISOString(),
  policy: 'Generated graphics are review artifacts. Do not copy into public/media/research until evidence, labels, attribution, and destination URLs are manually verified.',
  graphics: manifest,
}
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(review, null, 2)}\n`)
fs.writeFileSync(path.join(outputDir, 'REVIEW_REQUIRED.md'), `# Research graphics review required\n\nGenerated: ${review.generatedAt}\n\nBefore publication, verify every evidence grade, label, source URL, comparison statement, image alt text, and attribution. Approved files can then be promoted to \`public/media/research/\`.\n`)
console.log(`[research-graphics] generated ${manifest.length} review-gated graphics in ${path.relative(root, outputDir)}`)
