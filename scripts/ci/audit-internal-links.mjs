#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(); const outDir=path.join(root,'out')
const files=[]; const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.isFile()&&e.name.endsWith('.html')) files.push(f)}}
if(!fs.existsSync(outDir)){console.error('Build output not found at out/. Run npm run build first.');process.exit(1)}
walk(outDir)
const routes=new Set(files.map(f=>'/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/+/g,'/').replace(/\/$/,'')||'/'))
const graph=new Map([...routes].map(r=>[r,new Set()]))
const hrefRe=/href=["']([^"'#]+)["']/g
for(const f of files){const route='/'+path.relative(outDir,f).replace(/index\.html$/,'').replace(/\.html$/,'').replace(/\\/g,'/').replace(/\/$/,'')||'/'; const html=fs.readFileSync(f,'utf8'); for(const m of html.matchAll(hrefRe)){const h=m[1]; if(!h.startsWith('/')) continue; const t=h.split('?')[0].replace(/\/$/,'')||'/'; if(graph.has(t)) graph.get(route).add(t)}}
const orphan=[...graph.entries()].filter(([,o])=>o.size===0).map(([r])=>r)
const weak=[...graph.entries()].filter(([,o])=>o.size>0&&o.size<3).map(([r,o])=>({route:r,outbound:o.size}))
const density=[...graph.entries()].map(([r,o])=>({route:r,outbound:o.size})).sort((a,b)=>b.outbound-a.outbound)
const report={generatedAt:new Date().toISOString(),totalRoutes:routes.size,orphanRoutes:orphan,weaklyConnected:weak,internalLinkDensity:density.slice(0,100)}
fs.mkdirSync(path.join(root,'ops','reports'),{recursive:true}); fs.writeFileSync(path.join(root,'ops/reports/internal-link-report.json'),JSON.stringify(report,null,2));
console.log(`internal-links: routes=${routes.size}, orphan=${orphan.length}, weak=${weak.length}`)
if(orphan.length>0) process.exitCode=1
