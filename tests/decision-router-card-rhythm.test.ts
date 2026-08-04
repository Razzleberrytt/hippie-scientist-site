import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('DecisionRouter card rhythm', () => {
  it('uses the shared discovery-card shell and aligned CTA spacing', () => {
    const component = read('components/guides/DecisionRouter.tsx')

    expect(component).toContain('flex h-full flex-col rounded-2xl border border-brand-900/10')
    expect(component).toContain('mt-auto inline-flex items-center gap-1 pt-4')
    expect(component).not.toContain('rounded-xl border-2')
  })
})
