#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path'
import fsPromises from 'node:fs/promises'
const root=process.cwd(), outDir=path.join(root,'out'); if(!fs.existsSync(outDir)){console.error('out/ not found');process.exit(1)}
const families=[['herbs','/herbs/'],['compounds','/compounds/'],['blog','/blog/'],['taxonomy','/blog/tags/'],['archives','/blog/categories/'],['homepage','/'],['ecosystem','/ecosystems/']]
const required=['MedicalWebPage','Article','BlogPosting','BreadcrumbList','FAQPage','Organization','WebSite']
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='_next') continue; const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html'))files.push(f)}};walk(outDir)
const rows=[]

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

async function run() {
  const batchSize = 100
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    await Promise.all(batch.map(async (f) => {
      const route=routeFromFile(f);
      const html=await fsPromises.readFile(f,'utf8');
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
  for (const rep of repChecks) {
    const r = rows.find(x => x.route === rep.route || x.route === rep.route + '/')
    if (!r) {
      console.error(`[structured-data] missing rep route html: ${rep.route}`)
      repFails++
      continue
    }
    for (const t of rep.types) {
      if (!r.types[t]) {
        console.error(`[structured-data] rep ${rep.route} missing ${t}`)
        repFails++
      }
    }
    const html=await readRouteHtml(rep.route)
    const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>m[1]);
    for (const b of blocks) {
      try { JSON.parse(b) } catch { console.error(`[structured-data] invalid JSON-LD on ${rep.route}`); repFails++ }
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
  if (repFails > 0) process.exit(1)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
