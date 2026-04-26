import fs from 'node:fs'
import path from 'node:path'
import { getRepoRoot } from './workbook-source.mjs'

const TARGETS = ['public/data', 'public/data-next', 'public/data/projections']

function walkFiles(dirPath) {
  const files = []
  const stack = [dirPath]

  while (stack.length > 0) {
    const current = stack.pop()
    const entries = fs.readdirSync(current, { withFileTypes: true })

    for (const entry of entries) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(absolute)
      } else if (entry.isFile()) {
        files.push(absolute)
      }
    }
  }

  return files
}

function summarizeDirectory(rootDir, relativeDir) {
  const absoluteDir = path.resolve(rootDir, relativeDir)
  const exists = fs.existsSync(absoluteDir) && fs.statSync(absoluteDir).isDirectory()

  console.log(`\n[check-generated-output] ${relativeDir}`)
  console.log(`- status: ${exists ? 'exists' : 'missing'}`)

  if (!exists) {
    return
  }

  const files = walkFiles(absoluteDir)
  const jsonFiles = files.filter((filePath) => filePath.toLowerCase().endsWith('.json'))
  const nonJsonFiles = files.length - jsonFiles.length

  const largest = files
    .map((filePath) => ({
      filePath,
      size: fs.statSync(filePath).size,
      relativeFilePath: path.relative(rootDir, filePath),
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)

  const subfolders = fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))

  console.log(`- total file count: ${files.length}`)
  console.log(`- JSON file count: ${jsonFiles.length}`)
  console.log(`- non-JSON file count: ${nonJsonFiles}`)
  console.log('- 5 largest files by byte size:')

  if (!largest.length) {
    console.log('  - (none)')
  } else {
    for (const item of largest) {
      console.log(`  - ${item.relativeFilePath}: ${item.size} bytes`)
    }
  }

  console.log('- subfolders present:')
  if (!subfolders.length) {
    console.log('  - (none)')
  } else {
    for (const folder of subfolders) {
      console.log(`  - ${folder}`)
    }
  }
}

try {
  const rootDir = getRepoRoot()
  for (const target of TARGETS) {
    summarizeDirectory(rootDir, target)
  }
  process.exit(0)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exit(1)
}
