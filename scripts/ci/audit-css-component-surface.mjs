#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reportPath = path.join(root, 'reports/css-component-surface.json')

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out') return []
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/')
}

const cssFiles = walk(path.join(root, 'styles')).concat(walk(path.join(root, 'app'))).filter((file) => file.endsWith('.css'))
const ruleMap = new Map()
for (const file of cssFiles) {
  const text = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const rawRule of text.split('}')) {
    const rule = rawRule.replace(/\s+/g, ' ').trim()
    if (rule.length < 100) continue
    const key = rule.toLowerCase()
    const files = ruleMap.get(key) || []
    files.push(relative(file))
    ruleMap.set(key, files)
  }
}

const duplicateRuleGroups = [...ruleMap.entries()]
  .map(([rule, files]) => ({ rule: rule.slice(0, 180), files: [...new Set(files)] }))
  .filter((entry) => entry.files.length > 1)

const componentFiles = walk(path.join(root, 'components')).concat(walk(path.join(root, 'src/components')))
  .filter((file) => /\.(tsx|jsx)$/.test(file))
const codeFiles = walk(path.join(root, 'app')).concat(walk(path.join(root, 'components')), walk(path.join(root, 'src')))
  .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
const corpus = codeFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
const likelyUnusedComponents = []

for (const file of componentFiles) {
  const base = path.basename(file).replace(/\.(tsx|jsx)$/, '')
  if (base.length < 3 || base === 'index') continue
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mentions = corpus.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []
  if (mentions.length <= 1) likelyUnusedComponents.push(relative(file))
}

const warnings = []
if (duplicateRuleGroups.length > 20) warnings.push(`${duplicateRuleGroups.length} substantial CSS rules appear in multiple stylesheets`)
if (likelyUnusedComponents.length) warnings.push(`${likelyUnusedComponents.length} components appear unreferenced by component name`)

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    cssFiles: cssFiles.length,
    duplicateRuleGroups: duplicateRuleGroups.length,
    componentFiles: componentFiles.length,
    likelyUnusedComponents: likelyUnusedComponents.length,
  },
  duplicateRuleGroups: duplicateRuleGroups.slice(0, 250),
  likelyUnusedComponents,
  warnings,
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log('[css-component-surface]', report.summary)
