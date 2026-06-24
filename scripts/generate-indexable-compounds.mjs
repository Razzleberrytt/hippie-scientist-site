#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

function readObject(fileName) {
  const fullPath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(fullPath)) return {}

  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function run() {
  const publicationManifest = readObject('publication-manifest.json')
  const compounds = Array.isArray(publicationManifest?.entities?.compounds) ? publicationManifest.entities.compounds : []
  const outputPath = path.join(DATA_DIR, 'indexable-compounds.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(compounds, null, 2)}\n`, 'utf8')
  console.log('[indexable-compounds] source=publication-manifest.json')
  console.log(`[indexable-compounds] wrote ${compounds.length} entries`)
}

run()
