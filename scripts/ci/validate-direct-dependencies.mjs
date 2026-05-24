import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { builtinModules } from 'node:module'
import { execFileSync } from 'node:child_process'

const builtinSet = new Set([...builtinModules, ...builtinModules.map(m => `node:${m}`)])
const optionalProbes = new Set(['exceljs'])
const sourceRoots = ['app', 'components', 'src', 'lib', 'scripts', 'data', 'config']
const sourceFiles = ['next.config.mjs', 'tailwind.config.ts', 'postcss.config.js']
const ignored = ['node_modules', '.next', 'out', 'dist', 'coverage', '.git']

const parseUndeclaredDependencies = ({ root, declared }) => {
  const scanTargets = [
    ...sourceRoots.filter((dir) => fs.existsSync(path.join(root, dir))),
    ...sourceFiles.filter((file) => fs.existsSync(path.join(root, file)))
  ]

  if (scanTargets.length === 0) return []

  const args = [
    '-l',
    'import\\s+|require\\(',
    '--glob',
    '*.{js,mjs,cjs,ts,tsx}',
    ...ignored.flatMap((dir) => ['--glob', `!${dir}/**`]),
    ...scanTargets
  ]

  const output = execFileSync('rg', args, { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
  const files = output.trim().split('\n').filter(Boolean).map((f) => f.replace(/^\.\//, ''))
  const unresolved = []
  const re = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g

  for (const rel of files) {
    const txt = fs.readFileSync(path.join(root, rel), 'utf8')
    let m
    while ((m = re.exec(txt))) {
      const spec = m[1] || m[2]
      if (!spec || spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('/')) continue
      const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
      if (builtinSet.has(spec) || builtinSet.has(name) || optionalProbes.has(name) || declared.has(name)) continue
      unresolved.push(`${rel}: ${name}`)
    }
  }

  return [...new Set(unresolved)]
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

console.log('validate-direct-dependencies: OK')
