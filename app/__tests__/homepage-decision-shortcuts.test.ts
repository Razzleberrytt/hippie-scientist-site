import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENT = 'components/HomepageDecisionShortcuts.tsx'
const PAGE = 'app/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('homepage decision shortcuts', () => {
  it('surfaces four core canonical decision guides', () => {
    const source = read(COMPONENT)

    expect(source).toContain('/guides/sleep/best-supplements-for-sleep/')
    expect(source).toContain('/guides/anxiety/best-herbs-for-anxiety/')
    expect(source).toContain('/guides/best/supplements-for-stress/')
    expect(source).toContain('/guides/focus/best-nootropics-for-focus/')
    expect(source).toContain('/guides/best/')
  })

  it('renders the shortcuts from the homepage entry point', () => {
    const source = read(PAGE)

    expect(source).toContain("import HomepageDecisionShortcuts from '@/components/HomepageDecisionShortcuts'")
    expect(source).toContain('<HomepageDecisionShortcuts />')
  })
})
