#!/usr/bin/env node

/**
 * Prove that the build-time responsive image pipeline is connected end-to-end.
 *
 * The optimizer and loader can each be correct in isolation while production
 * still ships full-size originals (or 404s) if orchestration or render wiring
 * drifts. This post-export contract checks representative herb + compound
 * profile heroes in the actual static output and verifies every referenced
 * generated WebP physically exists.
 */

import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const WIDTHS = [400, 800, 1200]

const REPRESENTATIVE_ROUTES = [
  {
    label: 'Ashwagandha herb profile',
    source: '/images/guides/ashwagandha-herb.jpg',
    htmlCandidates: ['out/herbs/ashwagandha/index.html', 'out/herbs/ashwagandha.html'],
  },
  {
    label: 'L-theanine compound profile',
    source: '/images/monographs/photos/l-theanine.jpg',
    htmlCandidates: ['out/compounds/l-theanine/index.html', 'out/compounds/l-theanine.html'],
  },
]

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath))
    return true
  } catch {
    return false
  }
}

function optimizedVariant(source, width) {
  const withoutExtension = source.replace(/\.[^./]+$/, '')
  return `/images/optimized${withoutExtension.slice('/images'.length)}-${width}w.webp`
}

async function resolveHtml(candidates) {
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate
  }
  throw new Error(`missing exported HTML; checked: ${candidates.join(', ')}`)
}

async function validateRoute(route) {
  const htmlPath = await resolveHtml(route.htmlCandidates)
  const html = await readFile(path.join(root, htmlPath), 'utf8')
  const failures = []

  // React/Next server markup may preserve JSX's `srcSet` casing in the raw
  // exported source even though HTML attribute names are case-insensitive in
  // the browser. Validate the HTML contract case-insensitively rather than
  // rejecting a semantically identical serialization.
  if (!/\bsrcset=/i.test(html)) failures.push('exported hero HTML has no srcset attribute')
  if (!/\bsizes=/i.test(html)) failures.push('exported hero HTML has no sizes attribute')

  for (const width of WIDTHS) {
    const variant = optimizedVariant(route.source, width)
    const publicFile = `public${variant}`
    const exportedFile = `out${variant}`

    if (!(await exists(publicFile))) failures.push(`missing generated source variant ${publicFile}`)
    if (!(await exists(exportedFile))) failures.push(`missing exported variant ${exportedFile}`)
    if (!html.includes(variant)) failures.push(`exported HTML does not reference ${variant}`)
  }

  if (failures.length) {
    throw new Error(`${route.label}:\n  - ${failures.join('\n  - ')}`)
  }

  console.log(`[responsive-images] PASS ${route.label} (${htmlPath})`)
}

async function main() {
  const errors = []

  for (const route of REPRESENTATIVE_ROUTES) {
    try {
      await validateRoute(route)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (errors.length) {
    console.error('[responsive-images] FAILED: responsive image production contract is broken.')
    for (const error of errors) console.error(`\n${error}`)
    process.exit(1)
  }

  console.log(`[responsive-images] PASS: ${REPRESENTATIVE_ROUTES.length} representative routes reference all ${WIDTHS.length} generated WebP widths.`)
}

main().catch((error) => {
  console.error('[responsive-images] Fatal error:', error)
  process.exit(1)
})