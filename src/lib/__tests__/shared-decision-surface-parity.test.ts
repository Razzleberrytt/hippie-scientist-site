import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { evidenceToneClasses, safetyToneClasses } from '../../../lib/decision-primitives'

const componentSource = fs.readFileSync(path.join(process.cwd(), 'components', 'ui', 'DecisionPrimitives.tsx'), 'utf8')
const primitiveSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'decision-primitives.ts'), 'utf8')

describe('shared decision surface parity', () => {
  it('uses canonical neutral surface primitives for cards and empty states', () => {
    expect(componentSource).toContain('card-premium')
    expect(componentSource).toContain('section-frame')
    expect(componentSource).toContain('var(--hs-hairline)')
    expect(componentSource).toContain('var(--surface-card)')
  })

  it('does not return shared decision UI to old brand/shadow recipes', () => {
    expect(componentSource).not.toContain('border-brand-900/10')
    expect(componentSource).not.toContain('bg-brand-50 text-brand-900')
    expect(componentSource).not.toContain('shadow-sm')
    expect(componentSource).not.toContain('hover:shadow-[0_6px_18px')
    expect(primitiveSource).not.toContain("border-brand-900/10 bg-[var(--surface-subtle)]")
    expect(primitiveSource).not.toContain('bg-[#fbfaf6]/85')
  })

  it('preserves semantic evidence color families', () => {
    expect(evidenceToneClasses('strong')).toContain('emerald')
    expect(evidenceToneClasses('moderate')).toContain('blue')
    expect(evidenceToneClasses('limited')).toContain('amber')
    expect(evidenceToneClasses('insufficient')).toContain('slate')
  })

  it('preserves semantic safety color families', () => {
    expect(safetyToneClasses('ok')).toContain('emerald')
    expect(safetyToneClasses('caution')).toContain('amber')
    expect(safetyToneClasses('interaction')).toContain('rose')
    expect(safetyToneClasses('review')).toContain('slate')
  })

  it('keeps shared interactive controls keyboard-visible', () => {
    expect(componentSource).toContain('focus-visible:ring-2')
  })
})
