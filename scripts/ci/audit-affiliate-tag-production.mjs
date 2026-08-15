#!/usr/bin/env node
/**
 * Production-safety guard for Amazon affiliate attribution.
 *
 * Refuse to ship clickable Amazon.com links in built HTML that contain either:
 * - the old development placeholder tag, or
 * - no Associates `tag` parameter at all.
 *
 * Only actual <a href> destinations are audited. Next.js can serialize source
 * data into script payloads inside HTML; those non-clickable strings must not
 * be mistaken for outbound commerce links. HTML character references inside
 * href attributes are decoded before URL parsing so characters such as an
 * apostrophe (for example `&#x27;`) cannot be mistaken for a URL fragment and
 * hide a valid tag parameter from the audit. The configured production tag may
 * come from AMAZON_AFFILIATE_TAG or the repository default; this guard does
 * not hard-code one valid production tag.
 *
 * Usage: node scripts/ci/audit-affiliate-tag-production.mjs
 *        npm run audit:affiliate-tag-production
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_TAG = 'dev-affiliate-00';
const OUT_DIR = path.join(ROOT, 'out');

let problems = 0;

if (!fs.existsSync(OUT_DIR)) {
  console.error('[affiliate-tag] FAIL: out/ directory does not exist. Run npm run build first.');
  process.exit(1);
}

let htmlScanned = 0;
let amazonRefs = 0;
let badRefs = 0;
let untaggedRefs = 0;
const badUrls = new Set();
const untaggedUrls = new Set();
const anchorPattern = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi;
const htmlEntityPattern = /&(?:#(\d+)|#x([0-9a-f]+)|(amp|quot|apos|lt|gt));/gi;
const namedHtmlEntities = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
};

function recordSample(target, file, rawUrl) {
  if (target.size < 5) target.add(`${path.relative(ROOT, file)} :: ${rawUrl}`);
}

function decodeHtmlAttribute(value) {
  return value.replace(htmlEntityPattern, (entity, decimal, hexadecimal, named) => {
    if (decimal) {
      const codePoint = Number.parseInt(decimal, 10);
      return Number.isSafeInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }

    if (hexadecimal) {
      const codePoint = Number.parseInt(hexadecimal, 16);
      return Number.isSafeInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }

    return namedHtmlEntities[String(named).toLowerCase()] ?? entity;
  });
}

function inspectAmazonUrl(rawUrl, file) {
  const decodedUrl = decodeHtmlAttribute(rawUrl);

  try {
    const url = new URL(decodedUrl);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== 'amazon.com' && hostname !== 'www.amazon.com') return;

    amazonRefs++;
    const tag = url.searchParams.get('tag');

    if (!tag) {
      untaggedRefs++;
      recordSample(untaggedUrls, file, rawUrl);
      return;
    }

    if (tag === DEV_TAG) {
      badRefs++;
      recordSample(badUrls, file, rawUrl);
    }
  } catch {
    // URL syntax is validated elsewhere; avoid turning unrelated malformed
    // markup into an affiliate-attribution false positive here.
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlScanned++;
      const content = fs.readFileSync(full, 'utf8');
      anchorPattern.lastIndex = 0;
      let match;
      while ((match = anchorPattern.exec(content)) !== null) {
        const href = match[1] ?? match[2] ?? match[3] ?? '';
        inspectAmazonUrl(href, full);
      }
    }
  }
}

walk(OUT_DIR);
console.log(`[affiliate-tag] scanned ${htmlScanned} HTML files and ${amazonRefs} clickable Amazon.com links in out/`);

if (badRefs > 0) {
  console.error(`[affiliate-tag] FAIL: ${badRefs} clickable Amazon links still reference ${DEV_TAG}.`);
  console.error('  Sample files/URLs with dev tag:');
  for (const url of badUrls) console.error(`    ${url}`);
  problems++;
} else {
  console.log(`[affiliate-tag] no clickable ${DEV_TAG} references in built HTML OK`);
}

if (untaggedRefs > 0) {
  console.error(`[affiliate-tag] FAIL: ${untaggedRefs} clickable Amazon.com links have no Associates tag parameter.`);
  console.error('  Sample files/untagged URLs:');
  for (const url of untaggedUrls) console.error(`    ${url}`);
  problems++;
} else {
  console.log('[affiliate-tag] all clickable built Amazon.com links include a tag parameter OK');
}

if (problems > 0) {
  console.error(`\n[affiliate-tag] FAILED with ${problems} problem(s).`);
  process.exit(1);
}
console.log('\n[affiliate-tag] OK');
