import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const files = []

const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name)
    if (e.isDirectory()) walk(f)
    else if (e.isFile() && e.name.endsWith('.html')) files.push(f)
  }
}

console.log('Walking directory...')
walk(outDir)
console.log(`Found ${files.length} HTML files.`)

const routes = new Set(files.map(f => '/' + path.relative(outDir, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'))
const graph = new Map([...routes].map(r => [r, new Set()]))
const hrefRe = /href=["']([^"'#]+)["']/g

console.log('Parsing links from HTML files...')
let count = 0
for (const f of files) {
  count++
  console.log(`[${count}/${files.length}] Scanning ${f}...`)
  const route = '/' + path.relative(outDir, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\\/g, '/').replace(/\/$/, '') || '/'
  const html = fs.readFileSync(f, 'utf8')
  for (const m of html.matchAll(hrefRe)) {
    const h = m[1]
    if (!h.startsWith('/')) continue
    const t = h.split('?')[0].replace(/\/$/, '') || '/'
    if (graph.has(t)) graph.get(route).add(t)
  }
}

console.log('Link parsing complete!')
const orphan = [...graph.entries()].filter(([, o]) => o.size === 0).map(([r]) => r)
console.log(`Found ${orphan.length} orphans.`)
