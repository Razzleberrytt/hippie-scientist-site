#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const requireFromRoot = createRequire(path.join(root, 'package.json'))

const installMessage = 'Dependencies are not installed. Run: npm ci'

const requiredPackages = [
  '@content-collections/cli',
  'eslint',
  'exceljs',
  'next',
  'pagefind',
  'react',
  'react-dom',
  'sharp',
  'tsx',
  'typescript',
  'vitest',
  'wrangler',
]

const requiredBins = [
  'content-collections',
  'eslint',
  'next',
  'pagefind',
  'tsc',
  'tsx',
  'vitest',
  'wrangler',
]

function binExists(name) {
  const extensions = process.platform === 'win32' ? ['', '.cmd', '.ps1'] : ['']
  return extensions.some((ext) => fs.existsSync(path.join(root, 'node_modules', '.bin', `${name}${ext}`)))
}

const missing = []

if (!fs.existsSync(path.join(root, 'node_modules'))) {
  missing.push('node_modules/')
}

for (const packageName of requiredPackages) {
  try {
    requireFromRoot.resolve(packageName)
  } catch {
    if (
      !fs.existsSync(path.join(root, 'node_modules', packageName)) &&
      !fs.existsSync(path.join(root, 'node_modules', packageName, 'package.json'))
    ) {
      missing.push(packageName)
    }
  }
}

for (const binName of requiredBins) {
  if (!binExists(binName)) {
    missing.push(`node_modules/.bin/${binName}`)
  }
}

if (missing.length > 0) {
  console.error(installMessage)
  console.error(`Missing dependency artifacts: ${missing.join(', ')}`)
  process.exit(1)
}
