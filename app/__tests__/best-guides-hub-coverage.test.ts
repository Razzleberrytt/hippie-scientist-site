import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/best/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('best supplement guides hub coverage', () => {
  it('surfaces the core sleep, anxiety, stress, and focus decision guides', () => {
    const source = read(PAGE)

    expect(source).toContain('/guides/sleep/best-supplements-for-sleep/')
    expect(source).toContain('/guides/anxiety/best-herbs-for-anxiety/')
    expect(source).toContain('/guides/best/supplements-for-stress/')
    expect(source).toContain('/guides/focus/best-nootropics-for-focus/')
  })

  it('keeps anxiety represented in hub metadata and schema copy', () => {
    const source = read(PAGE)

    expect(source.match(/sleep, anxiety, focus, ADHD, stress/g)?.length).toBeGreaterThanOrEqual(2)
    expect(source).toContain("title: 'Best Herbs for Anxiety'")
  })
})
