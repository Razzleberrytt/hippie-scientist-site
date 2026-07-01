#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

const SCAN_DIRS = ['app', 'components', 'lib', 'src']
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
  'components/seo/FaqJsonLd.tsx',
  'components/seo/JsonLd.tsx',
  'src/app/protocols/[slug]/page.tsx',
  'src/components/ecosystem-supernode.tsx',
])

function scanDirectory(dir, violations = []) {
  const absDir = path.join(ROOT, dir)
  if (!fs.existsSync(absDir)) return violations

  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'out', 'legacy-quarantine', '__tests__'].includes(entry.name)) continue
      scanDirectory(path.relative(ROOT, fullPath), violations)
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/')
      if (ALLOWLIST.has(relPath)) continue

      const content = fs.readFileSync(fullPath, 'utf8')
      if (content.includes('dangerouslySetInnerHTML')) {
        violations.push({ file: relPath, text: 'dangerouslySetInnerHTML' })
      }
    }
  }
  return violations
}

function main() {
  console.log('[validate-html-injection] Scanning active codebases for unapproved dangerouslySetInnerHTML...')
  const violations = []
  for (const dir of SCAN_DIRS) {
    scanDirectory(dir, violations)
  }

  if (violations.length > 0) {
    console.error('[validate-html-injection] FAIL: Unapproved dangerouslySetInnerHTML usage detected!')
    violations.forEach(v => {
      console.error(`  - ${v.file}: Contains dangerouslySetInnerHTML. Render structured data via components/seo/JsonLd.tsx instead.`)
    })
    process.exit(1)
  }

  console.log('[validate-html-injection] PASS: No unapproved dangerouslySetInnerHTML usages found.')
  process.exit(0)
}

main()
