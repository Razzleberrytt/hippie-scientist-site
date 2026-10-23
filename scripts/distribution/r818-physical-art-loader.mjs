import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// The R8.18 physical renderer can now animate isolated original/Blender-exported
// transparent art, not just redraw shapes. This is a bounded native art input,
// never approval of the claim depicted by the artwork.
const digest=b=>crypto.createHash('sha256').update(b).digest('hex')
const safe=s=>/^[a-zA-Z0-9_-]{1,70}$/.test(String(s??''))
const name=s=>/^[a-zA-Z0-9_.-]{1,100}\.png$/.test(String(s??''))
const sha=s=>/^[a-f0-9]{64}$/.test(String(s??''))
const png=Buffer.from('89504e470d0a1a0a','hex')
const actions=new Set(['evidence-boundary-panel-settles','botanical-versus-concentrate-reveal'])
const fail=why=>{throw Error('R8.18 pinned physical art HOLD: '+why)}

/** Return a SHA-pinned, package-relative manifest of actual art bytes.
 *  No network, no symlinks, no directory traversal, no external/paid runtime.
 *  An image's *scientific meaning* still requires a separate human review.
 */
export function stageR818PhysicalArt({artRoot,outputDir,beats}){
 if(!Array.isArray(beats))fail('canonical beat inventory missing')
 if(!beats.some(b=>actions.has(b.semanticAction)))return {}
 if(typeof artRoot!=='string'||!artRoot)fail('explicit trusted original-art input directory required')
 const source=path.resolve(artRoot),out=path.resolve(outputDir)
 if(!fs.existsSync(source)||!fs.statSync(source).isDirectory())fail('original-art directory not found')
 const staged={},used=new Set()
 for(const beat of beats){
  if(!actions.has(beat.semanticAction))continue
  const proof=beat.telemetryProof||{}
  if(!safe(beat.id)||used.has(beat.id)||!String(proof.sourceClaimId??'').trim()||
      !Array.isArray(beat.claimIds)||!beat.claimIds.includes(proof.sourceClaimId)||
      !Array.isArray(beat.onScreenSourceIds)||!beat.onScreenSourceIds.length)
   fail('beat identity or upstream source-claim binding missing')
  used.add(beat.id)
  const roles=beat.semanticAction==='botanical-versus-concentrate-reveal'?['primary','target']:['primary']
  if(beat.artMethod!=='cinematic-2.5d'||Object.keys(beat.physicalArt??{}).sort().join(',')!==roles.sort().join(',')||
      proof.primaryObjectId===proof.targetObjectId||
      beat.visualObject?.kind===undefined)
   fail('incorrect art method, source roles, or physical object identities')
  const destDir=path.join(out,'r818-physical-assets')
  fs.mkdirSync(destDir,{recursive:true})
  staged[beat.id]={}
  for(const role of roles){
   const ref=beat.physicalArt[role]
   const objectId=role==='primary'?proof.primaryObjectId:proof.targetObjectId
   const kind=role==='primary'?beat.visualObject.kind:proof.targetKind
   const label=role==='primary'?proof.beforeLabel:proof.afterLabel
   if(!safe(objectId)||!String(kind??'').trim()||!String(label??'').trim()||
       !name(ref?.file)||!sha(ref?.sha256))fail('source-pinned named physical art object missing')
   const f=path.resolve(source,ref.file)
   if(!f.startsWith(source+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()||
       !fs.realpathSync(f).startsWith(fs.realpathSync(source)+path.sep))
    fail('illegal or missing original-art source path')
   const bytes=fs.readFileSync(f)
   // PNG RGBA only; transparency is required so the art is an isolated
   // animation object rather than an opaque full-screen poster/caption card.
   if(bytes.length<100||bytes.length>16_000_000||!bytes.subarray(0,8).equals(png)||
      bytes.readUInt32BE(16)<64||bytes.readUInt32BE(16)>1200||
      bytes.readUInt32BE(20)<64||bytes.readUInt32BE(20)>1200||
      bytes[25]!==6||digest(bytes)!==ref.sha256)
    fail('physical PNG is not bounded RGBA source with matching SHA')
   const stageName=beat.id+'-'+role+'.png'
   const rel='r818-physical-assets/'+stageName,absolute=path.join(destDir,stageName)
   fs.writeFileSync(absolute,bytes,{flag:'wx'})
   if(digest(fs.readFileSync(absolute))!==ref.sha256)fail('staged physical art was altered')
   staged[beat.id][role]={file:rel,sha256:ref.sha256,objectId,kind,label}
  }
 }
 return staged
}
