import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPONENT = path.join(process.cwd(), 'components/guides/DecisionRouter.tsx')

describe('DecisionRouter accessibility', () => {
  it('keeps an explicit visible keyboard-focus treatment on decision links', () => {
    const source = fs.readFileSync(COMPONENT, 'utf8')

    expect(source).toContain('focus-visible:outline-none')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-[color:var(--hs-gold)]')
    expect(source).toContain('focus-visible:ring-offset-2')
  })

  it('preserves the existing hover affordance alongside keyboard focus', () => {
    const source = fs.readFileSync(COMPONENT, 'utf8')

    expect(source).toContain('hover:-translate-y-0.5')
    expect(source).toContain('hover:border-brand-700/30')
  })
})
