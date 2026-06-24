#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()

const CLIENT_FACING_ROOTS = [
  'app',
  'components',
  'src',
]

const ALLOWED_SERVER_STATIC_FILES = new Set([
  path.normalize('src/lib/runtime-data.ts'),
])

const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
])

const FORBIDDEN_PUBLIC_DATA_IMPORTS = [
  'public/data/herbs.json',
  'public/data/compounds.json',
  'public/data/herbs_combined_updated.json',
  'public/data/graph/nodes.json',
  'public/data/graph/relationships.json',
]

const FORBIDDEN_DATA_PATHS = [
  '/data/herbs.json',
  '/data/compounds.json',
  '/data/herbs_combined_updated.json',
  '/data/graph/nodes.json',
  '/data/graph/relationships.json',
]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out') continue

    const absolutePath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath))
      continue
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath)
    }
  }

  return files
}

function normalizeImportPath(value) {
  return value.replaceAll('\\', '/')
}

function isAllowedFile(relativePath) {
  return ALLOWED_SERVER_STATIC_FILES.has(path.normalize(relativePath))
}

function hasForbiddenPublicDataImport(line) {
  const normalizedLine = normalizeImportPath(line)

  const looksLikeStaticImport = /^\s*import\s/.test(normalizedLine)
  const looksLikeDynamicImport = /\bimport\s*\(/.test(normalizedLine)
  const looksLikeRequire = /\brequire\s*\(/.test(normalizedLine)
  const looksLikeFetch = /\bfetch\s*\(/.test(normalizedLine)

  if (!looksLikeStaticImport && !looksLikeDynamicImport && !looksLikeRequire && !looksLikeFetch) {
    return false
  }

  return [
    ...FORBIDDEN_PUBLIC_DATA_IMPORTS,
    ...FORBIDDEN_DATA_PATHS,
  ].some(forbiddenPath => normalizedLine.includes(forbiddenPath))
}

async function main() {
  const files = []

  for (const root of CLIENT_FACING_ROOTS) {
    const absoluteRoot = path.join(repoRoot, root)
    try {
      files.push(...await walk(absoluteRoot))
    } catch {
      // Some roots may not exist in trimmed branches. Missing roots are not failures.
    }
  }

  const failures = []

  for (const filePath of files) {
    const relativePath = path.relative(repoRoot, filePath)
    if (isAllowedFile(relativePath)) continue

    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (hasForbiddenPublicDataImport(line)) {
        failures.push(`${relativePath}:${index + 1}: ${line.trim()}`)
      }
    })
  }

  if (failures.length > 0) {
    console.error('Broad public JSON payload imports are not allowed in client-facing code. Use summary indexes or slug-specific detail payloads instead.\n')

    for (const failure of failures) {
      console.error(`- ${failure}`)
    }

    process.exit(1)
  }

  console.log('Public JSON import governance OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
