import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('Learn hub hero readability', () => {
  it('uses responsive heading scale and one concise introduction', () => {
    const page = read('app/learn/page.tsx')

    expect(page).toContain("text-4xl")
    expect(page).toContain("sm:text-5xl")
    expect(page).toContain("lg:text-6xl")
    expect(page).toContain('Neuroscience and Neuropharmacology, Explained Clearly')
    expect(page).toContain('without reducing complex biology to simplistic claims')
    expect(page).not.toContain("<div className='space-y-5 text-lg leading-9 text-muted max-w-4xl'>")
  })
})
