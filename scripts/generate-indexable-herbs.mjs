#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asText(value) {
  return String(value || '').trim()
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8'))
}

function writeJson(fileName, data) {
  fs.writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function toIndexableEntry(record, type) {
  const name = asText(record?.common || record?.commonName || record?.name || record?.scientific)
  const slug = slugify(record?.slug)
  const description = asText(record?.description || record?.summary)
  const mechanism = asText(record?.mechanism || record?.mechanismOfAction || record?.mechanismofaction)

  const flags = {
    hasValidSlug: Boolean(slug),
    hasDescription: Boolean(description),
    hasMechanism: Boolean(mechanism),
  }

  const presentCount = [flags.hasValidSlug, flags.hasDescription, flags.hasMechanism].filter(Boolean)
    .length
  const completenessScore = Math.round((presentCount / 3) * 100)
  const passesIndexThreshold = flags.hasValidSlug && (flags.hasDescription || flags.hasMechanism)

  return {
    slug,
    route: `/${type}/${slug}`,
    name,
    flags,
    completenessScore,
    passesIndexThreshold,
  }
}

function buildIndexable(fileName, type) {
  const rows = readJson(fileName)
  return rows
    .map(record => toIndexableEntry(record, type))
    .filter(entry => entry.passesIndexThreshold)
}

function run() {
  const herbs = buildIndexable('herbs_combined_updated.json', 'herbs')
  const compounds = buildIndexable('compounds_combined_updated.json', 'compounds')

  writeJson('indexable-herbs.json', herbs)
  writeJson('indexable-compounds.json', compounds)

  console.log(`[indexable] herbs indexable=${herbs.length}`)
  console.log(`[indexable] compounds indexable=${compounds.length}`)
}

run()
