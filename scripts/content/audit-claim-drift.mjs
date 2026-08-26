#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'reports')
const JSON_REPORT = path.join(REPORT_DIR, 'content-claim-drift.json')
const MD_REPORT = path.join(REPORT_DIR, 'content-claim-drift.md')

const args = new Set(process.argv.slice(2))
const failOnCritical = args.has('--fail-on-critical')
const changedFromArg = [...args].find((arg) => arg.startsWith('--changed-from='))
const changedFrom = changedFromArg?.slice('--changed-from='.length) || null

const SCAN_ROOTS = ['app', 'components', 'content']
const EXTRA_SCAN_FILES = ['config/profile-verdicts.ts']
const SCAN_PATHS = [...SCAN_ROOTS, ...EXTRA_SCAN_FILES]
const CONTENT_EXTENSIONS = new Set(['.tsx', '.ts', '.md', '.mdx'])
const EXCLUDED_SEGMENTS = new Set([
  '__tests__',
  'node_modules',
  '.next',
  'out',
  'reports',
  'fixtures',
  'snapshots',
])

const RULES = [
  {
    id: 'directive-precise-dose',
    severity: 'critical',
    description: 'Precise dose is framed as a directive instead of study/product context.',
    pattern: /\b(?:take|use|start(?:\s+with)?|keep(?:\s+(?:it|dose))?\s+(?:to|at)|should\s+be\s+kept|recommended\s+dose|dose\s+should\s+be)\b[^\n.]{0,90}\b\d+(?:\.\d+)?\s*(?:mcg|µg|mg|g|iu|milligrams?|grams?)\b/gi,
    qualification: /\b(?:study|trial|tested|used\s+in|research|label|not\s+a\s+recommendation|not\s+medical\s+advice|clinician|prescriber)\b/i,
  },
  {
    id: 'absolute-safety-language',
    severity: 'critical',
    description: 'Absolute or near-absolute safety wording can outrun the evidence.',
    pattern: /\b(?:very\s+low\s+risk|no\s+risk|zero\s+risk|completely\s+safe|totally\s+safe|safe\s+for\s+everyone|interaction[- ]free|no\s+interactions?)\b/gi,
  },
  {
    id: 'precise-onset',
    severity: 'high',
    description: 'Precise onset/time-to-effect language needs study/population context.',
    pattern: /\b(?:onset\s*:?|works?\s+within|kicks?\s+in\s+(?:within|after)?|takes?\s+effect\s+(?:within|after)?)\s*[^\n.]{0,55}\b\d+(?:\s*(?:-|–|to)\s*\d+)?\s*(?:minutes?|mins?|hours?|hrs?|days?|weeks?)\b/gi,
    qualification: /\b(?:study|trial|tested|observed|reported|research|participants?|median|mean|average|range)\b/i,
  },
  {
    id: 'symptom-to-ingredient-match',
    severity: 'high',
    description: 'Deterministic symptom-to-ingredient routing can become an unsupported recommendation.',
    pattern: /\bif\s+(?:you|your)[^\n.]{0,110}\b(?:melatonin|magnesium|l-theanine|theanine|valerian|ashwagandha|glycine|apigenin|passionflower|lemon\s+balm|kava|rhodiola)\b[^\n.]{0,90}\b(?:help|supports?|best|better|try|choose|use|take|can)\b/gi,
  },
  {
    id: 'best-for-or-works-for',
    severity: 'medium',
    description: 'Best-for/works-for language should be tied to evidence strength and the studied population/outcome.',
    pattern: /\b(?:best\s+for|works?\s+for|ideal\s+for|perfect\s+for)\b/gi,
  },
  {
    id: 'mechanism-as-outcome',
    severity: 'medium',
    description: 'Mechanistic language appears to promise a human outcome without an uncertainty qualifier.',
    pattern: /\b(?:increases?|boosts?|raises?|reduces?|lowers?|modulates?|blocks?|inhibits?|activates?)\s+(?:gaba|serotonin|dopamine|cortisol|alpha\s+brain\s+waves?|nmda|glutamate)[^\n.]{0,110}\b(?:to|thereby|which)\s+(?:relax|calm|improve|promote|reduce|lower|help|support)/gi,
    qualification: /\b(?:may|might|could|plausib|mechanis|preclinical|animal|in\s+vitro|hypothes|uncertain)\b/i,
  },
  {
    id: 'hardcoded-public-metric',
    severity: 'high',
    description: 'Public coverage metrics should come from the canonical generated metrics object, not literals.',
    pattern: /\b\d{2,}[,+]?\s+(?:structured\s+stud(?:y|ies)|stud(?:y|ies)|human[- ]evidence\s+sources?|human\s+trials?|herbs?|compounds?|profiles?)\b/gi,
  },
]

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

