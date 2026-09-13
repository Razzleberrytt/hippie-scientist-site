import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const layout = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'sleep', 'glycine-for-sleep', 'layout.tsx'),
  'utf8',
)

describe('Glycine sleep next-actions integration', () => {
  it('mounts the canonical post-answer sleep research actions without changing page copy', () => {
    expect(layout).toContain("import SleepResearchNextActions from '@/components/SleepResearchNextActions'")
    expect(layout).toContain('<SleepResearchNextActions />')
    expect(layout).toContain('{children}')
    expect(layout.indexOf('{children}')).toBeLessThan(layout.indexOf('<SleepResearchNextActions />'))
  })

  it('keeps the integration non-sticky and mobile-safe', () => {
    expect(layout).not.toMatch(/\b(?:fixed|sticky)\b/)
    expect(layout).toContain('mx-auto max-w-5xl')
  })
})
