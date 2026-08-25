import { readFileSync } from 'node:fs'
import { URL, fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const llms = readFileSync(fileURLToPath(new URL('../../../public/llms.txt', import.meta.url)), 'utf8')

describe('llms.txt agent browsing contract', () => {
  it('contains real Markdown links to canonical discovery targets', () => {
    const links = [...llms.matchAll(/\[[^\]]+\]\(https:\/\/thehippiescientist\.net\/[^)]*\)/g)]
    expect(links.length).toBeGreaterThanOrEqual(20)
    expect(llms).toContain('[Methodology](https://thehippiescientist.net/info/methodology/)')
    expect(llms).toContain('[Entity manifest](https://thehippiescientist.net/data/ai-entities/manifest.json)')
  })

  it('retains core llms.txt retrieval guidance', () => {
    for (const signal of [
      'Answer-engine retrieval policy',
      'Query-to-source routing',
      'Entity resolution rules',
      'Evidence and temporal semantics',
    ]) {
      expect(llms).toContain(signal)
    }
  })
})
