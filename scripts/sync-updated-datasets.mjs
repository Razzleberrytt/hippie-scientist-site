#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'public', 'data')

const CANDIDATE_DIRS = [
  '/home/oai/share',
  '/mnt/data',
  '/tmp',
  root,
]

const FILES = [
  { source: 'herbs_combined_updated.json', target: 'herbs.json' },
  { source: 'compounds_combined_updated.json', target: 'compounds.json' },
]

function firstExistingPath(fileName) {
  for (const dir of CANDIDATE_DIRS) {
    const candidate = path.join(dir, fileName)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

fs.mkdirSync(outDir, { recursive: true })

for (const file of FILES) {
  const sourcePath = firstExistingPath(file.source)
  const targetPath = path.join(outDir, file.target)

  if (!sourcePath) {
    console.log(`[data-sync] Skipping ${file.source}; source file not found. Keeping existing ${file.target}.`)
    continue
  }

  fs.copyFileSync(sourcePath, targetPath)
  console.log(`[data-sync] Copied ${sourcePath} -> ${targetPath}`)
}
