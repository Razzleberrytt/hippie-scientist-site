import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {assertNoUnreviewedR818PhysicalArt} from './r818-physical-art-loader.mjs'

function fixture(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ths-r818-art-publish-'))
 try{return fn(root)}finally{fs.rmSync(root,{recursive:true,force:true})}
}
test('legacy approved package remains unaffected by physical-art review hold',()=>fixture(root=>{
 assert.equal(assertNoUnreviewedR818PhysicalArt(root),true)
 fs.writeFileSync(path.join(root,'r817-first-pass.json'),JSON.stringify({beats:[{id:'legacy'}]}))
 assert.equal(assertNoUnreviewedR818PhysicalArt(root),true)
}))
test('actual original-art source receipts cannot authorize their own public release',()=>fixture(root=>{
 fs.writeFileSync(path.join(root,'r818-original-art-review-receipt.json'),JSON.stringify({mayPublish:false}))
 assert.throws(()=>assertNoUnreviewedR818PhysicalArt(root),/separate exact-master science\/craft/)
}))
test('renderer job, canonical plan, and staged PNG each independently enforce publication HOLD',()=>{
 for(const which of ['job','plan','staged'])fixture(root=>{
  if(which==='job')fs.writeFileSync(path.join(root,'r818-physical-job.json'),JSON.stringify({physicalArt:{beat:{primary:{file:'art.png'}}}}))
  if(which==='plan')fs.writeFileSync(path.join(root,'r817-first-pass.json'),JSON.stringify({beats:[{id:'beat',physicalArt:{primary:{file:'art.png'}}}]}))
  if(which==='staged'){
   fs.mkdirSync(path.join(root,'r818-physical-assets'))
   fs.writeFileSync(path.join(root,'r818-physical-assets','beat-primary.png'),'not approved')
  }
  assert.throws(()=>assertNoUnreviewedR818PhysicalArt(root),/publication HOLD/)
 })
})
test('broken art manifest fails closed, not silently ignored',()=>fixture(root=>{
 fs.writeFileSync(path.join(root,'r818-physical-job.json'),'{bad json')
 assert.throws(()=>assertNoUnreviewedR818PhysicalArt(root))
}))
