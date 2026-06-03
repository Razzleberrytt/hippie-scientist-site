#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const HERBS_PATH = path.resolve(__dirname, '../public/data/herbs.json')

const INFERRED_TITLE_PATTERN = /inferred from/i

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isBadSource(source) {
  if (!source || typeof source !== 'object') return true

  const title = normalizeText(source.title)
  const url = normalizeText(source.url)

  if (!title) return true
  if (INFERRED_TITLE_PATTERN.test(title)) return true
  if (!title && !url) return true

  return false
}

function normalizeSource(source) {
  return {
    title: normalizeText(source?.title),
    url: normalizeText(source?.url),
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  const deduped = []

  for (const source of sources) {
    const key = `${source.title}||${source.url}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(source)
  }

  return deduped
}

function main() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8'))

  if (!Array.isArray(herbs)) {
    throw new Error('[clean-source-refs] Expected public/data/herbs.json to contain an array.')
  }

  let totalBadSourcesRemoved = 0
  let herbsAtZeroRealSources = 0

  for (const herb of herbs) {
    const rawSources = Array.isArray(herb?.sources) ? herb.sources : []

    const cleaned = []

    for (const source of rawSources) {
      if (isBadSource(source)) {
        totalBadSourcesRemoved += 1
        continue
      }

      cleaned.push(normalizeSource(source))
    }

    const deduped = dedupeSources(cleaned)
    totalBadSourcesRemoved += cleaned.length - deduped.length

    herb.sources = deduped

    if (herb.sources.length === 0) {
      herbsAtZeroRealSources += 1
    }
  }

  fs.writeFileSync(HERBS_PATH, `${JSON.stringify(herbs, null, 2)}\n`, 'utf8')

  console.log(`[clean-source-refs] total herbs processed: ${herbs.length}`)
  console.log(`[clean-source-refs] total bad sources removed: ${totalBadSourcesRemoved}`)
  console.log(`[clean-source-refs] herbs now at zero real sources: ${herbsAtZeroRealSources}`)
}

main()
