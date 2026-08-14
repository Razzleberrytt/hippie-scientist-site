import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const EXPECTED = [
  { route: '/rss.xml', file: 'rss.xml' },
  { route: '/feed.xml', file: 'feed.xml' },
]

function resolveExportedRoute(file) {
  const candidates = [
    path.join(OUT, file),
    path.join(OUT, file, 'index.html'),
    path.join(OUT, `${file}.html`),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) || null
}

const failures = []
for (const expected of EXPECTED) {
  const filePath = resolveExportedRoute(expected.file)
  if (!filePath) {
    failures.push(
      `${expected.route}: missing exported route (checked ${expected.file}, ${expected.file}/index.html, and ${expected.file}.html)`,
    )
    continue
  }

  const xml = fs.readFileSync(filePath, 'utf8')
  if (!xml.includes('<rss') || !xml.includes('<channel>')) {
    failures.push(`${expected.route}: exported file is not an RSS channel`)
  }
  if (!xml.includes('https://thehippiescientist.net/articles/')) {
    failures.push(`${expected.route}: canonical /articles/ channel URL is missing`)
  }
  if (!xml.includes(`<atom:link href="https://thehippiescientist.net${expected.route}" rel="self"`)) {
    failures.push(`${expected.route}: canonical Atom self link is missing or mismatched`)
  }
  if (!/<item>[\s\S]*?<guid[^>]*>https:\/\/thehippiescientist\.net\/.+?<\/guid>[\s\S]*?<\/item>/.test(xml)) {
    failures.push(`${expected.route}: no canonical absolute item GUID was found`)
  }
}

if (failures.length) {
  console.error('[validate-feed-output] FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[validate-feed-output] PASS: rss.xml and feed.xml are present and canonical')
