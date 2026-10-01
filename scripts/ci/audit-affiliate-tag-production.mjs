#!/usr/bin/env node
/**
 * Production-safety guard for Amazon affiliate destinations.
 *
 * Refuse to ship clickable Amazon links in built HTML when the destination:
 * - is Amazon-looking but malformed/unparseable;
 * - uses a non-HTTPS scheme;
 * - omits the Associates `tag` parameter;
 * - repeats the `tag` parameter;
 * - uses the historical development placeholder tag; or
 * - uses a tag that differs from the configured production tag.
 *
 * Only actual <a href> destinations are audited. Next.js can serialize source
 * data into script payloads inside HTML; those non-clickable strings must not
 * be mistaken for outbound commerce links. HTML character references inside
 * href attributes are decoded before URL parsing.
 *
 * The expected production tag is AMAZON_AFFILIATE_TAG when that environment
 * variable is non-blank. Otherwise this audit reads the fallback directly from
 * config/affiliate.ts so there is no second hard-coded production-tag authority.
 *
 * This is an offline structural integrity check. It does not click Amazon links,
 * prove product availability, validate pricing, or make a revenue claim.
 *
 * Usage: node scripts/ci/audit-affiliate-tag-production.mjs
 *        npm run audit:affiliate-tag-production
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_TAG = 'dev-affiliate-00';
const OUT_DIR = path.join(ROOT, 'out');
const AFFILIATE_CONFIG = path.join(ROOT, 'config', 'affiliate.ts');

let problems = 0;

if (!fs.existsSync(OUT_DIR)) {
  console.error('[affiliate-tag] FAIL: out/ directory does not exist. Run npm run build first.');
  process.exit(1);
}

function configuredProductionTag() {
  const override = process.env.AMAZON_AFFILIATE_TAG?.trim();
  if (override) return override;

  let source;
  try {
    source = fs.readFileSync(AFFILIATE_CONFIG, 'utf8');
  } catch (error) {
    console.error(`[affiliate-tag] FAIL: cannot read production affiliate config at ${path.relative(ROOT, AFFILIATE_CONFIG)}: ${error.message}`);
    process.exit(1);
  }

  const match = source.match(/process\.env\.AMAZON_AFFILIATE_TAG\?\.trim\(\)\s*\|\|\s*['"]([^'"]+)['"]/);
  const fallback = match?.[1]?.trim();
  if (!fallback) {
    console.error('[affiliate-tag] FAIL: could not resolve the repository fallback Amazon Associates tag from config/affiliate.ts.');
    process.exit(1);
  }
  return fallback;
}

const expectedTag = configuredProductionTag();
let htmlScanned = 0;
let amazonRefs = 0;
let malformedRefs = 0;
let insecureRefs = 0;
let devTagRefs = 0;
let untaggedRefs = 0;
let duplicateTagRefs = 0;
let wrongTagRefs = 0;

const malformedUrls = new Set();
const insecureUrls = new Set();
const devTagUrls = new Set();
const untaggedUrls = new Set();
const duplicateTagUrls = new Set();
const wrongTagUrls = new Set();

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

function looksAmazonish(value) {
  // This helper is called only after URL parsing has already failed. Do not
  // require valid URL delimiters here: the invalid character immediately
  // following amazon.com may be the reason parsing failed in the first place.
  return /(?:^|[./:@-])(?:www\.)?amazon\.com/i.test(value);
}

function isAmazonHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'amazon.com' || host.endsWith('.amazon.com');
}

function inspectAmazonUrl(rawUrl, file) {
  const decodedUrl = decodeHtmlAttribute(rawUrl);

  let url;
  try {
    url = new URL(decodedUrl);
  } catch {
    if (looksAmazonish(decodedUrl)) {
      malformedRefs++;
      recordSample(malformedUrls, file, rawUrl);
    }
    return;
  }

  if (!isAmazonHost(url.hostname)) return;

  amazonRefs++;

  if (url.protocol !== 'https:') {
    insecureRefs++;
    recordSample(insecureUrls, file, rawUrl);
  }

  const tags = url.searchParams.getAll('tag');
  if (tags.length === 0) {
    untaggedRefs++;
    recordSample(untaggedUrls, file, rawUrl);
    return;
  }

  if (tags.length !== 1) {
    duplicateTagRefs++;
    recordSample(duplicateTagUrls, file, rawUrl);
    return;
  }

  const tag = tags[0].trim();
  if (tag === DEV_TAG) {
    devTagRefs++;
    recordSample(devTagUrls, file, rawUrl);
    return;
  }

  if (tag !== expectedTag) {
    wrongTagRefs++;
    recordSample(wrongTagUrls, file, rawUrl);
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

function reportFailure(count, message, samplesLabel, samples) {
  if (count === 0) return;
  console.error(`[affiliate-tag] FAIL: ${count} ${message}`);
  console.error(`  ${samplesLabel}:`);
  for (const sample of samples) console.error(`    ${sample}`);
  problems++;
}

walk(OUT_DIR);
console.log(`[affiliate-tag] scanned ${htmlScanned} HTML files and ${amazonRefs} parseable clickable Amazon links in out/`);
console.log(`[affiliate-tag] expected production tag source: ${process.env.AMAZON_AFFILIATE_TAG?.trim() ? 'AMAZON_AFFILIATE_TAG' : 'config/affiliate.ts fallback'}`);

reportFailure(
  malformedRefs,
  'clickable Amazon-looking href(s) are malformed or unparseable.',
  'Sample malformed Amazon-looking hrefs',
  malformedUrls,
);
reportFailure(
  insecureRefs,
  'clickable Amazon destination(s) do not use HTTPS.',
  'Sample insecure Amazon URLs',
  insecureUrls,
);
reportFailure(
  devTagRefs,
  `clickable Amazon link(s) still reference ${DEV_TAG}.`,
  'Sample files/URLs with dev tag',
  devTagUrls,
);
reportFailure(
  untaggedRefs,
  'clickable Amazon link(s) have no Associates tag parameter.',
  'Sample files/untagged URLs',
  untaggedUrls,
);
reportFailure(
  duplicateTagRefs,
  'clickable Amazon link(s) contain more than one Associates tag parameter.',
  'Sample files/URLs with duplicate tag parameters',
  duplicateTagUrls,
);
reportFailure(
  wrongTagRefs,
  'clickable Amazon link(s) do not match the configured production Associates tag.',
  'Sample files/URLs with wrong production tag',
  wrongTagUrls,
);

if (malformedRefs === 0) console.log('[affiliate-tag] no malformed clickable Amazon-looking hrefs OK');
if (insecureRefs === 0) console.log('[affiliate-tag] all parseable clickable Amazon destinations use HTTPS OK');
if (devTagRefs === 0) console.log(`[affiliate-tag] no clickable ${DEV_TAG} references in built HTML OK`);
if (untaggedRefs === 0) console.log('[affiliate-tag] all parseable clickable Amazon links include a tag parameter OK');
if (duplicateTagRefs === 0) console.log('[affiliate-tag] every parseable clickable Amazon link has exactly one tag parameter OK');
if (wrongTagRefs === 0) console.log('[affiliate-tag] every parseable clickable Amazon link uses the configured production tag OK');

if (problems > 0) {
  console.error(`\n[affiliate-tag] FAILED with ${problems} problem class(es).`);
  process.exit(1);
}
console.log('\n[affiliate-tag] OK');
