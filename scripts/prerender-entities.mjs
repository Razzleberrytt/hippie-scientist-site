#!/usr/bin/env node
// Generated entity pages now render prerendered SEO content as sr-only to avoid duplicate visible content.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const herbs = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/herbs.json'), 'utf8'))
const compounds = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/compounds.json'), 'utf8'))

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ensure = dir => fs.mkdirSync(dir, { recursive: true })
const fmtDate = value => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value || '') : d.toISOString().slice(0, 10)
}

function renderPage(kind, item) {
  const title = item.commonName || item.common || item.name || item.latinName || 'Profile'
  const scientific = item.latinName || item.scientific || ''
  const summary = item.summary || item.description || 'Educational profile.'
  const lastUpdated = item.lastUpdated ? fmtDate(item.lastUpdated) : ''
  const sourceList = Array.isArray(item.sources)
    ? item.sources
        .map(source => {
          if (typeof source === 'string') return `<li>${source}</li>`
          const url = source?.url || ''
          const label = source?.title || source?.url || ''
          return url ? `<li><a href="${url}">${label}</a></li>` : `<li>${label}</li>`
        })
        .join('\n')
    : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | The Hippie Scientist</title>
  <meta name="description" content="${summary.replace(/"/g, '&quot;')}" />
  <style>
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  </style>
</head>
<body style="font-family: Inter, system-ui, sans-serif; background:#070b12; color:#f8fafc; margin:0; padding:24px;">
  <main class="sr-only" style="max-width:760px;margin:0 auto;line-height:1.6;">
    <p><a href="/${kind}" style="color:#93c5fd">← Back to ${kind}</a></p>
    <h1>${title}</h1>
    ${scientific ? `<p><em>${scientific}</em></p>` : ''}
    ${lastUpdated ? `<p><strong>Last updated:</strong> ${lastUpdated}</p>` : ''}
    <p>${summary}</p>
    ${sourceList ? `<h2>Sources</h2><ol>${sourceList}</ol>` : ''}
  </main>
</body>
</html>`
}

function writeKind(kind, items) {
  for (const item of items) {
    const slug =
      item.slug || slugify(item.commonName || item.common || item.name || item.latinName || item.id)
    if (!slug) continue
    const outDir = path.join(ROOT, 'public', kind, slug)
    ensure(outDir)
    fs.writeFileSync(path.join(outDir, 'index.html'), renderPage(kind, item), 'utf8')
  }
}

writeKind('herbs', herbs)
writeKind('compounds', compounds)
console.log(`[prerender-entities] generated ${herbs.length} herb pages and ${compounds.length} compound pages`)
