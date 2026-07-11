#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

const SCAN_DIRS = ['app', 'components', 'lib', 'pages', 'src']
const ALLOWLIST = new Set([
  'app/about/page.tsx',
  'app/articles/[slug]/page.tsx',
  'app/articles/anxiety-stack-guide/page.tsx',
  'app/articles/ashwagandha/page.tsx',
  'app/articles/ashwagandha-for-anxiety/page.tsx',
  'app/articles/ashwagandha-for-sleep/page.tsx',
  'app/articles/ashwagandha-vs-magnesium-for-sleep/page.tsx',
  'app/articles/ashwagandha/page.tsx',
  'app/articles/best-herbs-for-sleep/page.tsx',
  'app/articles/best-magnesium-supplement-for-adhd/page.tsx',
  'app/articles/cbd-vs-ashwagandha-for-anxiety/page.tsx',
  'app/articles/l-theanine/page.tsx',
  'app/articles/l-theanine-for-anxiety/page.tsx',
  'app/articles/l-theanine-for-sleep/page.tsx',
  'app/articles/l-theanine-magnesium-adhd-stack/page.tsx',
  'app/articles/l-theanine-without-caffeine/page.tsx',
  'app/articles/l-theanine/page.tsx',
  'app/articles/magnesium-glycinate-vs-citrate-for-adhd/page.tsx',
  'app/articles/magnesium-types-for-sleep/page.tsx',
  'app/articles/natural-anxiety-relief/page.tsx',
  'app/articles/sleep-stack-guide/page.tsx',
  'app/compounds/[slug]/page.tsx',
  'app/education/[slug]/page.tsx',
  'app/faq/page.tsx',
  'app/guides/[slug]/page.tsx',
  'app/guides/adhd-supplements/page.tsx',
  'app/guides/page.tsx',
  'app/herbs/[slug]/page.tsx',
  'app/layout.tsx',
  'app/stacks/[slug]/page.tsx',
  'components/BreadcrumbSchema.tsx',
  'components/NavigationSchema.tsx',
  'components/SchemaOrg.tsx',
  'components/articles/FocusAdhdArticlePage.tsx',
  'components/seo/AuthorityJsonLd.tsx',
  'components/seo/JsonLd.tsx',
  'src/app/protocols/[slug]/page.tsx',
])

// These are the only remaining raw JSON.stringify-based JSON-LD emitters.
// Exact counts make the debt visible and prevent this baseline from growing.
const RAW_JSON_LD_BASELINE = new Map([
  ['app/compounds/[slug]/page.tsx', 1],
  ['app/herbs/[slug]/page.tsx', 1],
  ['components/articles/FocusAdhdArticlePage.tsx', 2],
])

const JSON_LD_SCRIPT_PATTERN = /<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>|<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*\/>/g

function countRawJsonLdSerializations(content) {
  return [...content.matchAll(JSON_LD_SCRIPT_PATTERN)]
    .filter((match) => /JSON\.stringify\s*\(/.test(match[0]))
    .length
}

function assertDetectorWorks() {
  const unsafe = '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />'
  const safe = '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />'

  if (countRawJsonLdSerializations(unsafe) !== 1 || countRawJsonLdSerializations(safe) !== 0) {
    throw new Error('Raw JSON-LD detector self-test failed.')
  }
}

function scanDirectory(dir, violations = [], rawJsonLdCounts = new Map()) {
  const absDir = path.join(ROOT, dir)
  if (!fs.existsSync(absDir)) return { violations, rawJsonLdCounts }

  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'out', 'legacy-quarantine', '__tests__'].includes(entry.name)) continue
      scanDirectory(path.relative(ROOT, fullPath), violations, rawJsonLdCounts)
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/')
      const content = fs.readFileSync(fullPath, 'utf8')
      const rawJsonLdCount = countRawJsonLdSerializations(content)

      if (rawJsonLdCount > 0) rawJsonLdCounts.set(relPath, rawJsonLdCount)

      if (!ALLOWLIST.has(relPath) && content.includes('dangerouslySetInnerHTML')) {
        violations.push({ file: relPath, text: 'dangerouslySetInnerHTML' })
      }
    }
  }
  return { violations, rawJsonLdCounts }
}

function validateRawJsonLdBaseline(rawJsonLdCounts, violations) {
  const files = new Set([...RAW_JSON_LD_BASELINE.keys(), ...rawJsonLdCounts.keys()])

  for (const file of files) {
    const expected = RAW_JSON_LD_BASELINE.get(file) ?? 0
    const actual = rawJsonLdCounts.get(file) ?? 0
    if (actual !== expected) {
      violations.push({
        file,
        text: `raw JSON-LD serialization count changed (expected ${expected}, found ${actual})`,
      })
    }
  }
}

function main() {
  console.log('[validate-html-injection] Scanning active codebases for unapproved HTML injection...')
  assertDetectorWorks()

  const violations = []
  const rawJsonLdCounts = new Map()
  for (const dir of SCAN_DIRS) {
    scanDirectory(dir, violations, rawJsonLdCounts)
  }
  validateRawJsonLdBaseline(rawJsonLdCounts, violations)

  if (violations.length > 0) {
    console.error('[validate-html-injection] FAIL: Unapproved HTML or raw JSON-LD serialization detected!')
    violations.forEach((violation) => {
      if (violation.text === 'dangerouslySetInnerHTML') {
        console.error(`  - ${violation.file}: Contains dangerouslySetInnerHTML. Render structured data via components/seo/JsonLd.tsx instead.`)
      } else {
        console.error(`  - ${violation.file}: ${violation.text}. Use JsonLd/SchemaOrg or serializeJsonLd, then update the baseline downward.`)
      }
    })
    process.exit(1)
  }

  const remainingRawCount = [...rawJsonLdCounts.values()].reduce((sum, count) => sum + count, 0)
  console.log(`[validate-html-injection] PASS: No unapproved usages found; raw JSON-LD baseline remains bounded at ${remainingRawCount}.`)
  process.exit(0)
}

main()
