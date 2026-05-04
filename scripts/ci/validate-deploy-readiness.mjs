// relaxed MVP validation mode

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function warn(msg) {
  console.warn(`[deploy-readiness] WARN ${msg}`)
}

function readJsonSafe(p) {
  try {
    if (!fs.existsSync(p)) return null
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

function main() {
  const herbs = readJsonSafe(path.join(ROOT, 'public/data/herbs.json'))
  const compounds = readJsonSafe(path.join(ROOT, 'public/data/compounds.json'))

  if (!Array.isArray(herbs) || herbs.length === 0) {
    console.error('[deploy-readiness] herbs.json missing or empty')
    process.exit(1)
  }

  if (!Array.isArray(compounds) || compounds.length === 0) {
    console.error('[deploy-readiness] compounds.json missing or empty')
    process.exit(1)
  }

  if (!fs.existsSync(path.join(ROOT, 'public/sitemap.xml'))) {
    warn('sitemap.xml missing (allowed in MVP)')
  }

  if (!fs.existsSync(path.join(ROOT, 'public/data/herbs-detail'))) {
    warn('herbs-detail missing (allowed in MVP)')
  }

  if (!fs.existsSync(path.join(ROOT, 'public/data/compounds-detail'))) {
    warn('compounds-detail missing (allowed in MVP)')
  }

  console.log('[deploy-readiness] PASS (MVP relaxed mode)')
}

main()
