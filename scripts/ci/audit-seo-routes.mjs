#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path'
const root=process.cwd(), outDir=path.join(root,'out'); if(!fs.existsSync(outDir)){console.error('out/ not found');process.exit(1)}
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html'))files.push(f)}};walk(outDir)
const rows=[]
for(const f of files){const route='/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/$/,'')||'/'; const h=fs.readFileSync(f,'utf8'); const title=(h.match(/<title>([^<]*)<\/title>/i)||[])[1]||''; const desc=(h.match(/name="description" content="([^"]*)"/i)||[])[1]||''; const canonical=(h.match(/rel="canonical" href="([^"]+)"/i)||[])[1]||''; const og=(h.match(/property="og:title"/g)||[]).length>0; const tw=(h.match(/name="twitter:card"/g)||[]).length>0; const sd=(h.match(/application\/ld\+json/g)||[]).length>0; let score=0; if(title)score+=20; if(desc)score+=15; if(canonical)score+=20; if(og)score+=10; if(tw)score+=10; if(sd)score+=15; if(route.startsWith('/herbs?page='))score+=10; const sev=score<50?'severe':score<75?'moderate':'good'; rows.push({route,score,severity:sev,title,description:desc,canonical})}
const dupTitles=rows.filter((r,i,a)=>r.title&&a.findIndex(x=>x.title===r.title)!==i).map(r=>r.route)
const report={generatedAt:new Date().toISOString(),routes:rows.length,avgScore:Number((rows.reduce((s,r)=>s+r.score,0)/rows.length).toFixed(2)),severe:rows.filter(r=>r.severity==='severe').length,moderate:rows.filter(r=>r.severity==='moderate').length,duplicates:{titles:dupTitles},rows}
fs.mkdirSync(path.join(root,'ops/reports'),{recursive:true});fs.writeFileSync(path.join(root,'ops/reports/seo-route-audit.json'),JSON.stringify(report,null,2));
console.log(`seo-routes: avg=${report.avgScore}, severe=${report.severe}, moderate=${report.moderate}`)
if(report.severe>0) process.exitCode=1
