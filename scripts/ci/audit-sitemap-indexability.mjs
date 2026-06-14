#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');
const SITEMAP_PATH = path.join(OUT_DIR, 'sitemap.xml');
const REPORT_DIR = path.join(ROOT, 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'sitemap-indexability-audit.json');

function normalizeUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    let pathname = url.pathname.replace(/\/+$/, '');
    if (!pathname) pathname = '/';
    // Normalize domain/host to lowercase, remove www prefix if any
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return `${url.protocol}//${host}${pathname}`;
  } catch {
    return urlStr.replace(/\/+$/, '');
  }
}

function parseXmlUrls(xmlContent) {
  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

function getCanonicalUrl(html) {
  const match = html.match(/<link\s+[^>]*?rel=["']canonical["'][^>]*?href=["']([^"']+)["']/i) ||
                html.match(/<link\s+[^>]*?href=["']([^"']+)["'][^>]*?rel=["']canonical["']/i);
  return match ? match[1].trim() : null;
}

function getRobotsMeta(html) {
  const matches = [];
  const regex = /<meta\s+[^>]*?name=["'](robots|googlebot)["'][^>]*?content=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[2].toLowerCase());
  }
  const regex2 = /<meta\s+[^>]*?content=["']([^"']+)["'][^>]*?name=["'](robots|googlebot)["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    matches.push(match[1].toLowerCase());
  }
  return matches;
}

function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`Error: Sitemap not found at ${SITEMAP_PATH}. Please run npm run build first.`);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urls = parseXmlUrls(xmlContent);

  console.log(`Auditing ${urls.length} URLs from sitemap...`);

  const results = [];
  const seenNormalized = new Map();
  let liveIndexableCount = 0;
  let errorCount = 0;

  for (const rawUrl of urls) {
    const normUrl = normalizeUrl(rawUrl);
    const issues = [];

    // Check duplicate
    if (seenNormalized.has(normUrl)) {
      issues.push('DUPLICATE_URL');
      seenNormalized.get(normUrl).issues.push('DUPLICATE_URL');
    } else {
      seenNormalized.set(normUrl, { rawUrl, issues });
    }

    // Determine path on disk
    let pathname;
    try {
      pathname = new URL(rawUrl).pathname;
    } catch {
      pathname = rawUrl;
    }

    let filePath;
    if (pathname === '/') {
      filePath = path.join(OUT_DIR, 'index.html');
    } else {
      const cleanPath = pathname.replace(/^\/|\/$/g, '');
      filePath = path.join(OUT_DIR, cleanPath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      issues.push('404_IN_SITEMAP');
      results.push({
        url: rawUrl,
        filePath,
        status: '404_IN_SITEMAP',
        issues: ['404_IN_SITEMAP'],
        canonical: null,
        robots: []
      });
      errorCount++;
      continue;
    }

    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // Check noindex
    const robots = getRobotsMeta(htmlContent);
    const isNoindex = robots.some(r => r.includes('noindex'));
    if (isNoindex) {
      issues.push('NOINDEX_IN_SITEMAP');
    }

    // Check canonical
    const canonical = getCanonicalUrl(htmlContent);
    if (canonical) {
      if (normalizeUrl(canonical) !== normUrl) {
        issues.push('CANONICAL_MISMATCH');
      }
    } else {
      issues.push('MISSING_CANONICAL');
    }

    const status = issues.length > 0 ? issues[0] : 'LIVE_INDEXABLE';
    if (status === 'LIVE_INDEXABLE') {
      liveIndexableCount++;
    } else {
      errorCount++;
    }

    results.push({
      url: rawUrl,
      filePath,
      status,
      issues,
      canonical,
      robots
    });
  }

  // Create summary
  const summary = {
    totalUrls: urls.length,
    liveIndexable: liveIndexableCount,
    '404_IN_SITEMAP': results.filter(r => r.issues.includes('404_IN_SITEMAP')).length,
    'NOINDEX_IN_SITEMAP': results.filter(r => r.issues.includes('NOINDEX_IN_SITEMAP')).length,
    'CANONICAL_MISMATCH': results.filter(r => r.issues.includes('CANONICAL_MISMATCH')).length,
    'DUPLICATE_URL': results.filter(r => r.issues.includes('DUPLICATE_URL')).length,
    'MISSING_CANONICAL': results.filter(r => r.issues.includes('MISSING_CANONICAL')).length
  };

  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify({ summary, results }, null, 2), 'utf8');

  // Print concise table to terminal
  console.log('\n--- Sitemap Indexability Audit Report ---');
  console.table(summary);

  const errors = results.filter(r => r.issues.length > 0);
  if (errors.length > 0) {
    console.log('\n--- Details of Violations ---');
    errors.forEach(err => {
      console.log(`URL: ${err.url}`);
      console.log(`  Issues: ${err.issues.join(', ')}`);
      console.log(`  Canonical in HTML: ${err.canonical}`);
      console.log(`  Robots tag in HTML: ${err.robots.join(', ')}`);
    });
    console.log(`\nAudit failed with ${errorCount} total URL errors. Written report to ${REPORT_PATH}`);
    process.exit(1);
  }

  console.log('\nAudit passed! All URLs are live, indexable, and match their canonical headers.');
  process.exit(0);
}

main();
