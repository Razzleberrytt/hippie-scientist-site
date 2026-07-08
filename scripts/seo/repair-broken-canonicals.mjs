import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')

const CANONICAL_REPLACEMENTS = new Map([
  ['https://thehippiescientist.net/herbs/piper-methysticum/', 'https://thehippiescientist.net/herbs/kava/'],
  ['https://thehippiescientist.net/herbs/passiflora-incarnata/', 'https://thehippiescientist.net/herbs/passionflower/'],
  ['https://thehippiescientist.net/herbs/hericium-erinaceus/', 'https://thehippiescientist.net/herbs/lions-mane/'],
  ['https://thehippiescientist.net/herbs/allium-sativum/', 'https://thehippiescientist.net/herbs/garlic/'],
  ['https://thehippiescientist.net/herbs/valeriana-officinalis/', 'https://thehippiescientist.net/herbs/valerian/'],
  ['https://thehippiescientist.net/herbs/ganoderma-lucidum/', 'https://thehippiescientist.net/herbs/reishi/'],
  ['https://thehippiescientist.net/herbs/berberis-vulgaris/', 'https://thehippiescientist.net/herbs/berberis/'],
  ['https://thehippiescientist.net/herbs/berberis-aristata/', 'https://thehippiescientist.net/herbs/berberis/'],
  ['https://thehippiescientist.net/herbs/coptis-chinensis/', 'https://thehippiescientist.net/herbs/coptis/'],
  ['https://thehippiescientist.net/herbs/boswellia-carterii/', 'https://thehippiescientist.net/herbs/boswellia-serrata/'],
  ['https://thehippiescientist.net/herbs/morus-alba/', 'https://thehippiescientist.net/herbs/mulberry-leaf/'],
  ['https://thehippiescientist.net/herbs/astragalus-membranaceus/', 'https://thehippiescientist.net/herbs/astragalus/'],
  ['https://thehippiescientist.net/herbs/atractylodes-macrocephala/', 'https://thehippiescientist.net/herbs/atractylodes/'],
  ['https://thehippiescientist.net/herbs/angelica-sinensis/', 'https://thehippiescientist.net/herbs/dong-quai/'],
  ['https://thehippiescientist.net/herbs/angelica-root/', 'https://thehippiescientist.net/herbs/angelica-archangelica/'],
])

function* walkHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield fullPath
    }
  }
}

if (!fs.existsSync(outDir)) {
  console.warn('[repair-broken-canonicals] out directory not found; skipping.')
  process.exit(0)
}

let touchedFiles = 0
let replacements = 0

for (const filePath of walkHtmlFiles(outDir)) {
  let html = fs.readFileSync(filePath, 'utf8')
  let next = html

  for (const [from, to] of CANONICAL_REPLACEMENTS) {
    if (!next.includes(from)) continue
    const before = next
    next = next.split(from).join(to)
    replacements += before.split(from).length - 1
  }

  if (next !== html) {
    fs.writeFileSync(filePath, next)
    touchedFiles += 1
  }
}

console.log(`[repair-broken-canonicals] Rewrote ${replacements} canonical alias references in ${touchedFiles} HTML files.`)
