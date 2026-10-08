import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateSnapshot,freeze} from './rolling-coordinator.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export function audit({baseline,reservations,openPrs,expectedHeads}){
 if(!Array.isArray(baseline)||!Array.isArray(reservations)||!Array.isArray(openPrs))throw Error('missing complete inputs');
 if(openPrs.some(p=>!p.number||!p.head_sha||!Array.isArray(p.records)))throw Error('incomplete PR inventory');
 for(const p of openPrs)if(expectedHeads[String(p.number)]!==p.head_sha)throw Error('stale PR head '+p.number);
 const s={baseline:[...baseline,...openPrs.flatMap(p=>p.records.map(r=>({...r,batch:'PR-'+p.number})))],reservations};
 validateSnapshot(s);
 return {baseline:baseline.length,open_prs:openPrs.length,reserved:reservations.length,sha256:crypto.createHash('sha256').update(JSON.stringify(s)).digest('hex')};
}
if(process.argv[1]?.endsWith('rolling-gate.mjs')){
 try{
 const [cmd,input,out]=process.argv.slice(2);const x=read(input);
 if(cmd==='audit'){const result=audit(x);if(out)fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result))}
 else if(cmd==='freeze'){const result=freeze({baseline:x.baseline,reservations:x.reservations},x.batch);fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log('FROZEN '+x.batch)}
 else throw Error('unknown command');
 }catch(e){console.error('BLOCKED '+e.message);process.exitCode=1}
}
