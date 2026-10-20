import { Buffer } from 'node:buffer';
/** Research-only: read and verify actual SHA-locked PNG source plates.
 * Does not render, install a model, alter production or approve visual quality.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const isHex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const PNG_SIGNATURE=Buffer.from('89504e470d0a1a0a','hex');
export function verifyLockedArt({root,reference,shots}={}){
  const errors=[],proof=[];
  if(typeof root!=='string'||!root.trim()||!reference||!Array.isArray(reference.layers)||
      !Array.isArray(shots)||!shots.length)
    return {status:'HOLD',errors:['INVALID_SOURCE_INVENTORY'],productionEligible:false};
  const absRoot=fs.realpathSync(path.resolve(root));
  const layers=reference.layers;
  const ids=new Set();
  for(const layer of layers){
    if(!layer||typeof layer.file!=='string'||!layer.file||typeof layer.id!=='string'||
       ids.has(layer.id)||!isHex(layer.sha256)||!['background','mid','foreground'].includes(layer.depthClass)){
       errors.push('MALFORMED_LAYER');continue;
    }
    ids.add(layer.id);
    try{
      const full=fs.realpathSync(path.resolve(absRoot,layer.file));
      if(!full.startsWith(absRoot+path.sep))throw Error('escape');
      const stat=fs.statSync(full);
      if(!stat.isFile()||stat.size<33||stat.size>25*1024*1024)throw Error('bad-size');
      const buf=fs.readFileSync(full);
      if(!buf.subarray(0,8).equals(PNG_SIGNATURE)||buf.toString('ascii',12,16)!=='IHDR')
        throw Error('not-png');
      const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20);
      if(!width||!height||width>4096||height>4096)throw Error('bad-dimensions');
      const actual=hash(buf);
      if(actual!==layer.sha256)throw Error('hash-mismatch');
      proof.push({id:layer.id,depthClass:layer.depthClass,sha256:actual,width,height,bytes:buf.length});
    }catch{errors.push('SOURCE_PIXELS_NOT_VERIFIED:'+layer.id)}
  }
  if(!proof.some(x=>x.depthClass==='background')||!proof.some(x=>x.depthClass==='foreground'))
    errors.push('MISSING_DEPTH_PLANES');
  if(proof.length!==layers.length||new Set(proof.map(x=>x.width+'x'+x.height)).size!==1)
    errors.push('LAYER_DIMENSIONS_OR_FILES_INVALID');
  // Identity uses authored order; reordering a source layer changes visual meaning.
  const combined=hash(Buffer.from(layers.map(x=>x.sha256).join('|'),'utf8'));
  if(!isHex(reference.pixelSha256)||reference.pixelSha256!==combined)
    errors.push('REFERENCE_IDENTITY_MISMATCH');
  for(const s of shots){
    if(!s||s.referencePixelSha256!==combined||s.regenerateLook===true)
      errors.push('SHOT_REFERENCE_DRIFT');
  }
  return {status:errors.length?'HOLD':'BYTES_LOCKED_READY_FOR_HUMAN_LOOK_REVIEW',
    errors:[...new Set(errors)],referencePixelSha256:combined,sourceLayers:proof,
    productionEligible:false,excellentCertified:false,
    caveat:'PNG hashes and IHDR verified, not decoded alpha edges, inpainted background quality, or compositional beauty'};
}
