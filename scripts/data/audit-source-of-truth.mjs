#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const reportDir = path.join(repoRoot, 'reports')

const APPROVED_SOURCE = path.join('data-sources', 'herb_monograph_master.xlsx')
const GENERATED_PREFIXES = ['public/data/', 'public/data-next/', 'src/generated/']
const SCAN_EXTENSIONS = new Set(['.json', '.csv', '.yaml', '.yml', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx', '.txt'])
const DATA_CODE_PREFIXES = ['src/', 'app/', 'components/', 'scripts/']
const DOC_PREFIXES = ['docs/']
const EDITORIAL_BLOG_PREFIX = 'content/blog/'
const TEST_FIXTURE_HINTS = ['fixture', '__fixtures__', 'test', 'spec', 'mock', 'sample']
const CODE_HINT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs'])
const DATA_FILE_EXTENSIONS = new Set(['.json', '.csv', '.yaml', '.yml', '.txt'])
const NEVER_BLOCK_PATHS = new Set(['AGENTS.md', 'CHANGELOG.md', 'README.md', 'package-lock.json', 'next-env.d.ts', 'eslint.config.js'])
const NEVER_BLOCK_PREFIXES = ['src/lib/', 'scripts/', '.github/', 'types/', 'utils/']
const NON_BLOCKING_PREFIXES = ['ops/', 'schemas/', 'src/content/', 'content/', 'reports/', 'data/blog/']
const EXPLICIT_BLOCK_PATHS = new Set([
  'public/database.json',
  'config/entity-graph.json',
  'public/blog/posts.json',
  'public/blogdata/index.json',
])

const dataPatterns = [
  { regex: /\b(herb|botanical|latinName|commonName|activeCompounds?|therapeuticUses?|safety|contraindications?|interactions?)\b/i, entityType: 'herb' },
  { regex: /\bcompound(s)?\b/i, entityType: 'compound' },
  { regex: /\breference(s)?\b|doi|pubmed|citation/i, entityType: 'reference' },
  { regex: /\brelatedHerbs?|relationships?|synerg(y|ies)\b/i, entityType: 'relationship' },
  { regex: /\bpublication\b|publishedAt|reviewedAt|contentMetadata\b/i, entityType: 'publication' },
  { regex: /\b(education|learn|overview|benefits|uses)\b/i, entityType: 'educational-content' },
]

const hardcodedDataSignals = [
  /(const|let|var)\s+\w+\s*=\s*\[[\s\S]{0,12000}\]/i,
  /(const|let|var)\s+\w+\s*=\s*\{[\s\S]{0,12000}\}/i,
  /export\s+const\s+\w+\s*=\s*\[[\s\S]{0,12000}\]/i,
  /export\s+const\s+\w+\s*=\s*\{[\s\S]{0,12000}\}/i,
]

function walk(dir) {
  const out = []
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.next') continue
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(abs)
      else out.push(abs)
    }
  }
  return out
}

function hasAnyDataPattern(text) {
  return dataPatterns.find((p) => p.regex.test(text)) ?? null
}

function looksLikeHardcodedDataBlob(text) {
  const compact = text.slice(0, 30000)
  const hugeLiteral = hardcodedDataSignals.some((pattern) => pattern.test(compact))
  const repeatedKeys = (compact.match(/"(herb|compound|safety|claim|evidence|reference)s?"/gi) ?? []).length
  return hugeLiteral && compact.length > 5000 && repeatedKeys >= 8
}

function isTestFixture(rel) {
  const lower = rel.toLowerCase()
  return TEST_FIXTURE_HINTS.some((hint) => lower.includes(hint))
}

function classifyFile(rel, text) {
  const ext = path.extname(rel).toLowerCase()

  if (NEVER_BLOCK_PATHS.has(rel) || NEVER_BLOCK_PREFIXES.some((p) => rel.startsWith(p))) {
    return { classification: 'RUNTIME_OR_DOC_CODE', allowed: true }
  }
  if (rel === 'data/seoCollections.ts') {
    return { classification: 'RUNTIME_OR_DOC_CODE', allowed: true }
  }
  if (NON_BLOCKING_PREFIXES.some((p) => rel.startsWith(p))) {
    return { classification: 'PROCESS_ARTIFACT', allowed: true }
  }

  if (rel === APPROVED_SOURCE) {
    return { classification: 'CANONICAL_WORKBOOK', allowed: true }
  }

  if (GENERATED_PREFIXES.some((p) => rel.startsWith(p))) {
    return { classification: 'GENERATED_OUTPUT', allowed: true }
  }

  if (isTestFixture(rel)) {
    return { classification: 'SYNTHETIC_TEST_FIXTURE', allowed: true }
  }

  if (DATA_CODE_PREFIXES.some((p) => rel.startsWith(p))) {
    const isCode = CODE_HINT_EXTENSIONS.has(ext)
    if (!isCode) {
      return { classification: 'UNKNOWN_NEEDS_REVIEW', allowed: false }
    }
    if (looksLikeHardcodedDataBlob(text) && hasAnyDataPattern(text)) {
      return { classification: 'UNKNOWN_NEEDS_REVIEW', allowed: false }
    }
    return { classification: 'GENERATOR_OR_VALIDATOR_CODE', allowed: true }
  }

  if (DOC_PREFIXES.some((p) => rel.startsWith(p))) {
    return { classification: 'STATIC_SITE_COPY', allowed: true }
  }

  if (rel.startsWith(EDITORIAL_BLOG_PREFIX)) {
    if (hasAnyDataPattern(text)) {
      return { classification: 'OBSOLETE_DUPLICATE_SOURCE', allowed: false }
    }
    return { classification: 'STATIC_SITE_COPY', allowed: true }
  }

  if (rel.startsWith('content/')) {
    return { classification: 'STATIC_SITE_COPY', allowed: true }
  }

  if (ext === '.md' || ext === '.mdx') {
    return { classification: 'STATIC_SITE_COPY', allowed: true }
  }

  if (rel === 'public/manifest.json' || rel === 'public/blend-guide.txt') {
    return { classification: 'STATIC_SITE_COPY', allowed: true }
  }

  if (EXPLICIT_BLOCK_PATHS.has(rel)) {
    return { classification: 'OBSOLETE_DUPLICATE_SOURCE', allowed: false }
  }

  if (DATA_FILE_EXTENSIONS.has(ext) && !rel.startsWith('public/data/') && !rel.startsWith('public/data-next/')) {
    if (hasAnyDataPattern(text)) {
      return { classification: 'UNKNOWN_NEEDS_REVIEW', allowed: false }
    }
  }

  return { classification: 'UNKNOWN_NEEDS_REVIEW', allowed: false }
}

