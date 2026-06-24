#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const cssDir = path.join(root, '.next', 'static', 'css')

if (!fs.existsSync(cssDir)) {
  console.error('[verify-css-assets] Missing .next/static/css. Run `next build` before verification.')
  process.exit(1)
}

const cssFiles = fs
  .readdirSync(cssDir)
  .filter(file => file.endsWith('.css'))

if (cssFiles.length === 0) {
  console.error('[verify-css-assets] No CSS assets were emitted by Next build.')
  process.exit(1)
}

console.log(`[verify-css-assets] OK found ${cssFiles.length} CSS assets: ${cssFiles.join(', ')}`)
