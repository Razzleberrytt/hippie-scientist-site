#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const herbsPath = path.join(root, 'public/data/herbs.json')
const compoundsSummaryPath = path.join(root, 'public/data/compounds-summary.json')
const outPath = path.join(root, 'public/data/homepage-featured.json')

const FEATURED_HERBS = [
  'Curcuma longa',
  'Camellia sinensis',
  'Withania somnifera',
  'Panax ginseng',
  'Ginkgo biloba',
  'Rosmarinus officinalis',
  'Glycyrrhiza glabra',
  'Nigella sativa',
  'Centella asiatica',
  'Zingiber officinale',
  'Silybum marianum',
  'Rhodiola rosea',
]

const FEATURED_COMPOUNDS = [
  'Curcumin',
  'Epigallocatechin gallate',
  'Withaferin A',
  'Ginsenoside Rg1',
  'Ginkgolide B',
  'Carnosic acid',
  'Glycyrrhizin',
  'Thymoquinone',
  'Asiatic acid',
  'Berberine',
  'Quercetin',
  'Resveratrol',
]

const FALLBACK_SUMMARY = 'Open profile and review mechanism, confidence, and safety details.'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateCardLine(value, maxLength = 110) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).replace(/\s+\S*$/, '').trim()}…`
}

function pickSummary(record, fallback = FALLBACK_SUMMARY) {
  const summary = cleanText(record?.summary || record?.summaryShort || record?.description || record?.effectsSummary)
  if (!summary) return fallback
  const cleaned = cleanText(
    summary
      .replace(/\bNone\.\s*/gi, '')
      .replace(/;\s*nan\b/gi, '')
      .replace(/nan\b/gi, '')
      .replace(/\.\s*\./g, '.'),
  )
  const lowered = cleaned.toLowerCase()
  if (
    cleaned.length < 20 ||
    lowered === 'nan' ||
    lowered.includes('no direct ') ||
    lowered.includes('contextual inference') ||
    lowered.includes('reported in .')
  ) {
    return fallback
  }
  return truncateCardLine(cleaned)
}

function splitTags(value) {
  const raw = Array.isArray(value) ? value : cleanText(value).split(/[;,|\n]+/g)
  return raw
    .map(cleanText)
    .filter(Boolean)
    .filter(tag => tag.length >= 3 && tag.length <= 28)
    .slice(0, 2)
}

function normalizeSlug(name) {
  return cleanText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildHerbsPayload(herbs) {
  const lookup = new Map(
    (Array.isArray(herbs) ? herbs : []).map(row => [cleanText(row?.name).toLowerCase(), row]),
  )

  return FEATURED_HERBS.map(name => {
    const record = lookup.get(name.toLowerCase()) || {}
    return {
      name,
      slug: cleanText(record.slug) || normalizeSlug(name),
      summary: pickSummary(record, 'Science-first herbal reference profile.'),
      tags: splitTags(record.mechanismTags || record.mechanisms || record.tags),
    }
  })
}

function buildCompoundsPayload(compounds) {
  const lookup = new Map(
    (Array.isArray(compounds) ? compounds : []).map(row => [cleanText(row?.name).toLowerCase(), row]),
  )

  return FEATURED_COMPOUNDS.map(name => {
    const record = lookup.get(name.toLowerCase()) || {}
    return {
      name,
      slug: cleanText(record.slug) || normalizeSlug(name),
      summary: pickSummary(record, FALLBACK_SUMMARY),
    }
  })
}

const herbs = readJson(herbsPath)
const compounds = readJson(compoundsSummaryPath)

const payload = {
  generatedAt: new Date().toISOString(),
  herbs: buildHerbsPayload(herbs),
  compounds: buildCompoundsPayload(compounds),
}

fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, outPath)}`)
