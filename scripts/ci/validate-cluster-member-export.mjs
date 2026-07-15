#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const profiles = [
  { kind: 'herbs', slug: 'green-tea-extract' },
  { kind: 'herbs', slug: 'turmeric' },
  { kind: 'compounds', slug: 'green-tea-egcg-isolated' },
  { kind: 'compounds', slug: 'green-tea-extract-egcg' },
]

const outDir = path.join(process.cwd(), 'out')
const errors = []

for (const { kind, slug } of profiles) {
  const file = path.join(outDir, kind, slug, 'index.html')
  if (!fs.existsSync(file)) {
    errors.push(`${kind}/${slug}: missing exported index.html`)
    continue
  }

  const html = fs.readFileSync(file, 'utf8')
  const expectedCanonical = `https://thehippiescientist.net/${kind}/${slug}/`
  // Next serializes the not-found boundary into every static page's RSC payload,
  // so the generic "Page not found" copy is not evidence that the boundary won.
  if (/Compound Not Found|Herb Not Found|id="__next_error__"/i.test(html)) errors.push(`${kind}/${slug}: exported not-found content`)
  if (/name="robots" content="noindex/i.test(html)) errors.push(`${kind}/${slug}: exported noindex metadata`)
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) errors.push(`${kind}/${slug}: missing self-canonical`)
  if (!html.includes('Safety evidence:')) errors.push(`${kind}/${slug}: missing evidence-labelled safety`)
  if (/Generally well tolerated for most users/i.test(html)) errors.push(`${kind}/${slug}: generic safety placeholder leaked`)
  if (/Use caution caution|Review before use if any apply:[^<]{0,500}\.\./i.test(html)) {
    errors.push(`${kind}/${slug}: duplicated safety wording or punctuation`)
  }
  if (html.includes('data-content-depth-support="true"')) {
    errors.push(`${kind}/${slug}: generic post-build HTML injection would diverge from the React runtime tree`)
  }
  if (!html.includes('Safety &amp; Cautions') && !html.includes('Safety &amp;amp; Cautions')) {
    errors.push(`${kind}/${slug}: missing visible safety heading`)
  }
}

if (errors.length) {
  console.error(`[validate-cluster-member-export] FAIL (${errors.length})`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`[validate-cluster-member-export] PASS: ${profiles.length}/4 profiles are indexable, self-canonical, and evidence-labelled.`)
