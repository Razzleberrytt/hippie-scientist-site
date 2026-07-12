import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { builtinModules } from 'node:module'

const experimentalBuiltins = ['node:sqlite']
const builtinSet = new Set([...builtinModules, ...builtinModules.map(m => `node:${m}`), ...experimentalBuiltins])
const optionalProbes = new Set(['exceljs', 'glob', 'react-plotly.js'])
const generatedImports = new Set(['content-collections'])
const sourceRoots = ['app', 'components', 'src', 'lib', 'scripts', 'data', 'config']
const sourceFiles = ['next.config.mjs', 'tailwind.config.ts', 'postcss.config.js']
const ignored = new Set(['node_modules', '.next', 'out', 'dist', 'coverage', '.git'])
const sourceExts = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx'])

const toPosix = (value) => value.split(path.sep).join('/')

const shouldIgnorePath = (relPath) => {
  const parts = toPosix(relPath).split('/')
  return parts.some((part) => ignored.has(part))
}

const collectSourceFiles = ({ root, scanTargets }) => {
  const files = []

  const walk = (absPath, relPath) => {
    if (shouldIgnorePath(relPath)) return

    let entries
    try {
      entries = fs.readdirSync(absPath, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const childAbs = path.join(absPath, entry.name)
      const childRel = path.join(relPath, entry.name)

      if (entry.isDirectory()) {
        walk(childAbs, childRel)
        continue
      }

      if (!entry.isFile()) continue
      if (!sourceExts.has(path.extname(entry.name))) continue
      files.push(toPosix(childRel))
    }
  }

  for (const target of scanTargets) {
    const abs = path.join(root, target)
    if (!fs.existsSync(abs)) continue

    const stat = fs.statSync(abs)

    if (stat.isDirectory()) {
      walk(abs, target)
      continue
    }

    if (stat.isFile() && sourceExts.has(path.extname(target)) && !shouldIgnorePath(target)) {
      files.push(toPosix(target))
    }
  }

  return [...new Set(files)].sort()
}

const parseUndeclaredDependencies = ({ root, declared }) => {
  const scanTargets = [
    ...sourceRoots.filter((dir) => fs.existsSync(path.join(root, dir))),
    ...sourceFiles.filter((file) => fs.existsSync(path.join(root, file)))
  ]

  if (scanTargets.length === 0) return []

  const files = collectSourceFiles({ root, scanTargets })
  const unresolved = []
  const re = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g

  for (const rel of files) {
    const txt = fs.readFileSync(path.join(root, rel), 'utf8')
    let m

    while ((m = re.exec(txt))) {
      const spec = m[1] || m[2]
      if (!spec || spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('/')) continue

      const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]

      if (
        builtinSet.has(spec) ||
        builtinSet.has(name) ||
        optionalProbes.has(name) ||
        generatedImports.has(name) ||
        declared.has(name)
      ) continue

      unresolved.push(`${rel}: ${name}`)
    }
  }

  return [...new Set(unresolved)].sort()
}

const runSelfTest = () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-validator-'))
  fs.mkdirSync(path.join(fixtureRoot, 'app'), { recursive: true })
  fs.mkdirSync(path.join(fixtureRoot, 'node_modules', 'badpkg'), { recursive: true })
  fs.writeFileSync(path.join(fixtureRoot, 'package.json'), JSON.stringify({ dependencies: { react: '1.0.0' } }))

  const missingImport = "const req = " + "requ" + "ire('missing-package')\n"
  fs.writeFileSync(path.join(fixtureRoot, 'app', 'page.tsx'), "import React from 'react'\n" + missingImport)

  const ignoredImport = "const dep = " + "requ" + "ire('another-missing')\n"
  fs.writeFileSync(path.join(fixtureRoot, 'node_modules', 'badpkg', 'index.js'), ignoredImport)

  const unresolved = parseUndeclaredDependencies({ root: fixtureRoot, declared: new Set(['react']) })
  if (!unresolved.some((line) => line.includes('missing-package'))) throw new Error('Expected missing-package to be reported')
  if (unresolved.some((line) => line.includes('another-missing'))) throw new Error('node_modules should be excluded from scan')
  console.log('validate-direct-dependencies: self-test OK')
}

if (process.argv.includes('--self-test')) {
  runSelfTest()
  process.exit(0)
}

const root = process.cwd()
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const declared = new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})])
const unresolved = parseUndeclaredDependencies({ root, declared })

if (unresolved.length) {
  console.error('Undeclared direct dependencies:\n' + unresolved.join('\n'))
  process.exit(1)
}

// openai guard/check: must not be imported from client-facing code (app/, components/) to prevent prod bundle bloat. Only scripts/agent.
const openaiClientUsages = []
const clientPaths = ['app', 'components']
const openaiImportRe = /from ['"]openai['"]|require\(['"]openai['"]/
for (const base of clientPaths) {
  const basePath = path.join(root, base)
  if (!fs.existsSync(basePath)) continue
  const walk = (p) => {
    let ents
    try { ents = fs.readdirSync(p, { withFileTypes: true }) } catch { return }
    for (const e of ents) {
      const fp = path.join(p, e.name)
      const rel = toPosix(path.relative(root, fp))
      if (shouldIgnorePath(rel)) continue
      if (e.isDirectory()) {
        walk(fp)
      } else if (sourceExts.has(path.extname(e.name))) {
        try {
          const c = fs.readFileSync(fp, 'utf8')
          if (openaiImportRe.test(c)) openaiClientUsages.push(rel)
        } catch { /* ignore */ }
      }
    }
  }
  walk(basePath)
}
if (openaiClientUsages.length) {
  console.error('openai imported from client code (forbidden; move usage to scripts/ or agent/ only):\n' + openaiClientUsages.join('\n'))
  process.exit(1)
}

console.log('validate-direct-dependencies: OK')
