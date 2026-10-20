import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import process from 'node:process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import os from 'node:os';import path from 'node:path';
import {adjudicateFilm} from './autonomous-quality-arbiter.mjs';

const script=path.resolve('research/evidencemotion-director/native_autocritic.py');
const command=(cmd,args)=>{
 const r=spawnSync(cmd,args,{encoding:'utf8',timeout:45000});
 assert.equal(r.status,0,`${cmd} failed: ${r.error?.message||r.signal||r.stderr?.slice(-2000)||'unknown'}`);
 return r;
};
test('REAL H264 MP4 -> actual Python decoded-pixel proof -> JS autonomous negative decision',{
 skip:process.env.EVIDENCEMOTION_ACTUAL_MEDIA_HANDOFF!=='1'?'FFmpeg/Python provisioned in dedicated protected research job only':false
},()=>{
 const dir=mkdtempSync(path.join(os.tmpdir(),'ths-autonomous-handoff-'));
 try{
  const file=path.join(dir,'static.mp4');
  const receipt=path.join(dir,'proof.json');
  command('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y',
   '-f','lavfi','-i','color=c=black:s=180x320:r=12:d=14',
   '-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',file]);
  command('python',[script,file,'--out',receipt]);
  const decoded=JSON.parse(readFileSync(receipt,'utf8'));
  assert.equal(decoded.schemaVersion,'ths-autonomous-film-critic-research-v1');
  assert.equal(decoded.decision,'AUTO_REVISE');
  const decision=adjudicateFilm({videoSha256:decoded.actualVideoSha256,decodedVisual:decoded});
  assert.equal(decision.decision,'AUTO_REVISE',JSON.stringify(decision));
  assert.ok(decision.fixes.includes('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR'));
  assert.equal(decision.blockers.length,0);
  assert.equal(decision.contentMayPublish,false);
  const mismatched=adjudicateFilm({videoSha256:'a'.repeat(64),decodedVisual:decoded});
  assert.equal(mismatched.decision,'AUTO_HOLD_INVALID_PROOF');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
