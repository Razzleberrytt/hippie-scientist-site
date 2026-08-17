import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const infoDir = path.join(ROOT, 'app', 'info')
const hubSource = fs.readFileSync(path.join(infoDir, 'page.tsx'), 'utf8')

function immediateInfoPageDirectories() {
  return fs.readdirSync(infoDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(infoDir, name, 'page.tsx')))
    .sort()
}

describe('/info authority parent coverage', () => {
  it('keeps every immediate public info child discoverable from the parent hub', () => {
    const missing = immediateInfoPageDirectories()
      .filter((name) => !hubSource.includes(`/info/${name}/`))

    expect(missing).toEqual([])
  })

  it('does not link to non-existent immediate info child routes', () => {
    const existing = new Set(immediateInfoPageDirectories())
    const linked = [...hubSource.matchAll(/href:\s*['"]\/info\/([^/'"]+)\/?['"]/g)]
      .map((match) => match[1])
      .filter(Boolean)

    const missingTargets = [...new Set(linked)].filter((name) => !existing.has(name))
    expect(missingTargets).toEqual([])
  })
})
