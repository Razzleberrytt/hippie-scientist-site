#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const requireFromRoot = createRequire(path.join(root, 'package.json'))

const installMessage = 'Dependencies are not installed. Running: npm ci'
const installDisabledMessage = 'Dependencies are not installed. Run: npm ci'
const autoInstallDisabled = process.env.SKIP_AUTO_NPM_CI === '1' || process.env.NO_AUTO_INSTALL === '1'
const packageLockPath = path.join(root, 'package-lock.json')

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

function getMissingDependencies() {
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

  return missing
}

let missing = getMissingDependencies()

if (missing.length === 0) {
  process.exit(0)
}

if (autoInstallDisabled || !fs.existsSync(packageLockPath)) {
  console.error(installDisabledMessage)
  console.error(`Missing dependency artifacts: ${missing.join(', ')}`)
  process.exit(1)
}

console.warn(installMessage)
console.warn(`Missing dependency artifacts: ${missing.join(', ')}`)

const install = spawnSync('npm', ['ci'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (install.status !== 0) {
  console.error('Automatic npm ci failed. Run it manually, then retry the command.')
  process.exit(install.status ?? 1)
}

missing = getMissingDependencies()

if (missing.length > 0) {
  console.error('Dependencies are still missing after npm ci.')
  console.error(`Missing dependency artifacts: ${missing.join(', ')}`)
  process.exit(1)
}
