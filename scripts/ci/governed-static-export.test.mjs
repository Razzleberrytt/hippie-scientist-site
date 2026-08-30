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

  const verificationStateDir = path.join(root, 'public', 'data')
  fs.mkdirSync(path.join(verificationStateDir, 'nested'), { recursive: true })
  fs.writeFileSync(path.join(verificationStateDir, 'herbs.json'), '{"generated":"producer"}\n')
  fs.writeFileSync(path.join(verificationStateDir, 'nested', 'routes.json'), '{"routes":["/"]}\n')
  // These real-world filename shapes deliberately sort differently under
  // localeCompare versus JavaScript's canonical code-unit ordering.
  fs.writeFileSync(path.join(verificationStateDir, 'entity-slug-aliases.json'), '{}\n')
  fs.writeFileSync(path.join(verificationStateDir, 'entity_risk_tags.json'), '{}\n')

  const lockfilePath = path.join(root, 'package-lock.json')
  fs.writeFileSync(lockfilePath, '{"lockfileVersion":3}\n')
  return { root, exportDir, verificationStateDir, lockfilePath }
}

function createFixtureManifest({ exportDir, verificationStateDir, lockfilePath, runId = null }) {
  return createManifest({
    sourceSha: SOURCE_SHA,
    baseSha: BASE_SHA,
    exportDir,
    verificationStateDir,
    lockfilePath,
    runId,
  })
}

function verifyFixtureManifest({ manifest, exportDir, verificationStateDir, lockfilePath, expectedSourceSha = SOURCE_SHA, restoreVerificationState = false }) {
  return verifyManifest({
    manifest,
    expectedSourceSha,
    expectedBaseSha: BASE_SHA,
    exportDir,
    verificationStateDir,
    lockfilePath,
    restoreVerificationState,
  })
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

describe('governed static export receipt', () => {
  it('replays successfully for the exact source/base/output/lockfile/generated-state identity', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest({ ...fixtureState, runId: '123' })

    expect(verifyFixtureManifest({ manifest, ...fixtureState })).toMatchObject({
      fileCount: 3,
      htmlFileCount: 2,
      verificationStateFileCount: 4,
      verificationStateHash: manifest.verificationState.stateHash,
    })
  })

  it('restores the producer verification snapshot before downstream output audits', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest(fixtureState)
    fs.writeFileSync(path.join(fixtureState.verificationStateDir, 'herbs.json'), '{"generated":"stale-checkout"}\n')
    fs.writeFileSync(path.join(fixtureState.verificationStateDir, 'checkout-only.json'), '{}\n')

    verifyFixtureManifest({ manifest, ...fixtureState, restoreVerificationState: true })

    expect(fs.readFileSync(path.join(fixtureState.verificationStateDir, 'herbs.json'), 'utf8')).toBe('{"generated":"producer"}\n')
    expect(fs.existsSync(path.join(fixtureState.verificationStateDir, 'checkout-only.json'))).toBe(false)
    expect(fs.readFileSync(path.join(fixtureState.verificationStateDir, 'nested', 'routes.json'), 'utf8')).toBe('{"routes":["/"]}\n')
  })

  it('fails closed when a consumer asks for a different source head', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest(fixtureState)

    expect(() => verifyFixtureManifest({
      manifest,
      ...fixtureState,
      expectedSourceSha: '3333333333333333333333333333333333333333',
    })).toThrow(/source SHA mismatch/)
  })

  it('fails closed when output changes after the receipt is created', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest(fixtureState)
    fs.writeFileSync(path.join(fixtureState.exportDir, 'index.html'), '<html>tampered</html>')

    expect(() => verifyFixtureManifest({ manifest, ...fixtureState })).toThrow(/content mismatch/)
  })

  it('fails closed when the generated verification-state payload is tampered', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest(fixtureState)
    manifest.verificationState.payload = `${manifest.verificationState.payload.slice(0, -4)}AAAA`

    expect(() => verifyFixtureManifest({ manifest, ...fixtureState })).toThrow(/verification state/)
  })

  it('fails closed when the dependency lockfile changes', () => {
    const fixtureState = fixture()
    const manifest = createFixtureManifest(fixtureState)
    fs.writeFileSync(fixtureState.lockfilePath, '{"lockfileVersion":2}\n')

    expect(() => verifyFixtureManifest({ manifest, ...fixtureState })).toThrow(/lockfile hash mismatch/)
  })
})
