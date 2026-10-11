import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, 'public/data/exports', file), 'utf8')
const sorted = (values: string[]) => [...values].sort()

describe('research citation exports', () => {
  it('publishes the same unique PMIDs in BibTeX, RIS, CSV, and JSON', () => {
    const json = JSON.parse(read('citations.json')) as {
      studyCount: number
      description: string
      studies: Array<{ pmid: string }>
    }
    const jsonIds = json.studies.map((study) => String(study.pmid))
    const csvIds = [...read('citations.csv').matchAll(/^(\\d+),/gm)].map((match) => match[1])
    const bibIds = [...read('citations.bib').matchAll(/\\bpmid\\s*=\\s*\\{(\\d+)\\}/g)].map((match) => match[1])
    const risIds = [...read('citations.ris').matchAll(/^AN  - (\\d+)$/gm)].map((match) => match[1])

    expect(new Set(jsonIds).size).toBe(jsonIds.length)
    expect(json.studyCount).toBe(jsonIds.length)
    expect(json.description).toContain(`${jsonIds.length} studies`)
    expect(sorted(csvIds)).toEqual(sorted(jsonIds))
    expect(sorted(bibIds)).toEqual(sorted(jsonIds))
    expect(sorted(risIds)).toEqual(sorted(jsonIds))
  })

  it('does not reattach an unrelated bariatric-surgery study to magnesium', () => {
    // Clapp et al. PMID 31654344 (DOI 10.1007/s11695-019-04215-6)
    // studies surgical drain usage, not a magnesium intervention.
    const wrongPmid = '31654344'
    const json = JSON.parse(read('citations.json')) as { studies: Array<{ pmid: string }> }
    expect(json.studies.some((study) => String(study.pmid) === wrongPmid)).toBe(false)

    for (const file of ['citations.csv', 'citations.bib', 'citations.ris']) {
      expect(read(file)).not.toContain(wrongPmid)
    }
    for (const file of ['public/data/compounds-detail/magnesium.json', 'public/data/claims.json']) {
      expect(fs.readFileSync(path.join(root, file), 'utf8')).not.toContain(wrongPmid)
    }
  })
})
