import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.join(process.cwd(), 'scripts')
const scriptExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx'])
const emptyCatch = /catch\s*\{\s*\}/g

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (path.relative(root, full).split(path.sep)[0] === 'dev') continue
      files.push(...walk(full))
      continue
    }
    if (entry.isFile() && scriptExtensions.has(path.extname(entry.name))) files.push(full)
  }
  return files
}

describe('non-dev script empty catches', () => {
  it('keeps literal empty catch blocks out of scripts governed by ESLint no-empty', () => {
    const offenders = []
    for (const file of walk(root)) {
      const source = fs.readFileSync(file, 'utf8')
      if (emptyCatch.test(source)) offenders.push(path.relative(process.cwd(), file).split(path.sep).join('/'))
      emptyCatch.lastIndex = 0
    }

    expect(offenders).toEqual([])
  })
})
