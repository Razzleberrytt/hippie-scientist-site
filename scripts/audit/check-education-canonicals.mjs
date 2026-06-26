#!/usr/bin/env node
/**
 * Source-level audit: every App Router page under app/education/**\/page.tsx
 * must export `metadata` with `alternates.canonical` pointing at its own route.
 *
 * Pages that don't override metadata inherit the root layout's canonical (/)
 * and Google treats them as duplicates of the homepage. This script catches
 * the regression before build.
 *
 * Usage: node scripts/audit/check-education-canonicals.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'app', 'education');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^\[.+\]$/.test(entry.name)) continue; // dynamic routes use generateMetadata, skip
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(full);
    }
  }
  return out;
}

function extractCanonical(src) {
  // Look for an explicit metadata export
  // Case 1: `alternates: { canonical: '...' }` inside an object literal
  const alternatesMatch = src.match(/alternates\s*:\s*\{[^}]*canonical\s*:\s*['"]([^'"]+)['"]/);
  if (alternatesMatch) return alternatesMatch[1];

  // Case 2: buildPageMetadata({ ..., path: '/...' }) — check the path arg
  const buildMetaMatch = src.match(/buildPageMetadata\s*\(\s*\{[\s\S]*?path\s*:\s*['"]([^'"]+)['"]/);
  if (buildMetaMatch) return `via buildPageMetadata path=${buildMetaMatch[1]}`;

  // Case 3: generatePathwayMetadata('x') — indirect call to buildPageMetadata
  const pathwayMatch = src.match(/generatePathwayMetadata\s*\(\s*['"]([^'"]+)['"]/);
  if (pathwayMatch) {
    return `via generatePathwayMetadata path=/education/${pathwayMatch[1]}/`;
  }

  return null;
}

function isExplicitlyNoindex(src) {
  // Pages that opt out of indexing (utility routes, explorers, etc.) don't
  // need their own canonical — they explicitly tell crawlers not to index.
  return /index\s*:\s*false/.test(src) || /noindex\s*:/.test(src);
}

function expectedRouteFromPath(filePath) {
  const rel = path.relative(TARGET_DIR, filePath).replace(/\\/g, '/');
  const parts = rel.split('/').filter((p) => p && p !== 'page.tsx');
  return '/' + ['education', ...parts].join('/');
}

const files = walk(TARGET_DIR);
let problems = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const expectedRoute = expectedRouteFromPath(f);
  const expectedCanonical = `${expectedRoute}/`;
  const actual = extractCanonical(src);
  const noindex = isExplicitlyNoindex(src);

  let status = 'OK';
  let detail = actual ?? '(none)';

  if (!actual && noindex) {
    // Intentional noindex — no canonical needed (inherits parent is fine
    // because we're telling crawlers not to index the page anyway).
    detail = 'noindex page, no canonical required';
  } else if (!actual) {
    status = 'FAIL';
    detail = 'no canonical declared';
    problems++;
  } else if (actual.startsWith('via buildPageMetadata') || actual.startsWith('via generatePathwayMetadata')) {
    const m = actual.match(/path=(\/[^ ]+)/);
    const declaredPath = m ? m[1] : '';
    if (declaredPath !== expectedCanonical) {
      status = 'FAIL';
      detail = `path mismatch: declared=${declaredPath}, expected=${expectedCanonical}`;
      problems++;
    } else {
      detail = actual;
    }
  } else if (actual !== expectedCanonical) {
    status = 'FAIL';
    detail = `canonical mismatch: actual=${actual}, expected=${expectedCanonical}`;
    problems++;
  }

  const rel = path.relative(ROOT, f);
  const tag = status === 'OK' ? '✅' : '❌';
  console.log(`${tag} ${rel} → ${detail}`);
}

console.log(`\n[check-education-canonicals] ${files.length} files, ${problems} problems`);
process.exit(problems > 0 ? 1 : 0);
