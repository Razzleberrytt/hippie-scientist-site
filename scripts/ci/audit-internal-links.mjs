#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import fsPromises from 'node:fs/promises'
const root=process.cwd(); const outDir=path.join(root,'out')
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='_next') continue; const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.isFile()&&e.name.endsWith('.html')) files.push(f)}}
if(!fs.existsSync(outDir)){console.error('Build output not found at out/. Run npm run build first.');process.exit(1)}
walk(outDir)
const routes=new Set(files.map(f=>'/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/+/g,'/').replace(/\/$/,'')||'/'))
const graph=new Map([...routes].map(r=>[r,new Set()]))
const hrefRe=/href=["'](\/[^"'#\s>]+)["']/g

async function run() {
  const batchSize = 100
  console.log(`[internal-links] Starting audit of ${files.length} HTML files in batches of ${batchSize}...`)
  for (let i = 0; i < files.length; i += batchSize) {
    console.log(`[internal-links] Processing batch ${i / batchSize + 1}/${Math.ceil(files.length / batchSize)} (files ${i} to ${Math.min(i + batchSize, files.length)})...`)
    const batch = files.slice(i, i + batchSize)
    await Promise.all(batch.map(async (f, idx) => {
      const route='/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/$/,'')||'/';
      const fileIndex = i + idx;
      console.log(`[internal-links] Scanning ${fileIndex}: ${route}`);
      const html=await fsPromises.readFile(f,'utf8');
      const start = Date.now();
      for(const m of html.matchAll(hrefRe)){
        const h=m[1];
        if(!h.startsWith('/')) continue;
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
  const report={generatedAt:new Date().toISOString(),totalRoutes:routes.size,orphanRoutes:orphan,weaklyConnected:weak,internalLinkDensity:density.slice(0,100)}
  fs.mkdirSync(path.join(root,'ops','reports'),{recursive:true}); fs.writeFileSync(path.join(root,'ops/reports/internal-link-report.json'),JSON.stringify(report,null,2));
  const nonIndexable = orphan.filter(r => r.startsWith('/_not-found') || r.startsWith('/sitemap.xml') || r.startsWith('/robots.txt') || r.startsWith('/opengraph-image') || r.startsWith('/twitter-image'))
  const blockingOrphans = orphan.filter(r => !nonIndexable.includes(r))
  console.log(`internal-links: routes=${routes.size}, orphan=${orphan.length}, blockingOrphan=${blockingOrphans.length}, weak=${weak.length}`)
  if (blockingOrphans.length) {
    console.warn(`[internal-links] non-blocking warning: found ${blockingOrphans.length} potentially orphaned crawlable routes`)
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
