#!/usr/bin/env node
// R8.17 review-only no-credit acceptance CLI. Never posts or mutates sources.
import fs from 'node:fs'
import crypto from 'node:crypto'
import { assertR817FirstPass, assessR817EncodedMaster } from './r817-canonical-first-pass.mjs'
const [command,first,second]=process.argv.slice(2)
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
function read(file){
 if (!file || !fs.existsSync(file)) throw Error('R8.17 input JSON file is missing: '+String(file||'<none>'))
 return {bytes:fs.readFileSync(file),value:JSON.parse(fs.readFileSync(file,'utf8'))}
}
try {
 if(command==='preflight'){
  const p=read(first),m=read(second)
  const check=assertR817FirstPass(p.value,m.value)
  console.log(JSON.stringify({status:'PASS_PRE_RENDER_ONLY',planSha256:sha(p.bytes),
   manifestSha256:sha(m.bytes),check,publicationReady:false},null,2))
 }else if(command==='encoded'){
  const p=read(first),check=assessR817EncodedMaster(p.value)
  console.log(JSON.stringify({status:check.publicationReady?'READY_FOR_OWNER_PUBLICATION_DECISION':'REVIEW_HOLD',
    receiptSha256:sha(p.bytes),check},null,2))
 }else{
  throw Error('Usage: node r817-first-pass-cli.mjs preflight first-pass.json source-manifest.json | encoded exact-master-review.json')
 }
}catch(error){
 console.error('FAIL_R817: '+error.message)
 process.exitCode=1
}
