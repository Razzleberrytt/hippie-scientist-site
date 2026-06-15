#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const siteFile = path.join(ROOT, 'src/lib/site.ts')
const content = fs.readFileSync(siteFile, 'utf8')

if (!content.includes("https://thehippiescientist.net")) {
  console.error('[validate-canonical-host] FAIL: src/lib/site.ts must default SITE_URL to https://thehippiescientist.net')
  process.exit(1)
}

console.log('[validate-canonical-host] PASS: Central SITE_URL defaults to https://thehippiescientist.net.')
