import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('interaction guide data ownership', () => {
  it('keeps medication-class pages on the canonical publication-gated loader', () => {
    const page = read('app/guides/interactions/[slug]/[medicationClass]/page.tsx')

    expect(page).toContain('loadIndexableInteractionIngredients')
    expect(page).toContain('interactionValueToText')
    expect(page).not.toContain('getUnifiedRuntimeRecords')
    expect(page).not.toContain('async function getRecords')
  })
})
