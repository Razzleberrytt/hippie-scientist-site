import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createManifest, verifyManifest } from './governed-static-export.mjs'

const roots = []
const SOURCE_SHA = '1111111111111111111111111111111111111111'
const BASE_SHA = '2222222222222222222222222222222222222222'

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'governed-static-export-'))
  roots.push(root)
  const exportDir = path.join(root, 'out')
  fs.mkdirSync(path.join(exportDir, 'nested'), { recursive: true })
  fs.writeFileSync(path.join(exportDir, 'index.html'), '<html>home</html>')
  fs.writeFileSync(path.join(exportDir, 'nested', 'page.html'), '<html>page</html>')
  fs.writeFileSync(path.join(exportDir, 'asset.js'), 'console.log("ok")')
  const lockfilePath = path.join(root, 'package-lock.json')
  fs.writeFileSync(lockfilePath, '{"lockfileVersion":3}\n')
  return { root, exportDir, lockfilePath }
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

describe('governed static export receipt', () => {
  it('replays successfully for the exact source/base/output/lockfile identity', () => {
    const { exportDir, lockfilePath } = fixture()
    const manifest = createManifest({ sourceSha: SOURCE_SHA, baseSha: BASE_SHA, exportDir, lockfilePath, runId: '123' })

    expect(verifyManifest({ manifest, expectedSourceSha: SOURCE_SHA, expectedBaseSha: BASE_SHA, exportDir, lockfilePath })).toMatchObject({
      fileCount: 3,
      htmlFileCount: 2,
    })
  })

  it('fails closed when a consumer asks for a different source head', () => {
    const { exportDir, lockfilePath } = fixture()
    const manifest = createManifest({ sourceSha: SOURCE_SHA, baseSha: BASE_SHA, exportDir, lockfilePath })

    expect(() => verifyManifest({
      manifest,
      expectedSourceSha: '3333333333333333333333333333333333333333',
      expectedBaseSha: BASE_SHA,
      exportDir,
      lockfilePath,
    })).toThrow(/source SHA mismatch/)
  })

  it('fails closed when output changes after the receipt is created', () => {
    const { exportDir, lockfilePath } = fixture()
    const manifest = createManifest({ sourceSha: SOURCE_SHA, baseSha: BASE_SHA, exportDir, lockfilePath })
    fs.writeFileSync(path.join(exportDir, 'index.html'), '<html>tampered</html>')

    expect(() => verifyManifest({ manifest, expectedSourceSha: SOURCE_SHA, expectedBaseSha: BASE_SHA, exportDir, lockfilePath })).toThrow(/content mismatch/)
  })

  it('fails closed when the dependency lockfile changes', () => {
    const { exportDir, lockfilePath } = fixture()
    const manifest = createManifest({ sourceSha: SOURCE_SHA, baseSha: BASE_SHA, exportDir, lockfilePath })
    fs.writeFileSync(lockfilePath, '{"lockfileVersion":2}\n')

    expect(() => verifyManifest({ manifest, expectedSourceSha: SOURCE_SHA, expectedBaseSha: BASE_SHA, exportDir, lockfilePath })).toThrow(/lockfile hash mismatch/)
  })
})
