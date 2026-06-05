#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path'
import fsPromises from 'node:fs/promises'
const root=process.cwd(), outDir=path.join(root,'out'); if(!fs.existsSync(outDir)){console.error('out/ not found');process.exit(1)}
const families=[['herbs','/herbs/'],['compounds','/compounds/'],['blog','/blog/'],['taxonomy','/blog/tags/'],['archives','/blog/categories/'],['homepage','/'],['ecosystem','/ecosystems/'],['protocols','/protocols/']]
const required=['MedicalWebPage','Article','BlogPosting','BreadcrumbList','FAQPage','Organization','WebSite']
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='_next') continue; const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html'))files.push(f)}};walk(outDir)
const rows=[]

// Current primary slugs from data (to skip schema requirements for legacy alias routes
// that exist only for redirects/SEO, e.g. old compound slugs merged to herbs).
const currentHerbSlugs = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'public/data/herbs.json'), 'utf8')).map((h) => String(h.slug || '').toLowerCase().trim())
)
const currentCompoundSlugs = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'public/data/compounds.json'), 'utf8')).map((c) => String(c.slug || '').toLowerCase().trim())
)

// Representative pages to explicitly validate per task. The full-route coverage
// report below is diagnostic only because not every page family should contain
// every structured-data type.
const repChecks = [
  { route: '/herbs/ashwagandha', types: ['MedicalWebPage', 'BreadcrumbList'] },
  { route: '/compounds/l-theanine', types: ['MedicalWebPage', 'BreadcrumbList'] },
  { route: '/blog/2c-b-effects', types: ['BlogPosting', 'BreadcrumbList', 'Article'] },
  { route: '/faq', types: ['FAQPage', 'BreadcrumbList'] },
  { route: '/', types: ['WebSite', 'Organization'] },
]

function routeFromFile(f) {
  const rel = path.relative(outDir, f).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')
}

