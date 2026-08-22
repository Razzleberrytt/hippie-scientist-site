import fs from 'fs'
import path from 'path'

import { serializeJsonLd } from '../../src/lib/schema-injector'

const outDir = path.join(process.cwd(), 'out')
const JSON_LD_SCRIPT_RE = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi

function listHtmlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

let scannedPages = 0
let changedPages = 0
let normalizedScripts = 0
let invalidScripts = 0

for (const filePath of listHtmlFiles(outDir)) {
  scannedPages += 1
  const source = fs.readFileSync(filePath, 'utf8')
  let pageChanged = false

  const normalized = source.replace(
    JSON_LD_SCRIPT_RE,
    (fullMatch, openTag: string, payload: string, closeTag: string) => {
      const trimmed = payload.trim()
      if (!trimmed) return fullMatch

      try {
        const parsed = JSON.parse(trimmed)
        const serialized = serializeJsonLd(parsed)
        if (serialized !== trimmed) {
          normalizedScripts += 1
          pageChanged = true
        }
        return `${openTag}${serialized}${closeTag}`
      } catch {
        // A separate structured-data audit owns malformed JSON-LD. Leave invalid
        // payloads untouched so this normalizer never hides that failure mode.
        invalidScripts += 1
        return fullMatch
      }
    },
  )

  if (pageChanged) {
    fs.writeFileSync(filePath, normalized)
    changedPages += 1
  }
}

console.log(
  `[schema-identities] Scanned ${scannedPages} HTML pages; normalized ${normalizedScripts} JSON-LD script(s) across ${changedPages} page(s); left ${invalidScripts} invalid script(s) untouched.`,
)
