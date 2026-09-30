import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Learn hub hero readability', () => {
  it('uses the shared compact hero treatment and one concise role statement', () => {
    const page = read('app/learn/page.tsx')

    expect(page).toContain("className='heading-premium mt-5 max-w-4xl'>Learn</h1>")
    expect(page).toContain('Use Learn when you want to understand how something works.')
    expect(page).toContain('Practical decisions belong in Guides')
    expect(page).not.toContain('Neuroscience and Neuropharmacology, Explained Clearly')
    expect(page).not.toContain("<div className='space-y-5 text-lg leading-9 text-muted max-w-4xl'>")
  })
})
