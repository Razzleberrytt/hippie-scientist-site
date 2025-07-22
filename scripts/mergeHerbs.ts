import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

async function run() {
  const [batchPath] = process.argv.slice(2)
  if (!batchPath) {
    console.error('Usage: mergeHerbs.ts <batch-file>')
    process.exit(1)
  }

  const baseModule = await import(pathToFileURL(path.resolve('src/data/herbs/herbsfull.ts')).href)
  const batchModule = await import(pathToFileURL(path.resolve(batchPath)).href)

  const base: any[] = baseModule.herbs || []
  const additions: any[] = batchModule.herbs || batchModule.default || []

  const map = new Map<string, any>()
  base.forEach(h => {
    if (h && h.name) map.set(h.name.toLowerCase(), h)
  })

  const newEntries: any[] = []
  for (const herb of additions) {
    if (!herb?.name || !herb?.effects || !herb?.description) continue
    const key = herb.name.toLowerCase()
    if (!map.has(key)) {
      map.set(key, herb)
      newEntries.push(herb)
    }
  }

  const merged = Array.from(map.values())
  const outPath = path.resolve('src/data/herbs/herbsfull.merged.ts')
  const content =
`import type { Herb } from '../../types';
export const herbs: Herb[] = ${JSON.stringify(merged, null, 2)};
export default herbs;
`
  fs.writeFileSync(outPath, content)
  console.log(`Merged ${newEntries.length} new herbs. Total: ${merged.length}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
