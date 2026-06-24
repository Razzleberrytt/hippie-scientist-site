#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')

const rootDir = process.cwd()
const herbsPath = path.join(rootDir, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(rootDir, 'public', 'data', 'compounds.json')
const outputPath = path.join(rootDir, 'src', 'data', 'site-counts.json')

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function isTruthyBoolean(value) {
  return value === true || String(value).toLowerCase() === 'true'
}

function hasPsychoactiveField(rows) {
  return rows.some(row => Object.prototype.hasOwnProperty.call(row ?? {}, 'psychoactive'))
}

function calculateCounts() {
  const herbsPayload = readJson(herbsPath)
  const compoundsPayload = readJson(compoundsPath)

  const herbs = Array.isArray(herbsPayload) ? herbsPayload : []
  const compounds = Array.isArray(compoundsPayload) ? compoundsPayload : []

  const psychoactiveScoped = hasPsychoactiveField(compounds)
    ? compounds.filter(compound => isTruthyBoolean(compound?.psychoactive))
    : compounds

  return {
    herbs: herbs.length,
    compounds: psychoactiveScoped.length,
    compoundsTotal: compounds.length,
    compoundsFilteredByPsychoactive: hasPsychoactiveField(compounds),
    generatedAt: new Date().toISOString(),
  }
}

function writeCounts(payload) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
}

try {
  const counts = calculateCounts()
  writeCounts(counts)
  console.log(`Wrote ${path.relative(rootDir, outputPath)} with counts:`, counts)
} catch (error) {
  console.error('Failed to calculate site counts.', error)
  process.exitCode = 1
}
