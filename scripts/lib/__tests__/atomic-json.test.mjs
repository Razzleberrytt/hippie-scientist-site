import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { writeFileAtomic, writeJsonAtomic } from '../atomic-json.mjs'

let dir

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-json-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('writeFileAtomic', () => {
  it('writes the exact bytes it was given', () => {
    const file = path.join(dir, 'plain.json')
    writeFileAtomic(file, '{"a":1}\n')
    expect(fs.readFileSync(file, 'utf8')).toBe('{"a":1}\n')
  })

  it('creates missing parent directories', () => {
    const file = path.join(dir, 'herbs-detail', 'nested', 'berberis-aristata.json')
    writeFileAtomic(file, '{}\n')
    expect(fs.existsSync(file)).toBe(true)
  })

  it('leaves no temp files behind', () => {
    const file = path.join(dir, 'clean.json')
    writeFileAtomic(file, 'one')
    writeFileAtomic(file, 'two')
    expect(fs.readdirSync(dir)).toEqual(['clean.json'])
  })

  it('replaces existing content rather than appending to it', () => {
    const file = path.join(dir, 'replace.json')
    writeFileAtomic(file, 'a'.repeat(500))
    writeFileAtomic(file, 'b')
    expect(fs.readFileSync(file, 'utf8')).toBe('b')
  })

  it('succeeds while a reader holds the target file open', () => {
    // The pipeline failure this module exists for: a stage writes a file while
    // another handle on it is still open. Node's own read handles are opened
    // without FILE_SHARE_DELETE, so rename is refused here with EPERM and the
    // direct-write fallback is what completes the write. That is precisely the
    // lock shape rename alone does not cover, so this test pins the fallback.
    const file = path.join(dir, 'held.json')
    fs.writeFileSync(file, 'original')

    const reader = fs.openSync(file, 'r')
    try {
      writeFileAtomic(file, 'replacement')
      expect(fs.readFileSync(file, 'utf8')).toBe('replacement')
    } finally {
      fs.closeSync(reader)
    }
  })

  it('surfaces a non-transient failure instead of silently succeeding', () => {
    // A directory standing where the target file should be is a real error,
    // not a lock. It must not be retried away or swallowed.
    const file = path.join(dir, 'is-a-directory')
    fs.mkdirSync(file)
    expect(() => writeFileAtomic(file, 'x')).toThrow(/failed to write/)
  })
})

describe('writeJsonAtomic', () => {
  it('matches the pipeline’s canonical serialization byte for byte', () => {
    const value = { slug: 'berberis-aristata', evidence: ['a', 'b'] }
    const file = path.join(dir, 'canonical.json')
    writeJsonAtomic(file, value)
    expect(fs.readFileSync(file, 'utf8')).toBe(`${JSON.stringify(value, null, 2)}\n`)
  })

  it('can omit the trailing newline for callers that preserve input shape', () => {
    const file = path.join(dir, 'no-newline.json')
    writeJsonAtomic(file, { a: 1 }, { trailingNewline: false })
    expect(fs.readFileSync(file, 'utf8')).toBe(JSON.stringify({ a: 1 }, null, 2))
  })
})
