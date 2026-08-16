import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('research matrix client boundary', () => {
  it('keeps the client component on the browser-safe shared contract', () => {
    const client = fs.readFileSync(
      path.join(process.cwd(), 'src/components/matrices/ResearchMatricesClient.tsx'),
      'utf8',
    )

    expect(client).toContain("from '@/lib/research-matrices.shared'")
    expect(client).not.toContain("from '@/lib/research-matrices'")
  })

  it('keeps filesystem-backed runtime loading out of the shared contract', () => {
    const shared = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/research-matrices.shared.ts'),
      'utf8',
    )
    const server = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/research-matrices.ts'),
      'utf8',
    )

    expect(shared).not.toContain('runtime-record-index')
    expect(shared).not.toContain('node:fs')
    expect(shared).not.toContain('node:path')
    expect(server).toContain("from '@/lib/runtime-record-index'")
    expect(server).toContain("from './research-matrices.shared'")
  })
})