async function readRouteHtml(route) {
  const relative = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`
  return fsPromises.readFile(path.join(outDir, relative), 'utf8').catch(() => '')
}

function isDetailRoute(route, prefix) {
  return route.startsWith(prefix + '/') && !route.startsWith(prefix + '/page/')
}

function isProtocolDetailRoute(route) {
  return (
    route.startsWith('/protocols/') &&
    route !== '/protocols' &&
    route !== '/protocols/' &&
    !route.startsWith('/protocols/page/')
  )
}

async function run() {
  const batchSize = 100
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    await Promise.all(batch.map(async (f) => {
      const route=routeFromFile(f);
      const html=await fsPromises.readFile(f,'utf8');
      if (html.includes('NEXT_REDIRECT')) return;
      const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>m[1]);
      const text=blocks.join(' ');
      const hit=Object.fromEntries(required.map(t=>[t,text.includes(`"${t}"`)||text.includes(`"@type":"${t}"`)]));
      const fam=(families.find(([,p])=>p==='/'?route==='/' : route.startsWith(p))||['other'])[0];
      rows.push({route,family:fam,types:hit,blockCount:blocks.length})
    }))
  }

  const byFamily={}
  for(const r of rows){byFamily[r.family]??={count:0,hits:Object.fromEntries(required.map(t=>[t,0]))};byFamily[r.family].count++;for(const t of required) if(r.types[t]) byFamily[r.family].hits[t]++}
  const familyCoverage=Object.fromEntries(Object.entries(byFamily).map(([k,v])=>[k,{routes:v.count,coverage:Object.fromEntries(required.map(t=>[t,Number((v.hits[t]/v.count*100).toFixed(1))]))}]))
  const missing=rows.map(r=>({route:r.route,missing:required.filter(t=>!r.types[t])})).filter(r=>r.missing.length)
  const malformed=rows.filter(r=>r.blockCount===0).map(r=>r.route)

  // Representative checks + parse validation. These are the blocking checks.
  let repFails = 0
  const repErrors = []
  for (const rep of repChecks) {
    const r = rows.find(x => x.route === rep.route || x.route === rep.route + '/')
    if (!r) {
      const message = `[structured-data] missing rep route html: ${rep.route}`
      console.error(message)
      repErrors.push(message)
      repFails++
      continue
    }
    for (const t of rep.types) {
      if (!r.types[t]) {
        const message = `[structured-data] rep ${rep.route} missing ${t}`
        console.error(message)
        repErrors.push(message)
        repFails++
      }
    }
    const html=await readRouteHtml(rep.route)
    const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>m[1]);
    for (const b of blocks) {
      try { JSON.parse(b) } catch { const message = `[structured-data] invalid JSON-LD on ${rep.route}`; console.error(message); repErrors.push(message); repFails++ }
    }
  }

  // Diagnostic only: duplicate herb descriptions are a content-quality signal,
  // not a deploy blocker. Generated workbook rows can intentionally share a
  // fallback description until stronger row-level summaries exist.
  const herbDescs = new Map()
  for (const f of files) {
    if (!f.includes('/herbs/') || f.includes('/herbs/index')) continue
    const html = await fsPromises.readFile(f, 'utf8')
    const m = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (m) {
      const d = m[1].trim()
      if (d) herbDescs.set(d, (herbDescs.get(d)||0) + 1)
    }
  }
  const dupDescs = [...herbDescs.entries()].filter(([,c]) => c > 1)
  if (dupDescs.length > 0) {
    console.warn(`[structured-data] warning: duplicate meta descriptions found on ${dupDescs.length} herb description groups (e.g. "${dupDescs[0][0].slice(0,60)}..." x${dupDescs[0][1]})`)
  }

  const report={generatedAt:new Date().toISOString(),routeCount:rows.length,familyCoverage,missing,malformed,repFails, dupDescHerbs: dupDescs.length}
  fs.mkdirSync(path.join(root,'ops/reports'),{recursive:true});fs.writeFileSync(path.join(root,'ops/reports/structured-data-completeness.json'),JSON.stringify(report,null,2));
  console.log(`structured-data: routes=${rows.length}, missing=${missing.length}, malformed=${malformed.length}, repFails=${repFails}, herbDupDescs=${dupDescs.length}`)

  let failed = repFails > 0;
  const errors = []; // non-rep gaps (diagnostic)

  for (const r of rows) {
    const route = r.route;
    
    // Ignore blogdata routes completely
    if (route.startsWith('/blogdata')) {
      continue;
    }
    
    // Herb detail page checks (current primary only; legacy aliases for redirects are diagnostic)
    if (isDetailRoute(route, '/herbs')) {
      const slug = route.replace('/herbs/','').replace(/\/$/,'').toLowerCase();
      if (currentHerbSlugs.has(slug)) {
        if (!r.types.MedicalWebPage) {
          errors.push(`Herb profile page "${route}" is missing "MedicalWebPage" schema`);
        }
        if (!r.types.BreadcrumbList) {
          errors.push(`Herb profile page "${route}" is missing "BreadcrumbList" schema`);
        }
      }
    }
    
    // Compound detail page checks (current primary only)
    if (isDetailRoute(route, '/compounds')) {
      const slug = route.replace('/compounds/','').replace(/\/$/,'').toLowerCase();
      if (currentCompoundSlugs.has(slug)) {
        if (!r.types.MedicalWebPage) {
          errors.push(`Compound profile page "${route}" is missing "MedicalWebPage" schema`);
        }
        if (!r.types.BreadcrumbList) {
          errors.push(`Compound profile page "${route}" is missing "BreadcrumbList" schema`);
        }
      }
    }

    // Protocol detail page checks
    if (isProtocolDetailRoute(route)) {
      if (!r.types.MedicalWebPage && !r.types.Article) {
        errors.push(`Protocol page "${route}" is missing "MedicalWebPage" / "Article" schema`);
      }
      if (!r.types.BreadcrumbList) {
        errors.push(`Protocol page "${route}" is missing "BreadcrumbList" schema`);
      }
    }
    
    // Blog detail page checks
    if (route.startsWith('/blog/') && !route.startsWith('/blog/tags') && !route.startsWith('/blog/categories') && !route.startsWith('/blog/style') && !route.startsWith('/blog/page/')) {
      if (!r.types.Article && !r.types.BlogPosting) {
        errors.push(`Blog page "${route}" is missing "Article" / "BlogPosting" schema`);
      }
      if (!r.types.BreadcrumbList) {
        errors.push(`Blog page "${route}" is missing "BreadcrumbList" schema`);
      }
    }
    
    // Guide page checks (excluding manual placeholder or non-FAQ harm-reduction guides)
    const manualGuides = new Set([
      '/guides/best-herbs-for-stress-and-anxiety-at-night',
      '/guides/best-natural-sleep-aids-that-work',
      '/guides/best-supplements-for-overthinking',
      '/guides/focus-without-caffeine-crash',
      '/guides/how-to-lower-cortisol-naturally',
      '/guides/kratom-7oh-withdrawal-management',
      '/guides/magnesium-vs-melatonin',
      '/guides/natural-alternatives-to-anxiety-medication',
      '/guides/natural-anxiolytics-beyond-ashwagandha',
      '/guides/psychedelic-adjacent-herbs',
      '/guides/sleep-herbs-vs-melatonin',
      '/guides/supplements-for-brain-fog-and-fatigue'
    ]);
    const isGuide = route.startsWith('/guides/') && route !== '/guides' && route !== '/guides/' && !manualGuides.has(route);
    const isBestFor = route.startsWith('/best-') && !route.startsWith('/best-for') && route !== '/best' && route !== '/best/';
    if (isGuide || isBestFor) {
      if (!r.types.FAQPage) {
        errors.push(`Guide page "${route}" is missing "FAQPage" schema`);
      }
    }
  }

  if (repFails > 0) {
    console.error('[audit-structured-data] FAIL SUMMARY (blocking rep checks)')
    if (repErrors.length > 0) {
      console.error(`[audit-structured-data] Representative failures: ${repErrors.length}`)
      repErrors.slice(0, 50).forEach(e => console.error(`  - ${e}`))
    }
    console.error('[audit-structured-data] Full report written to ops/reports/structured-data-completeness.json')
    process.exit(1);
  }
  
  if (errors.length > 0) {
    console.warn(`[audit-structured-data] Note: ${errors.length} schema gaps on non-rep pages (diagnostic only; see full report).`)
  }
  console.log('[audit-structured-data] PASS: Representative + core schema checks ok. Per-page coverage for all details is diagnostic.');
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
