#!/usr/bin/env node
// Atomic single-file GitHub reservation writer using Contents API blob-SHA CAS.
// Requires GITHUB_TOKEN and GITHUB_REPOSITORY; no paid research services.
import { readFileSync } from 'node:fs';
import { validate } from './validate-research-lanes-v2.mjs';
const [proposalPath] = process.argv.slice(2);
if (!proposalPath) throw Error('Usage: node reserve-research-lane-v2.mjs proposal.json');
const {owner,repo}=(()=>{const p=(process.env.GITHUB_REPOSITORY||'').split('/');if(p.length!==2)throw Error('GITHUB_REPOSITORY required');return {owner:p[0],repo:p[1]}})();
const token=process.env.GITHUB_TOKEN;
if(!token)throw Error('GITHUB_TOKEN required');
const branch=process.env.RESEARCH_RESERVATION_BRANCH||'main';
const path='ops/enrichment-submissions/reservations/research-lanes-v2.json';
const proposal=JSON.parse(readFileSync(proposalPath,'utf8'));
if(!Array.isArray(proposal.reservations)||!proposal.reservations.length)throw Error('Nonempty reservations required');
const base='https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+path;
async function request(method,url,body) {
 const res=await fetch(url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},body:body?JSON.stringify(body):undefined});
 const data=await res.json().catch(()=>({}));
 return {ok:res.ok,status:res.status,data};
}
for(let attempt=0;attempt<5;attempt++){
 const current=await request('GET',base+'?ref='+encodeURIComponent(branch));
 if(!current.ok&&current.status!==404)throw Error('Registry read failed '+current.status);
 const registry=current.ok?JSON.parse(Buffer.from(current.data.content.replace(/\s/g,''),'base64').toString('utf8')):{schemaVersion:'2.0.0',reservations:[]};
 if(!current.ok || registry.bootstrapComplete!==true)throw Error('Reservation registry not reconciled/bootstrapComplete; refusing write');
 const candidate={...registry,reservations:[...registry.reservations,...proposal.reservations]};
 const errors=validate(candidate,{records:[]});
 if(errors.length)throw Error('Reservation rejected: '+errors.join('; '));
 const result=await request('PUT',base,{message:'research: reserve unique lane identities',branch,sha:current.ok?current.data.sha:undefined,content:Buffer.from(JSON.stringify(candidate,null,2)+'\n').toString('base64')});
 if(result.ok){console.log('RESERVED '+proposal.reservations.length+' at '+result.data.commit.sha);process.exit(0)}
 if(result.status!==409&&result.status!==422)throw Error('Registry write failed '+result.status);
 // Reread the authoritative registry and revalidate all identities on every conflict.
}
throw Error('Concurrent reservation retries exhausted; no reservation confirmed');
