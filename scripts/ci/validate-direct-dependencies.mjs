import fs from 'node:fs'
import path from 'node:path'
import { builtinModules } from 'node:module'
import { execSync } from 'node:child_process'

const root = process.cwd()
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const declared = new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})])
const builtins = new Set([...builtinModules, ...builtinModules.map(m => `node:${m}`)])
const optionalProbes = new Set(['exceljs'])
const output = execSync("rg -l 'import |require\\(' --glob '*.{js,mjs,cjs,ts,tsx}' .", { encoding: 'utf8' })
const files = output.trim().split('\n').filter(Boolean).map(f => f.replace(/^\.\//, ''))
const unresolved = []
const re = /from\s+['\"]([^'\"]+)['\"]|require\(['\"]([^'\"]+)['\"]\)/g

for (const rel of files) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8')
  let m
  while ((m = re.exec(txt))) {
    const spec = m[1] || m[2]
    if (!spec || spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('/')) continue
    const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    if (builtins.has(spec) || builtins.has(name) || optionalProbes.has(name) || declared.has(name)) continue
    unresolved.push(`${rel}: ${name}`)
  }
}

if (unresolved.length) {
  console.error('Undeclared direct dependencies:\n' + [...new Set(unresolved)].join('\n'))
  process.exit(1)
}

console.log('validate-direct-dependencies: OK')
