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

function writeJson(fileName, data) {
  fs.writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function run() {
  const publicationManifest = readObject('publication-manifest.json')
  const herbs = Array.isArray(publicationManifest?.entities?.herbs) ? publicationManifest.entities.herbs : []
  const compounds = Array.isArray(publicationManifest?.entities?.compounds) ? publicationManifest.entities.compounds : []

  writeJson('indexable-herbs.json', herbs)
  writeJson('indexable-compounds.json', compounds)

  console.log('[indexable] source=publication-manifest.json')
  console.log(`[indexable] herbs indexable=${herbs.length}`)
  console.log(`[indexable] compounds indexable=${compounds.length}`)
}

run()