function issueFor({ rel, classification, entityType, problem, severity = 'error', fixTarget = 'WORKBOOK_FIX', suggestedWorkbookAction = null, suggestedProcessAction = null }) {
  return {
    severity,
    path: rel,
    classification,
    entityType,
    problem,
    fixTarget,
    suggestedWorkbookAction,
    suggestedProcessAction,
  }
}

const files = walk(repoRoot)
const issues = []
for (const abs of files) {
  const rel = path.relative(repoRoot, abs).replaceAll(path.sep, '/')
  const ext = path.extname(rel).toLowerCase()
  if (!SCAN_EXTENSIONS.has(ext)) continue
  if (rel === 'reports/source-of-truth-audit.json' || rel === 'reports/source-of-truth-audit.md') continue

  const text = fs.readFileSync(abs, 'utf8')
  const matched = hasAnyDataPattern(text)
  if (!matched && !(DATA_CODE_PREFIXES.some((p) => rel.startsWith(p)) && looksLikeHardcodedDataBlob(text))) continue

  const { classification, allowed } = classifyFile(rel, text)

  if (classification === 'GENERATED_OUTPUT') {
    issues.push(issueFor({
      rel,
      classification,
      entityType: matched?.entityType ?? 'unknown',
      problem: 'Workbook-derived generated output contains production data. Do not edit directly.',
      severity: 'warning',
      fixTarget: 'WORKBOOK_GPT_FIX',
      suggestedProcessAction: 'Adjust workbook->generator pipeline and regenerate from data-sources/herb_monograph_master.xlsx.',
    }))
    continue
  }

  if (!allowed) {
    const fixTarget = classification === 'UNKNOWN_NEEDS_REVIEW' ? 'WORKBOOK_GPT_FIX' : 'WORKBOOK_FIX'
    issues.push(issueFor({
      rel,
      classification,
      entityType: matched?.entityType ?? 'unknown',
      problem: 'Production-like herb/compound/relationship/safety/reference/publication/educational content exists outside the canonical workbook flow.',
      severity: 'error',
      fixTarget,
      suggestedWorkbookAction: fixTarget === 'WORKBOOK_FIX' ? 'Move canonical records into workbook sheets and regenerate outputs.' : null,
      suggestedProcessAction: fixTarget === 'WORKBOOK_GPT_FIX' ? 'Quarantine/delete duplicate source or add a documented generator if this file is intentionally derived.' : null,
    }))
  }
}

const blockingCount = issues.filter((i) => i.severity === 'error').length
const summary = {
  generatedAt: new Date().toISOString(),
  workbookSourceOfTruth: APPROVED_SOURCE,
  scannedExtensions: [...SCAN_EXTENSIONS],
  blockingCount,
  warningCount: issues.length - blockingCount,
  issueCount: issues.length,
  issues,
}

fs.mkdirSync(reportDir, { recursive: true })
fs.writeFileSync(path.join(reportDir, 'source-of-truth-audit.json'), JSON.stringify(summary, null, 2) + '\n')

const md = [
  '# Source-of-Truth Audit',
  '',
  `- Workbook source of truth: \`${APPROVED_SOURCE}\``,
  `- Generated at: ${summary.generatedAt}`,
  `- Scanned extensions: ${summary.scannedExtensions.join(', ')}`,
  `- Blocking issues: ${blockingCount}`,
  `- Warnings: ${summary.warningCount}`,
  '',
  '## Issues',
  '',
  ...issues.map((i, idx) => `### ${idx + 1}. ${i.severity.toUpperCase()} — ${i.entityType}\n- path: \`${i.path}\`\n- classification: ${i.classification}\n- problem: ${i.problem}\n- fixTarget: ${i.fixTarget}\n- suggestedWorkbookAction: ${i.suggestedWorkbookAction ?? 'n/a'}\n- suggestedProcessAction: ${i.suggestedProcessAction ?? 'n/a'}\n`),
]
fs.writeFileSync(path.join(reportDir, 'source-of-truth-audit.md'), md.join('\n'))

console.log(`[source-of-truth-audit] issues=${issues.length} blocking=${blockingCount}`)
console.log('[source-of-truth-audit] wrote reports/source-of-truth-audit.json')
console.log('[source-of-truth-audit] wrote reports/source-of-truth-audit.md')

if (blockingCount > 0) process.exit(1)
