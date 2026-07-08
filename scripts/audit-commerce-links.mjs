#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const AMAZON_HOSTS = ['www.amazon.com', 'www.amazon.co.uk', 'www.amazon.ca']
const SOURCE_FILES = [
  'config/revenue-products.ts',
  'config/regional-revenue-products.ts',
  'components/AffiliateProductCard.tsx',
  'components/RecommendationSection.tsx',
  'components/monetization/GoalTopAffiliatePicks.tsx',
]

function readSourceFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath)
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : ''
}

function countOccurrences(source, needle) {
  if (!source || !needle) return 0
  return source.split(needle).length - 1
}

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length
}

function extractAmazonHosts(source) {
  return AMAZON_HOSTS.map((host) => ({
    host,
    count: countOccurrences(source, host),
  }))
}

function buildAuditReport() {
  const sources = SOURCE_FILES.map((relativePath) => ({
    path: relativePath,
    content: readSourceFile(relativePath),
  }))
  const combinedSource = sources.map((source) => source.content).join('\n')
  const revenueProducts = sources.find((source) => source.path === 'config/revenue-products.ts')?.content ?? ''
  const regionalOverrides = sources.find((source) => source.path === 'config/regional-revenue-products.ts')?.content ?? ''

  const affiliateUrlCount = countMatches(revenueProducts, /affiliateUrl:\s*amazonProductUrl/g)
  const explicitAsinCount = countMatches(revenueProducts, /\basin:\s*['"][^'"]+['"]/g)
  const searchFallbackCount = Math.max(affiliateUrlCount - explicitAsinCount, 0)

  return {
    generatedAt: new Date().toISOString(),
    scope: {
      sourceFiles: SOURCE_FILES,
      purpose: 'Inventory current commerce-link plumbing before adding verified regional marketplace URLs.',
    },
    revenueProducts: {
      affiliateUrlCount,
      explicitAsinCount,
      searchFallbackCount,
      note: 'Counts are source-code inventory signals, not live marketplace verification.',
    },
    amazonHosts: extractAmazonHosts(combinedSource),
    regionalOverrides: {
      registryPresent: regionalOverrides.length > 0,
      explicitUsFallbackMentions: countMatches(regionalOverrides, /regionalUrls:\s*{[\s\S]*?US:/g),
      ukMentions: countMatches(regionalOverrides, /\bUK:/g),
      canadaMentions: countMatches(regionalOverrides, /\bCA:/g),
      note: 'The override registry should stay sparse until each marketplace destination is manually verified.',
    },
    nextSteps: [
      'Verify Amazon Associates account/store IDs for each supported region.',
      'Confirm whether OneLink is enabled before relying on automated marketplace routing.',
      'Add UK/Canada URLs only for products with confirmed matching marketplace listings.',
      'Keep US/default URLs as the safe fallback path.',
    ],
  }
}

function printReport(report) {
  console.log(JSON.stringify(report, null, 2))
}

function writeReport(report, outputPath) {
  const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(repoRoot, outputPath)
  mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })
  writeFileSync(absoluteOutputPath, `${JSON.stringify(report, null, 2)}\n`)
}

const outputArgIndex = process.argv.indexOf('--out')
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : null
const report = buildAuditReport()

if (outputPath) {
  writeReport(report, outputPath)
} else {
  printReport(report)
}
