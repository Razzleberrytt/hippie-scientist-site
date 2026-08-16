import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('compound pagination static-export contract', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/compounds/page/[page]/page.tsx'),
    'utf8',
  )

  it('provides a sentinel static param when no real page 2 exists', () => {
    expect(source).toContain("return realParams.length ? realParams : [{ page: '2' }]")
  })

  it('does not render out-of-range dynamic pages as duplicate library content', () => {
    expect(source).toContain("import { notFound } from 'next/navigation'")
    expect(source).toContain('if (n < 2 || n > totalPages) notFound()')
  })
})
