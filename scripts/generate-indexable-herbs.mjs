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

function safeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeName(value, fallbackSlug = '') {
  const base = safeText(value) || String(fallbackSlug || '').replace(/-/g, ' ')
  const normalized = base
    .replace(/\(\s*\)/g, ' ')
    .replace(/\)+$/g, '')
    .replace(/\(+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const opens = (normalized.match(/\(/g) || []).length
  const closes = (normalized.match(/\)/g) || []).length
  if (opens === closes) return normalized
  return normalized.replace(/[()]/g, '').replace(/\s+/g, ' ').trim()
}

function validSlug(value) {
  const slug = safeText(value).toLowerCase()
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

function sanitizeDescription(entry, kind) {
  const existing = safeText(entry?.description)
  if (
    existing &&
    !/reference profile|compound profile|herb profile/i.test(existing) &&
    !/is tracked as a reported constituent in the workbook/i.test(existing)
  ) {
    return existing
  }
  const summary = safeText(entry?.summary || '')
  if (summary) return summary
  const name = normalizeName(entry?.name, entry?.slug)
  if (kind === 'compound') {
    return `${name} is tracked as a reported constituent in the workbook. This profile is pending deeper mechanism and safety review.`
  }
  return `${name} profile with evidence-aware summary, mechanism context, and safety notes when available.`
}

function sanitizeIndexable(entries, kind) {
  if (!Array.isArray(entries)) return []
  return entries
    .filter(entry => validSlug(entry?.slug))
    .map(entry => {
      const name = normalizeName(entry?.name, entry?.slug)
      const description = sanitizeDescription(entry, kind)
      return {
        ...entry,
        name,
        title: safeText(entry?.title) || `${name} | The Hippie Scientist`,
        description,
      }
    })
}

function run() {
  const publicationManifest = readObject('publication-manifest.json')
  const herbs = sanitizeIndexable(publicationManifest?.entities?.herbs, 'herb')
  const compounds = sanitizeIndexable(publicationManifest?.entities?.compounds, 'compound')

  if (publicationManifest?.entities) {
    publicationManifest.entities = {
      ...publicationManifest.entities,
      herbs,
      compounds,
    }
    writeJson('publication-manifest.json', publicationManifest)
  }

  writeJson('indexable-herbs.json', herbs)
  writeJson('indexable-compounds.json', compounds)

  console.log('[indexable] source=publication-manifest.json')
  console.log(`[indexable] herbs indexable=${herbs.length}`)
  console.log(`[indexable] compounds indexable=${compounds.length}`)
}

run()