function shouldScanFile(filePath) {
  const rel = normalizePath(path.relative(ROOT, filePath))
  const segments = rel.split('/')
  if (segments.some((segment) => EXCLUDED_SEGMENTS.has(segment))) return false
  if (!CONTENT_EXTENSIONS.has(path.extname(filePath))) return false
  if (rel.startsWith('app/api/')) return false
  return true
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDED_SEGMENTS.has(entry.name)) files.push(...walk(full))
    } else if (entry.isFile() && shouldScanFile(full)) {
      files.push(full)
    }
  }
  return files
}

function changedFilesSince(ref) {
  if (!ref) return null
  try {
    const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${ref}...HEAD`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return new Set(output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
  } catch (error) {
    console.warn(`[claim-drift] Could not resolve changed files from ${ref}: ${error.message}`)
    return null
  }
}

function addedLinesSince(ref) {
  if (!ref) return null
  try {
    const output = execFileSync(
      'git',
      ['diff', '--unified=0', '--diff-filter=ACMR', `${ref}...HEAD`, '--', ...SCAN_PATHS],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const added = new Map()
    let currentFile = null
    let newLine = null

    for (const line of output.split(/\r?\n/)) {
      if (line.startsWith('+++ b/')) {
        currentFile = line.slice('+++ b/'.length)
        if (!added.has(currentFile)) added.set(currentFile, new Set())
        continue
      }

      const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (hunk) {
        newLine = Number(hunk[1])
        continue
      }

      if (!currentFile || newLine == null) continue
      if (line.startsWith('+') && !line.startsWith('+++')) {
        added.get(currentFile).add(newLine)
        newLine += 1
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        // Removed lines do not advance the new-file line counter.
      } else if (line.startsWith(' ')) {
        newLine += 1
      }
    }

    return added
  } catch (error) {
    console.warn(`[claim-drift] Could not resolve added lines from ${ref}: ${error.message}`)
    return null
  }
}

function staticRouteForFile(relativeFile) {
  if (!relativeFile.startsWith('app/') || !relativeFile.endsWith('/page.tsx')) return null
  const route = relativeFile.slice('app'.length, -'/page.tsx'.length) || '/'
  if (route.includes('[') || route.includes(']')) return null
  return route === '/' ? '/' : `${route.replace(/\/+$/, '')}/`
}

function normalizeIntentText(value) {
  return value
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, ' ')
    .replace(/\b(?:guide|guides|evidence|review|reviews|research|science|scientific|what|the|a|an)\b/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function extractTitle(text) {
  const metadataTitle = text.match(/\btitle\s*:\s*['"`]([^'"`]{8,180})['"`]/)
  if (metadataTitle) return metadataTitle[1].trim()
  const markdownTitle = text.match(/^#\s+(.+)$/m)
  if (markdownTitle) return markdownTitle[1].trim()
  const h1Text = text.match(/<h1[^>]*>\s*([^<{][^<]{4,180})\s*<\/h1>/i)
  return h1Text?.[1]?.trim() || ''
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length
}

function excerptAround(text, index, length = 180) {
  const start = Math.max(0, index - Math.floor(length / 3))
  const end = Math.min(text.length, start + length)
  return text.slice(start, end).replace(/\s+/g, ' ').trim()
}

function nearbyContext(text, index, radius = 180) {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius))
}

function countExternalResearchSources(text) {
  const urls = text.match(/https?:\/\/[^'"\s)]+/gi) || []
  return urls.filter((url) => /(?:pubmed\.ncbi\.nlm\.nih\.gov|doi\.org|cochranelibrary\.com|clinicaltrials\.gov|nccih\.nih\.gov|ods\.od\.nih\.gov)/i.test(url)).length
}

function newestExplicitSourceYear(text) {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]))
  return years.length ? Math.max(...years) : null
}

const allFiles = [
  ...SCAN_ROOTS.flatMap((dir) => walk(path.join(ROOT, dir))),
  ...EXTRA_SCAN_FILES
    .map((file) => path.join(ROOT, file))
    .filter((file) => fs.existsSync(file) && shouldScanFile(file)),
]
  .map((file) => normalizePath(path.relative(ROOT, file)))
  .sort()
const changedSet = changedFilesSince(changedFrom)
const addedLineMap = addedLinesSince(changedFrom)

if (changedFrom && failOnCritical && (!changedSet || !addedLineMap)) {
  console.error(`[claim-drift] FAIL: cannot prove newly introduced critical lines against ${changedFrom}`)
  process.exit(1)
}

const scanSet = changedSet ? new Set([...changedSet].filter((file) => allFiles.includes(file))) : new Set(allFiles)
const findings = []
const pageInventory = []

for (const relativeFile of allFiles) {
  const fullPath = path.join(ROOT, relativeFile)
  const text = fs.readFileSync(fullPath, 'utf8')
  const route = staticRouteForFile(relativeFile)
  const title = extractTitle(text)
  if (route) {
    pageInventory.push({
      file: relativeFile,
      route,
      title,
      intentKey: normalizeIntentText(title || route.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') || ''),
    })
  }

  if (!scanSet.has(relativeFile)) continue

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0
    for (const match of text.matchAll(rule.pattern)) {
      const context = nearbyContext(text, match.index)
      if (rule.qualification?.test(context)) continue
      const line = lineNumberAt(text, match.index)
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        description: rule.description,
        file: relativeFile,
        route,
        line,
        introduced: !changedFrom || Boolean(addedLineMap?.get(relativeFile)?.has(line)),
        excerpt: excerptAround(text, match.index),
      })
    }
  }

  if (relativeFile === 'config/profile-verdicts.ts') {
    for (const match of text.matchAll(/\bbestFor\s*:\s*\[/g)) {
      const line = lineNumberAt(text, match.index)
      findings.push({
        severity: 'medium',
        rule: 'profile-verdict-best-for',
        description: 'Profile verdict bestFor fields are strong reader-routing claims; review them against evidence strength and the canonical profile.',
        file: relativeFile,
        route: null,
        line,
        introduced: !changedFrom || Boolean(addedLineMap?.get(relativeFile)?.has(line)),
        excerpt: excerptAround(text, match.index),
      })
    }

    for (const match of text.matchAll(/\bevaluationWindow\s*:\s*['"`][^'"`\n]{0,80}\b\d+(?:\s*(?:-|–|to)\s*\d+)?\s*(?:minutes?|hours?|days?|weeks?|months?)\b/gi)) {
      const line = lineNumberAt(text, match.index)
      findings.push({
        severity: 'medium',
        rule: 'profile-verdict-evaluation-window',
        description: 'Profile verdict evaluation windows are precise decision guidance; verify they reflect studied duration rather than a universal recommendation.',
        file: relativeFile,
        route: null,
        line,
        introduced: !changedFrom || Boolean(addedLineMap?.get(relativeFile)?.has(line)),
        excerpt: excerptAround(text, match.index),
      })
    }
  }

  // Thin-source pages are a queue signal, not a verdict. A source list with only
  // one or two recognized research links is worth review because exact claims
  // can quietly outgrow the citation base over time.
  if (route) {
    const sourceCount = countExternalResearchSources(text)
    if (sourceCount > 0 && sourceCount <= 2) {
      findings.push({
        severity: 'medium',
        rule: 'thin-research-source-base',
        description: 'Indexable page exposes only one or two recognized research-source links; review claim breadth and source freshness.',
        file: relativeFile,
        route,
        line: 1,
        introduced: !changedFrom,
        excerpt: `${sourceCount} recognized external research source${sourceCount === 1 ? '' : 's'} in source file.`,
      })
    }

    const newestYear = newestExplicitSourceYear(text)
    if (sourceCount > 0 && newestYear && newestYear <= 2021) {
      findings.push({
        severity: 'low',
        rule: 'source-recency-review',
        description: 'Newest explicit source year in this page is 2021 or earlier; queue for a literature-refresh check rather than assuming it is outdated.',
        file: relativeFile,
        route,
        line: 1,
        introduced: !changedFrom,
        excerpt: `Newest explicit year found: ${newestYear}.`,
      })
    }
  }
}

// Duplicate editorial ownership: compare normalized titles and exact final slugs
// across all static pages. This is intentionally conservative: it creates a
// review finding, not an automatic redirect decision.
const groups = new Map()
for (const page of pageInventory) {
  const slug = page.route.split('/').filter(Boolean).at(-1) || 'home'
  const keys = [page.intentKey && `title:${page.intentKey}`, `slug:${slug}`].filter(Boolean)
  for (const key of keys) {
    const list = groups.get(key) || []
    list.push(page)
    groups.set(key, list)
  }
}

const emittedDuplicateGroups = new Set()
for (const [key, pages] of groups) {
  const uniqueRoutes = [...new Map(pages.map((page) => [page.route, page])).values()]
  if (uniqueRoutes.length < 2) continue
  const groupId = uniqueRoutes.map((page) => page.route).sort().join('|')
  if (emittedDuplicateGroups.has(groupId)) continue
  emittedDuplicateGroups.add(groupId)

  const changedParticipant = !changedSet || uniqueRoutes.some((page) => changedSet.has(page.file))
  if (!changedParticipant) continue

  findings.push({
    severity: key.startsWith('title:') ? 'high' : 'medium',
    rule: 'duplicate-editorial-intent',
    description: 'Multiple static pages appear to own the same editorial intent; choose one canonical owner or document why the intents differ.',
    file: uniqueRoutes.map((page) => page.file).join(', '),
    route: uniqueRoutes.map((page) => page.route).join(' ↔ '),
    line: 1,
    introduced: false,
    excerpt: uniqueRoutes.map((page) => `${page.route}${page.title ? ` — ${page.title}` : ''}`).join(' | '),
  })
}

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
findings.sort((a, b) =>
  severityOrder[a.severity] - severityOrder[b.severity] ||
  a.file.localeCompare(b.file) ||
  a.line - b.line,
)

const counts = { critical: 0, high: 0, medium: 0, low: 0 }
for (const finding of findings) counts[finding.severity] += 1
const blockingCriticalCount = findings.filter(
  (finding) => finding.severity === 'critical' && finding.introduced,
).length

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: changedFrom ? 'changed-files-plus-global-duplicate-check' : 'full-corpus',
  changedFrom,
  scannedFiles: scanSet.size,
  inventoryFiles: allFiles.length,
  staticPagesInventoried: pageInventory.length,
  counts,
  blockingCriticalCount,
  rules: RULES.map(({ id, severity, description }) => ({ id, severity, description })),
  findings,
  notes: [
    'This is a prioritization audit, not a medical-truth engine; findings require editorial review.',
    'Source-recency findings are queue signals only. CI does not infer that an older source has been superseded.',
    'Duplicate-intent findings are conservative candidates; redirects still require checking historical traffic and page purpose.',
    'Profile-verdict bestFor and evaluationWindow fields are explicitly inventoried because they are user-facing decision claims outside ordinary page/content roots.',
    changedFrom
      ? 'PR blocking is diff-aware: only critical findings whose match begins on a newly added line count toward blockingCriticalCount.'
      : 'Full-corpus runs are report-only unless an operator explicitly supplies --fail-on-critical.',
  ],
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(JSON_REPORT, `${JSON.stringify(report, null, 2)}\n`)

const md = [
  '# Content claim-drift audit',
  '',
  `- Mode: **${report.mode}**`,
  `- Scanned files: **${report.scannedFiles}** (inventory: ${report.inventoryFiles})`,
  `- Static pages inventoried: **${report.staticPagesInventoried}**`,
  `- Critical: **${counts.critical}** · High: **${counts.high}** · Medium: **${counts.medium}** · Low: **${counts.low}**`,
  `- Newly introduced blocking critical: **${blockingCriticalCount}**`,
  '',
  '## Findings',
  '',
  ...(findings.length
    ? findings.map((finding) =>
        `- **${finding.severity.toUpperCase()} · ${finding.rule}** — \`${finding.file}:${finding.line}\`${finding.route ? ` (${finding.route})` : ''}${changedFrom ? ` · ${finding.introduced ? 'new line' : 'pre-existing in changed file'}` : ''}\n  - ${finding.description}\n  - ${finding.excerpt}`,
      )
    : ['No findings in this audit scope.']),
  '',
  '## Interpretation',
  '',
  '- Findings are review candidates, not automatic medical or SEO conclusions.',
  '- Precise dose and absolute-safety findings are the only default blocking class when `--fail-on-critical` is used.',
  '- Pull-request blocking is restricted to critical matches that begin on newly added diff lines; historical debt in an edited file remains visible but does not block unrelated edits.',
  '- Run the full audit on a schedule to maintain a content-debt queue.',
  '',
]
fs.writeFileSync(MD_REPORT, `${md.join('\n')}\n`)

console.log(`[claim-drift] scanned ${scanSet.size}/${allFiles.length} files; critical=${counts.critical} high=${counts.high} medium=${counts.medium} low=${counts.low}; blockingCritical=${blockingCriticalCount}`)
console.log(`[claim-drift] wrote ${path.relative(ROOT, JSON_REPORT)} and ${path.relative(ROOT, MD_REPORT)}`)

if (failOnCritical && blockingCriticalCount > 0) {
  console.error(`[claim-drift] FAIL: ${blockingCriticalCount} newly introduced critical finding(s)`)
  process.exit(1)
}
