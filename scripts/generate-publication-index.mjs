#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const manifestPath = path.join(DATA_DIR, 'publication-manifest.json')
const outPath = path.join(DATA_DIR, 'publication-index.json')

function readManifest() {
  if (!fs.existsSync(manifestPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch {
    return {}
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function run() {
  const manifest = readManifest()
  const herbs = asArray(manifest?.entities?.herbs)
  const compounds = asArray(manifest?.entities?.compounds)
  const herbRoutes = asArray(manifest?.routes?.herbs)
  const compoundRoutes = asArray(manifest?.routes?.compounds)

  const publicationIndex = {
    generatedAt: manifest?.generatedAt || new Date().toISOString(),
    source: 'public/data/publication-manifest.json',
    counts: {
      herbs: herbs.length,
      compounds: compounds.length,
      entities: herbs.length + compounds.length,
      herbRoutes: herbRoutes.length,
      compoundRoutes: compoundRoutes.length,
      routes: herbRoutes.length + compoundRoutes.length,
    },
    routes: {
      herbs: herbRoutes,
      compounds: compoundRoutes,
    },
    entities: {
      herbs: herbs.map(item => ({ slug: item?.slug || '', route: item?.route || '' })).filter(item => item.slug && item.route),
      compounds: compounds
        .map(item => ({ slug: item?.slug || '', route: item?.route || '' }))
        .filter(item => item.slug && item.route),
    },
    summaries: manifest?.summaries || {},
    thresholds: manifest?.thresholds || {},
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, `${JSON.stringify(publicationIndex, null, 2)}\n`, 'utf8')
  console.log(`[publication-index] wrote ${path.relative(ROOT, outPath)} entities=${publicationIndex.counts.entities}`)
}

run()
