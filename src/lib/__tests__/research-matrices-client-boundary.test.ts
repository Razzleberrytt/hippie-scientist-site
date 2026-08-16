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
    expect(client).not.toContain('research-quality-snapshot')
    expect(client).not.toContain('node:fs')
    expect(client).toContain('Underlying human studies')
  })

  it('keeps filesystem-backed research topology on the server contract', () => {
    const shared = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/research-matrices.shared.ts'),
      'utf8',
    )
    const server = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/research-matrices.ts'),
      'utf8',
    )

    expect(shared).not.toContain('runtime-record-index')
    expect(shared).not.toContain('research-quality-snapshot')
    expect(shared).not.toContain('node:fs')
    expect(shared).not.toContain('node:path')
    expect(server).toContain("import 'server-only'")
    expect(server).toContain("from '@/lib/runtime-record-index'")
    expect(server).toContain("from '../../lib/research-quality-snapshot'")
    expect(server).toContain('profile.primaryHumanUnderlyingStudyCount')
    expect(server).toContain('profile.primaryHumanPublicationCount')
    expect(server).toContain('profile.collapsedPrimaryHumanPublicationCount')
    expect(server).toContain("from './research-matrices.shared'")
  })
})
