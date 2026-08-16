#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_OUT = 'out';
const DEFAULT_SITEMAP = 'public/sitemap.xml';
const DEFAULT_BASELINE = 'artifacts/regression/baseline.json';
const DEFAULT_CURRENT = 'artifacts/regression/current.json';

const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
const uniq = (items) => [...new Set(items)].sort();
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const matchOne = (html, re) => html.match(re)?.[1]?.trim() ?? null;
const matches = (html, re) => [...html.matchAll(re)].map((m) => m[1]).filter(Boolean);

async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function htmlPathToUrl(file, outDir) {
  const rel = path.relative(outDir, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')}`.replace(/\/+/g, '/');
}

function parseJsonLd(html) {
  const blocks = matches(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  return blocks.map((raw) => {
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
      return {
        valid: true,
        types: uniq(nodes.flatMap((node) => Array.isArray(node?.['@type']) ? node['@type'] : node?.['@type'] ? [node['@type']] : [])),
        hash: hash(parsed),
      };
    } catch {
      return { valid: false, types: [], hash: hash(raw) };
    }
  });
}

function parseEvidenceGrades(html) {
  const visible = text(html);
  const found = matches(visible, /(?:evidence\s+grade|grade)\s*[:-]?\s*(Avoid\/Insufficient|[ABCD])\b/gi);
  return uniq(found.map((grade) => grade.length === 1 ? grade.toUpperCase() : 'Avoid/Insufficient'));
}

function parseCitations(html) {
  const pmids = matches(html, /(?:pubmed\.ncbi\.nlm\.nih\.gov\/|PMID\s*[:#]?\s*)(\d{6,9})/gi);
  const dois = matches(html, /(?:doi\.org\/|doi\s*[:#]?\s*)(10\.\d{4,9}\/[\w.()/:;-]+)/gi).map((doi) => doi.replace(/[).,;]+$/, '').toLowerCase());
  return { pmids: uniq(pmids), dois: uniq(dois) };
}

function parsePage(html, url, sitemapUrls) {
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = matchOne(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
    ?? matchOne(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical = matchOne(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    ?? matchOne(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  const robots = (matchOne(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i) ?? '').toLowerCase();
  const internalLinks = uniq(matches(html, /<a[^>]+href=["'](\/[^"'#?]*)/gi).map((href) => href.replace(/\/+/g, '/')));
  const evidenceGrades = parseEvidenceGrades(html);
  const citations = parseCitations(html);
  const structuredData = parseJsonLd(html);
  const metadata = { title, description, canonical };
  const indexability = {
    noindex: /(?:^|[,\s])noindex(?:$|[,\s])/.test(robots),
    inSitemap: sitemapUrls.has(url),
    canonical,
  };

  return {
    url,
    metadata,
    internalLinks,
    evidenceGrades,
    citations,
    structuredData,
    indexability,
    hashes: {
      metadata: hash(metadata),
      internalLinks: hash(internalLinks),
      evidenceGrades: hash(evidenceGrades),
      citations: hash(citations),
      structuredData: hash(structuredData),
      indexability: hash(indexability),
    },
  };
}

async function readSitemapUrls(sitemapPath) {
  try {
    const xml = await fs.readFile(sitemapPath, 'utf8');
    return new Set(matches(xml, /<loc>([^<]+)<\/loc>/gi).map((loc) => {
      try { return new URL(loc).pathname.replace(/\/+/g, '/'); } catch { return loc; }
    }));
  } catch {
    return new Set();
  }
}

export async function createSnapshot({ outDir = DEFAULT_OUT, sitemapPath = DEFAULT_SITEMAP } = {}) {
  const sitemapUrls = await readSitemapUrls(sitemapPath);
  const htmlFiles = (await walk(outDir)).filter((file) => file.endsWith('.html')).sort();
  const pages = [];
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8');
    const url = htmlPathToUrl(file, outDir);
    pages.push(parsePage(html, url, sitemapUrls));
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceCommit: process.env.GITHUB_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? null,
    urlCount: pages.length,
    inventoryHash: hash(pages.map((page) => page.url)),
    pages,
  };
}

function pageMap(snapshot) {
  return new Map((snapshot.pages ?? []).map((page) => [page.url, page]));
}

export function compareSnapshots(baseline, current) {
  const before = pageMap(baseline);
  const after = pageMap(current);
  const addedUrls = [...after.keys()].filter((url) => !before.has(url)).sort();
  const removedUrls = [...before.keys()].filter((url) => !after.has(url)).sort();
  const changed = [];
  const regressions = [];

  for (const [url, oldPage] of before) {
    const newPage = after.get(url);
    if (!newPage) continue;
    const fields = ['metadata', 'internalLinks', 'evidenceGrades', 'citations', 'structuredData', 'indexability'];
    const changedFields = fields.filter((field) => oldPage.hashes?.[field] !== newPage.hashes?.[field]);
    if (changedFields.length) changed.push({ url, fields: changedFields });

    if ((oldPage.internalLinks?.length ?? 0) > (newPage.internalLinks?.length ?? 0)) {
      regressions.push({ url, type: 'lost-internal-links', before: oldPage.internalLinks.length, after: newPage.internalLinks.length });
    }
    const oldCitationCount = (oldPage.citations?.pmids?.length ?? 0) + (oldPage.citations?.dois?.length ?? 0);
    const newCitationCount = (newPage.citations?.pmids?.length ?? 0) + (newPage.citations?.dois?.length ?? 0);
    if (oldCitationCount > newCitationCount) regressions.push({ url, type: 'lost-citations', before: oldCitationCount, after: newCitationCount });
    if (!oldPage.indexability?.noindex && newPage.indexability?.noindex) regressions.push({ url, type: 'became-noindex' });
    if (oldPage.indexability?.inSitemap && !newPage.indexability?.inSitemap) regressions.push({ url, type: 'dropped-from-sitemap' });
    const oldValidLd = (oldPage.structuredData ?? []).filter((item) => item.valid).length;
    const newValidLd = (newPage.structuredData ?? []).filter((item) => item.valid).length;
    if (oldValidLd > newValidLd) regressions.push({ url, type: 'lost-structured-data', before: oldValidLd, after: newValidLd });
  }

  for (const url of removedUrls) regressions.push({ url, type: 'url-removed' });

  return {
    schemaVersion: 1,
    comparedAt: new Date().toISOString(),
    baselineCommit: baseline.sourceCommit ?? null,
    currentCommit: current.sourceCommit ?? null,
    summary: {
      beforeUrls: before.size,
      afterUrls: after.size,
      addedUrls: addedUrls.length,
      removedUrls: removedUrls.length,
      changedUrls: changed.length,
      regressions: regressions.length,
    },
    addedUrls,
    removedUrls,
    changed,
    regressions,
  };
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const [command = 'snapshot', ...args] = process.argv.slice(2);
  const arg = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : fallback;
  };

  if (command === 'snapshot') {
    const output = arg('--output', DEFAULT_BASELINE);
    const snapshot = await createSnapshot({ outDir: arg('--out', DEFAULT_OUT), sitemapPath: arg('--sitemap', DEFAULT_SITEMAP) });
    await writeJson(output, snapshot);
    console.log(`Regression snapshot: ${snapshot.urlCount} URLs → ${output}`);
    return;
  }

  if (command === 'compare') {
    const baselinePath = arg('--baseline', DEFAULT_BASELINE);
    const currentPath = arg('--current', DEFAULT_CURRENT);
    if (args.includes('--snapshot-current')) {
      await writeJson(currentPath, await createSnapshot({ outDir: arg('--out', DEFAULT_OUT), sitemapPath: arg('--sitemap', DEFAULT_SITEMAP) }));
    }
    const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
    const current = JSON.parse(await fs.readFile(currentPath, 'utf8'));
    const report = compareSnapshots(baseline, current);
    const reportPath = arg('--report', 'artifacts/regression/report.json');
    await writeJson(reportPath, report);
    console.log(`Regression compare: ${report.summary.changedUrls} changed; ${report.summary.regressions} regressions → ${reportPath}`);
    if (args.includes('--fail-on-regression') && report.regressions.length) process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown command: ${command}. Use snapshot or compare.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
