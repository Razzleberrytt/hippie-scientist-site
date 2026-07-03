#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const ROBOTS_PATH = path.join(OUT_DIR, 'robots.txt')
const REQUIRE_BUILT = process.argv.includes('--require-built')
const CANONICAL_SITEMAP = 'https://thehippiescientist.net/sitemap.xml'

const REQUIRED_DISALLOWS = [
  '/api/',
  '/analytics',
  '/admin/',
  '/dashboard',
  '/data/',
  '/preview/',
  '/drafts/',
  '/tmp/',
  '/temp/',
  '/test/',
  '/dev/',
]

const normalizeLineValue = (line, directive) =>
  line.replace(new RegExp(`^${directive}\\s*:\\s*`, 'i'), '').trim()

function readRobots() {
  if (!fs.existsSync(OUT_DIR)) {
    if (REQUIRE_BUILT) {
      console.error('[validate-robots] FAIL: out/ directory does not exist. Run `npm run build` first.')
      process.exit(1)
    }
    console.log('[validate-robots] SKIP: out/ directory does not exist yet.')
    process.exit(0)
  }

  if (!fs.existsSync(ROBOTS_PATH)) {
    console.error('[validate-robots] FAIL: out/robots.txt does not exist.')
    process.exit(1)
  }

  return fs.readFileSync(ROBOTS_PATH, 'utf8')
}

function main() {
  const content = readRobots()
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const errors = []
  const userAgents = lines
    .filter((line) => /^user-agent\s*:/i.test(line))
    .map((line) => normalizeLineValue(line, 'user-agent'))
  const allows = lines
    .filter((line) => /^allow\s*:/i.test(line))
    .map((line) => normalizeLineValue(line, 'allow'))
  const disallows = lines
    .filter((line) => /^disallow\s*:/i.test(line))
    .map((line) => normalizeLineValue(line, 'disallow'))
  const sitemaps = lines
    .filter((line) => /^sitemap\s*:/i.test(line))
    .map((line) => normalizeLineValue(line, 'sitemap'))
  const hosts = lines.filter((line) => /^host\s*:/i.test(line))

  if (!userAgents.includes('*')) {
    errors.push('Missing User-agent: * rule.')
  }

  if (!allows.includes('/')) {
    errors.push('Missing Allow: / rule.')
  }

  if (disallows.includes('/')) {
    errors.push('Robots.txt disallows the whole site.')
  }

  for (const required of REQUIRED_DISALLOWS) {
    if (!disallows.includes(required)) {
      errors.push(`Missing internal disallow: ${required}`)
    }
  }

  if (!sitemaps.includes(CANONICAL_SITEMAP)) {
    errors.push(`Missing canonical sitemap directive: ${CANONICAL_SITEMAP}`)
  }

  if (hosts.length > 0) {
    errors.push('Host directive should not be emitted; canonical host is enforced by URLs and redirects.')
  }

  if (errors.length > 0) {
    console.error('[validate-robots] FAIL: robots.txt validation failed:')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    process.exit(1)
  }

  console.log(`[validate-robots] PASS: robots.txt allows crawl, protects internal surfaces, and advertises ${CANONICAL_SITEMAP}.`)
}

main()
