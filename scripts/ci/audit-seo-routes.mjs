#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path'
import fsPromises from 'node:fs/promises'
const root=process.cwd(), outDir=path.join(root,'out'); if(!fs.existsSync(outDir)){console.log('[audit-seo-routes] SKIP: out/ not found. Run npm run build first.');process.exit(0)}
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='_next') continue; const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html'))files.push(f)}};walk(outDir)
const isNonIndexableRoute=(route)=>route.startsWith('/_not-found')||route.startsWith('/opengraph-image')||route.startsWith('/twitter-image')||route.startsWith('/robots.txt')||route.startsWith('/sitemap.xml')||route.startsWith('/blogdata')
const rows=[]

async function run() {
  const batchSize = 100
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    await Promise.all(batch.map(async (f) => {
      const route='/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/$/,'')||'/';
      const h=await fsPromises.readFile(f,'utf8');
      const title=(h.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
      const desc=(h.match(/name="description" content="([^"]*)"/i)||[])[1]||'';
      const canonical=(h.match(/rel="canonical" href="([^"]+)"/i)||[])[1]||'';
      const og=(h.match(/property="og:title"/g)||[]).length>0;
      const tw=(h.match(/name="twitter:card"/g)||[]).length>0;
      const sd=(h.match(/application\/ld\+json/g)||[]).length>0;
      let score=0;
      if(title)score+=20;
      if(desc)score+=15;
      if(canonical)score+=20;
      if(og)score+=10;
      if(tw)score+=10;
      if(sd)score+=15;
      if(route.startsWith('/herbs?page='))score+=10;
      const sev=score<50?'severe':score<75?'moderate':'good';
      rows.push({route,score,severity:sev,title,description:desc,canonical})
    }))
  }

  const dupTitles=rows.filter((r,i,a)=>r.title&&a.findIndex(x=>x.title===r.title)!==i).map(r=>r.route)
  const severeRoutes=rows.filter(r=>r.severity==='severe')
  const blockingSevere=severeRoutes.filter(r=>!isNonIndexableRoute(r.route))
  const report={generatedAt:new Date().toISOString(),routes:rows.length,avgScore:Number((rows.reduce((s,r)=>s+r.score,0)/rows.length).toFixed(2)),severe:severeRoutes.length,moderate:rows.filter(r=>r.severity==='moderate').length,blockingSevere:blockingSevere.length,duplicates:{titles:dupTitles},rows}
  fs.mkdirSync(path.join(root,'ops/reports'),{recursive:true});fs.writeFileSync(path.join(root,'ops/reports/seo-route-audit.json'),JSON.stringify(report,null,2));
  console.log(`seo-routes: avg=${report.avgScore}, severe=${report.severe}, blockingSevere=${report.blockingSevere}, moderate=${report.moderate}`)
  if(report.blockingSevere>0){console.warn(`[seo-routes] non-blocking warning: ${report.blockingSevere} severe routes need metadata hardening`) }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
