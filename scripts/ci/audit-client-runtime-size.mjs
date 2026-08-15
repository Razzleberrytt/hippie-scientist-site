#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reportPath = path.join(root, 'reports/client-runtime-size.json')
const roots = ['app', 'components', 'src/components', 'lib', 'src/lib']
const warningKb = 18
const errorKb = 45

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const codeFiles = roots.flatMap((dir) => walk(path.join(root, dir))).filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
const clientModules = []
const warnings = []
const errors = []

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8')
  if (!/^\s*['"]use client['"]/m.test(text)) continue
  const sizeKb = Buffer.byteLength(text) / 1024
  const relative = path.relative(root, file).split(path.sep).join('/')
  clientModules.push({ file: relative, sizeKb: Number(sizeKb.toFixed(1)) })
  if (sizeKb >= errorKb) errors.push(`${relative} is ${sizeKb.toFixed(1)}KB inside a client boundary`)
  else if (sizeKb >= warningKb) warnings.push(`${relative} is ${sizeKb.toFixed(1)}KB inside a client boundary`)
}

const layoutPath = path.join(root, 'app/layout.tsx')
const layout = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : ''
const globalStylesheets = [...layout.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map((match) => match[1])
if (globalStylesheets.length > 28) warnings.push(`app/layout.tsx imports ${globalStylesheets.length} global stylesheets`)

const report = {
  generatedAt: new Date().toISOString(),
  budgets: { warningKb, errorKb, globalStylesheetWarning: 28 },
  clientModules: clientModules.sort((a, b) => b.sizeKb - a.sizeKb),
  globalStylesheets,
  warnings,
  errors,
}
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`[client-runtime-size] ${clientModules.length} client modules; ${warnings.length} warnings; ${errors.length} errors`)
if (errors.length) process.exitCode = 1
