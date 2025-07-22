import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

async function run() {
  const [batchPath] = process.argv.slice(2)
  if (!batchPath) {
    console.error('Usage: mergeCompounds.ts <batch-file>')
    process.exit(1)
  }

  const baseModule = await import(pathToFileURL(path.resolve('src/data/compounds/compounds.ts')).href)
  const batchModule = await import(pathToFileURL(path.resolve(batchPath)).href)

  const base: any[] = baseModule.compounds || []
  const additions: any[] = batchModule.compounds || batchModule.default || []

  const map = new Map<string, any>()
  base.forEach(c => {
    if (c && c.name) map.set(c.name.toLowerCase(), c)
  })

  const newEntries: any[] = []
  for (const cmp of additions) {
    if (!cmp?.name || !cmp?.description || !cmp?.class || !cmp?.foundIn) continue
    const key = cmp.name.toLowerCase()
    if (!map.has(key)) {
      map.set(key, cmp)
      newEntries.push(cmp)
    }
  }

  const merged = Array.from(map.values())
  const outPath = path.resolve('src/data/compounds/compounds.merged.ts')
  const content =
`export const compounds = ${JSON.stringify(merged, null, 2)};
export default compounds;
`
  fs.writeFileSync(outPath, content)
  console.log(`Merged ${newEntries.length} new compounds. Total: ${merged.length}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
