#!/usr/bin/env node
/**
 * Production-safety guard: refuses to ship if the Amazon Associates tag is
 * the dev placeholder, which would silently lose every affiliate sale.
 *
 * In Cloudflare Pages, set the env var:
 *   AMAZON_AFFILIATE_TAG=razzleberry02-20
 *
 * This script:
 *  - reads process.env.AMAZON_AFFILIATE_TAG
 *  - exits non-zero if it's unset or equals the dev placeholder
 *  - exits non-zero if the built out/*.html still references the dev tag
 *
 * Use as a CI step (npm run audit:affiliate-tag-production).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_TAG = 'dev-affiliate-00';
const OUT_DIR = path.join(ROOT, 'out');

const envTag = process.env.AMAZON_AFFILIATE_TAG;
let problems = 0;

if (!envTag) {
  console.error('[affiliate-tag] FAIL: AMAZON_AFFILIATE_TAG env var is not set.');
  console.error('  In Cloudflare Pages: Settings -> Environment variables -> Production');
  console.error('  For local dev, add AMAZON_AFFILIATE_TAG=razzleberry02-20 to .env.local');
  problems++;
} else if (envTag === DEV_TAG) {
  console.error(`[affiliate-tag] FAIL: AMAZON_AFFILIATE_TAG is the dev placeholder ("${DEV_TAG}").`);
  console.error('  Real Amazon Associates tag required for affiliate sales.');
  problems++;
} else {
  console.log(`[affiliate-tag] env tag = ${envTag} OK`);
}

if (fs.existsSync(OUT_DIR)) {
  let htmlScanned = 0;
  let badRefs = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlScanned++;
        const content = fs.readFileSync(full, 'utf8');
        // count any amazon link missing the real tag (covers the dev placeholder)
        const amazonMatches = content.match(/https?:\/\/(?:www\.)?amazon\.com\/[^"'<>\s]*tag=([^"'<>\s&]+)/g) || [];
        for (const m of amazonMatches) {
          if (m.includes(`tag=${DEV_TAG}`)) badRefs++;
        }
      }
    }
  }
  walk(OUT_DIR);
  console.log(`[affiliate-tag] scanned ${htmlScanned} HTML files in out/`);
  if (badRefs > 0) {
    console.error(`[affiliate-tag] FAIL: ${badRefs} Amazon links in built HTML still reference ${DEV_TAG}.`);
    console.error('  The build did not pick up AMAZON_AFFILIATE_TAG. Check env injection order.');
    problems++;
  } else {
    console.log('[affiliate-tag] built HTML clean of dev-tag references OK');
  }
} else {
  console.log('[affiliate-tag] out/ directory missing; skipping HTML scan (pre-build).');
}

if (problems > 0) {
  console.error(`\n[affiliate-tag] FAILED with ${problems} problem(s).`);
  process.exit(1);
}
console.log('\n[affiliate-tag] OK');
