#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const siteFile = path.join(ROOT, 'src/lib/site.ts')
const content = fs.readFileSync(siteFile, 'utf8')
const EXPECTED = 'https://thehippiescientist.net'

const siteUrlMatch = content.match(/export\s+const\s+SITE_URL\s*=\s*['"]([^'"]+)['"]/)
if (!siteUrlMatch) {
  console.error('[validate-canonical-host] FAIL: SITE_URL must be an explicit immutable string constant.')
  process.exit(1)
}

if (siteUrlMatch[1] !== EXPECTED) {
  console.error(`[validate-canonical-host] FAIL: SITE_URL must equal ${EXPECTED}, got ${siteUrlMatch[1]}.`)
  process.exit(1)
}

if (/NEXT_PUBLIC_SITE_URL|process\.env/.test(content)) {
  console.error('[validate-canonical-host] FAIL: canonical origin must not drift through environment configuration.')
  process.exit(1)
}

if (/https?:\/\/www\.thehippiescientist\.net/i.test(content)) {
  console.error('[validate-canonical-host] FAIL: www must not be emitted as the canonical origin.')
  process.exit(1)
}

console.log(`[validate-canonical-host] PASS: immutable canonical origin is ${EXPECTED}.`)
