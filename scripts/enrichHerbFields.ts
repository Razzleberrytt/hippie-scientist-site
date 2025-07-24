import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import type { Herb } from '../src/types'

interface PartialHerb {
  name?: string
  slug?: string
  blurb?: string
  mechanismOfAction?: string
  pharmacokinetics?: string
  ld50?: string
  legalStatus?: string
  neurotransmitters?: string[]
  foundIn?: string
  tags?: string[]
  [key: string]: any
}

function toKebab(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const patchArg = args.find(a => a.endsWith('.json'))
  const patchPath = patchArg || 'herbPatchData.json'

  const herbModule = await import(pathToFileURL(path.resolve('src/data/herbs/herbsfull.ts')).href)
  const baseHerbs: Herb[] = herbModule.herbs || herbModule.default || []

  let patchData: PartialHerb[] = []
  if (fs.existsSync(patchPath)) {
    patchData = JSON.parse(fs.readFileSync(patchPath, 'utf8'))
  }

  const patchMap = new Map<string, PartialHerb>()
  for (const p of patchData) {
    if (p.slug) patchMap.set(p.slug.toLowerCase(), p)
    if (p.name) patchMap.set(p.name.toLowerCase(), p)
  }

  const required = [
    'name',
    'slug',
    'blurb',
    'mechanismOfAction',
    'pharmacokinetics',
    'ld50',
    'legalStatus',
    'neurotransmitters',
    'foundIn',
    'tags',
  ] as const

  const enriched: Herb[] = []
  const report: { name: string; slug?: string; missing: string[] }[] = []

  for (const herb of baseHerbs) {
    const h: any = { ...herb }
    const key = h.slug ? h.slug.toLowerCase() : h.name.toLowerCase()
    const patch = patchMap.get(key) || patchMap.get(h.name.toLowerCase())

    if (patch) {
      for (const field of required) {
        const val = h[field]
        const missing = val == null || (Array.isArray(val) ? val.length === 0 : val === '')
        if (missing && patch[field] != null) {
          h[field] = patch[field]
        }
      }
      if (Array.isArray(patch.tags)) {
        h.tags = (h.tags || []).concat(patch.tags)
      }
    }

    if (!Array.isArray(h.tags)) h.tags = []
    h.tags = Array.from(new Set(h.tags.map((t: string) => toKebab(t))))

    const missing = required.filter(f => {
      const val = h[f]
      return val == null || (Array.isArray(val) ? val.length === 0 : val === '')
    })

    if (missing.length) report.push({ name: h.name, slug: h.slug, missing })
    enriched.push(h)
  }

  if (dryRun) {
    console.log('Dry run - no files written')
    console.log('Would write', enriched.length, 'herbs')
    console.log('Missing fields:', report.length)
    return
  }

  const outPath = path.resolve('src/data/herbs/herbsfull.enriched.ts')
  const content = `import type { Herb } from '../../types'
export const herbs: Herb[] = ${JSON.stringify(enriched, null, 2)}
export default herbs
`
  fs.writeFileSync(outPath, content)
  fs.writeFileSync(
    path.resolve('src/data/herbs/missingFieldsReport.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('Wrote', outPath)
  console.log('Missing fields:', report.length)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
