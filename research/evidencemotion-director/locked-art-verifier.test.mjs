import { Buffer } from 'node:buffer';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyLockedArt} from './locked-art-verifier.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl9l8cAAAAASUVORK5CYII=','base64');
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ths-locked-png-'));
 fs.writeFileSync(path.join(dir,'back.png'),png);
 fs.writeFileSync(path.join(dir,'hero.png'),png);
 const layers=[{id:'back',file:'back.png',sha256:sha(png),depthClass:'background'},
  {id:'hero',file:'hero.png',sha256:sha(png),depthClass:'foreground'}];
 const identity=sha(Buffer.from(layers.map(x=>x.sha256).join('|')));
 return {dir,reference:{layers,pixelSha256:identity},
  shots:[{id:'b1',referencePixelSha256:identity,regenerateLook:false}]};
}
test('actual PNG bytes lock visual identity without approving quality',()=>{
 const x=fixture();try{
 const r=verifyLockedArt({root:x.dir,reference:x.reference,shots:x.shots});
 assert.equal(r.status,'BYTES_LOCKED_READY_FOR_HUMAN_LOOK_REVIEW');
 assert.equal(r.productionEligible,false);assert.equal(r.excellentCertified,false);
 assert.equal(r.sourceLayers.length,2);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
test('modified source art fails rather than silently changing the shot',()=>{
 const x=fixture();try{
 fs.appendFileSync(path.join(x.dir,'hero.png'),'unapproved bytes');
 const r=verifyLockedArt({root:x.dir,reference:x.reference,shots:x.shots});
 assert.ok(r.errors.includes('SOURCE_PIXELS_NOT_VERIFIED:hero'));
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
test('re-prompted / changed art ID blocks previously directed shot',()=>{
 const x=fixture();try{
 x.shots[0].referencePixelSha256='0'.repeat(64);
 const r=verifyLockedArt({root:x.dir,reference:x.reference,shots:x.shots});
 assert.ok(r.errors.includes('SHOT_REFERENCE_DRIFT'));
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
test('path traversal or missing layer fails closed',()=>{
 const x=fixture();try{
 x.reference.layers[1].file='../not-an-art-file.png';
 const r=verifyLockedArt({root:x.dir,reference:x.reference,shots:x.shots});
 assert.ok(r.errors.includes('SOURCE_PIXELS_NOT_VERIFIED:hero'));
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
