#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')

const checks = [
  {
    route: 'herbs/ashwagandha/index.html',
    optimizedBase: 'guides/ashwagandha-herb',
  },
  {
    route: 'compounds/l-theanine/index.html',
    optimizedBase: 'monographs/photos/l-theanine',
  },
]

const widths = [400, 800, 1200]

async function assertFile(filePath) {
  try {
    await access(filePath)
  } catch {
    throw new Error(`Missing generated image variant: ${path.relative(root, filePath)}`)
  }
}

for (const check of checks) {
  const htmlPath = path.join(outDir, check.route)
  const html = await readFile(htmlPath, 'utf8')

  if (!html.includes('type="image/webp"')) {
    throw new Error(`${check.route} is missing a WebP <source> for the monograph hero`)
  }

  for (const width of widths) {
    const publicUrl = `/images/optimized/${check.optimizedBase}-${width}w.webp`
    const outputPath = path.join(outDir, publicUrl.replace(/^\//, ''))
    await assertFile(outputPath)

    if (!html.includes(publicUrl)) {
      throw new Error(`${check.route} does not reference ${publicUrl}`)
    }
  }
}

console.log(`[responsive-monograph-images] PASS: ${checks.length} representative profile heroes reference complete 400/800/1200w WebP variants.`)
