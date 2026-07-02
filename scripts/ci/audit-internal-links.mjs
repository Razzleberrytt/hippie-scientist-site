#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import fsPromises from 'node:fs/promises'
const root=process.cwd(); const outDir=path.join(root,'out')
const FULL_HTML_AUDIT = process.env.FULL_HTML_AUDIT === '1' || process.env.CI === 'true';
const staticAssetExt=/\.(?:css|js|json|png|jpe?g|gif|webp|avif|svg|ico|txt|xml|map|woff2?)$/i
let files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='_next') continue; const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.isFile()&&e.name.endsWith('.html')) files.push(f)}}
if(!fs.existsSync(outDir)){console.log('[audit-internal-links] SKIP: Build output not found at out/. Run npm run build first.');process.exit(0)}
walk(outDir)

const routeFromFile = (f) => '/' + path.relative(outDir, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'

function readRedirectSourcePatterns() {
  const redirectsPath = path.join(root, 'public', '_redirects')
  if (!fs.existsSync(redirectsPath)) return []

  return fs.readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/)[0])
    .filter((source) => source?.startsWith('/'))
}

const redirectSourcePatterns = readRedirectSourcePatterns()
const isRedirectSourceRoute = (route) => redirectSourcePatterns.some((source) => {
  if (source.endsWith('/*')) return route.startsWith(source.slice(0, -1))
  if (source.includes(':splat')) return route.startsWith(source.split(':splat')[0].replace(/\/$/, '/'))
  return route === source.replace(/\/$/, '') || route === source
})

files = files.filter((f) => !isRedirectSourceRoute(routeFromFile(f)))

if (!FULL_HTML_AUDIT) {
  const criticalSubpaths = [
    '/index.html',
    '/faq/index.html',
    '/herbs/index.html',
    '/compounds/index.html',
    '/articles/index.html',
    '/guides/index.html',
    '/herbs/ashwagandha/index.html',
    '/compounds/l-theanine/index.html',
    '/articles/best-supplements-for-adhd/index.html',
    '/articles/adhd-stack-guide/index.html',
    '/articles/2c-b-effects/index.html'
  ];
  files = files.filter(f => {
    const rel = '/' + path.relative(outDir, f).replace(/\\/g, '/');
    return criticalSubpaths.includes(rel);
  });
  console.log(`[audit-internal-links] Running in targeted mode. Scanning ${files.length} critical pages (use FULL_HTML_AUDIT=1 to audit all files).`);
}

const routes=new Set(files.map(routeFromFile))
const graph=new Map([...routes].map(r=>[r,new Set()]))
const hrefRe=/href=["'](\/[^"'#\s>]+)["']/g
const robotsNoindexRe=/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b)[^>]*>/i

function nonCanonicalInternalHref(href) {
  if (!href || href === '/' || href.includes('?') || href.includes('#')) return null
  if (staticAssetExt.test(href)) return null
  if (href.endsWith('/')) return null
  if (href.split('/').pop()?.includes('.')) return null
  return { href, canonicalHref: `${href}/` }
}

function topCounts(rows, key, limit = 25) {
  const counts = new Map()
  for (const row of rows) {
    const value = String(row[key] || '').trim()
    if (!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit)
}

function summarizeNonCanonicalLinks(rows) {
  return {
    total: rows.length,
    topHrefs: topCounts(rows, 'href'),
    topCanonicalHrefs: topCounts(rows, 'canonicalHref'),
    topSourceRoutes: topCounts(rows, 'source'),
  }
}

async function run() {
  const batchSize = 100
  const noindexRoutes = new Set()
  const nonCanonicalInternalLinks = []
  console.log(`[internal-links] Starting audit of ${files.length} HTML files in batches of ${batchSize}...`)
  for (let i = 0; i < files.length; i += batchSize) {
    console.log(`[internal-links] Processing batch ${i / batchSize + 1}/${Math.ceil(files.length / batchSize)} (files ${i} to ${Math.min(i + batchSize, files.length)})...`)
    const batch = files.slice(i, i + batchSize)
    await Promise.all(batch.map(async (f, idx) => {
      const route=routeFromFile(f);
      const fileIndex = i + idx;
      console.log(`[internal-links] Scanning ${fileIndex}: ${route}`);
      const html=await fsPromises.readFile(f,'utf8');
      if (robotsNoindexRe.test(html)) noindexRoutes.add(route)
      const start = Date.now();
      for(const m of html.matchAll(hrefRe)){
        const h=m[1];
        if(!h.startsWith('/')) continue;
        const nonCanonical = nonCanonicalInternalHref(h)
        if (nonCanonical) nonCanonicalInternalLinks.push({ source: route, ...nonCanonical })
        const t=h.split('?')[0].replace(/\/$/,'')||'/';
        if(graph.has(t)) graph.get(route).add(t)
      }
      const duration = Date.now() - start;
      if (duration > 100) {
        console.log(`[internal-links] Warning: File ${fileIndex} ${route} took ${duration}ms to scan regex`);
      }
    }))
  }

  const orphan=[...graph.entries()].filter(([,o])=>o.size===0).map(([r])=>r)
  const weak=[...graph.entries()].filter(([,o])=>o.size>0&&o.size<3).map(([r,o])=>({route:r,outbound:o.size}))
  const density=[...graph.entries()].map(([r,o])=>({route:r,outbound:o.size})).sort((a,b)=>b.outbound-a.outbound)
  const nonCanonicalSummary = summarizeNonCanonicalLinks(nonCanonicalInternalLinks)
  const report={generatedAt:new Date().toISOString(),totalRoutes:routes.size,orphanRoutes:orphan,weaklyConnected:weak,internalLinkDensity:density.slice(0,100),nonCanonicalInternalLinks,nonCanonicalSummary}
  fs.mkdirSync(path.join(root,'ops','reports'),{recursive:true}); fs.writeFileSync(path.join(root,'ops/reports/internal-link-report.json'),JSON.stringify(report,null,2));
  const nonIndexable = orphan.filter(r => r === '/500' || r.startsWith('/_not-found') || r.startsWith('/sitemap.xml') || r.startsWith('/robots.txt') || r.startsWith('/opengraph-image') || r.startsWith('/twitter-image') || r.startsWith('/blogdata') || noindexRoutes.has(r))
  const blockingOrphans = orphan.filter(r => !nonIndexable.includes(r))
  const topNonCanonicalSource = nonCanonicalSummary.topSourceRoutes[0]
  console.log(`internal-links: routes=${routes.size}, orphan=${orphan.length}, blockingOrphan=${blockingOrphans.length}, weak=${weak.length}, nonCanonical=${nonCanonicalInternalLinks.length}`)
  if (topNonCanonicalSource) {
    console.log(`[internal-links] top non-canonical source: ${topNonCanonicalSource.value} (${topNonCanonicalSource.count})`)
  }
  if (nonCanonicalInternalLinks.length) {
    console.warn(`[internal-links] non-blocking warning: found ${nonCanonicalInternalLinks.length} non-canonical internal hrefs`)
  }
  if (blockingOrphans.length) {
    console.warn(`[internal-links] non-blocking warning: found ${blockingOrphans.length} potentially orphaned crawlable routes`)
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
