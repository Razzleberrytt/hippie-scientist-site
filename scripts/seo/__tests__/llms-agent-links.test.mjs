import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const llmsPath = path.resolve(path.dirname(__filename), '../../../public/llms.txt')
const llms = readFileSync(llmsPath, 'utf8')

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
