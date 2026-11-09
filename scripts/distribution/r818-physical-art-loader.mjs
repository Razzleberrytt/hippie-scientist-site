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
const actions=new Set(['evidence-boundary-panel-settles','botanical-versus-concentrate-reveal','source-bound-scaffold-assembles'])
const fail=why=>{throw Error('R8.18 pinned physical art HOLD: '+why)}

/** Return a SHA-pinned, package-relative manifest of actual art bytes.
 *  No network, no symlinks, no directory traversal, no external/paid runtime.
 *  An image's *scientific meaning* still requires a separate human review.
 */
export function stageR818PhysicalArt({artRoot,outputDir,beats}){
 if(!Array.isArray(beats))fail('canonical beat inventory missing')
 // Reject declared physical artwork on unsupported beats instead of silently
 // dropping the artist pixels while the canonical plan still claims them.
 if(beats.some(b=>b?.physicalArt!=null&&!actions.has(b.semanticAction)))
  fail('physical artwork supplied for unsupported semantic action')
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
  const roles=['botanical-versus-concentrate-reveal','source-bound-scaffold-assembles'].includes(beat.semanticAction)?['primary','target']:['primary']
  if(beat.semanticAction==='source-bound-scaffold-assembles'&&beat.physicalArt?.plate)roles.push('plate')
  const separate=beat.semanticAction==='source-bound-scaffold-assembles'&&
   (beat.physicalArt?.art||beat.physicalArt?.trust)
  if(separate){
   if(!beat.physicalArt?.art||!beat.physicalArt?.trust||beat.physicalArt?.plate)
    fail('R8.19 separate ART/TRUST is mandatory without a flat factual source plate')
   roles.push('art','trust')
  }
  if(beat.artMethod!=='cinematic-2.5d'||Object.keys(beat.physicalArt??{}).sort().join(',')!==roles.sort().join(',')||
      proof.primaryObjectId===proof.targetObjectId||
      beat.visualObject?.kind===undefined)
   fail('incorrect art method, source roles, or physical object identities')
  const destDir=path.join(out,'r818-physical-assets')
  fs.mkdirSync(destDir,{recursive:true})
  staged[beat.id]={}
  for(const role of roles){
   const ref=beat.physicalArt[role]
   const plate=role==='plate',art=role==='art',trust=role==='trust'
   const objectId=plate?'source-plate':art?'source-art':trust?'source-trust':role==='primary'?proof.primaryObjectId:proof.targetObjectId
   const kind=plate?'factual-source-plate':art?'nonfactual-art':trust?'factual-trust':role==='primary'?beat.visualObject.kind:proof.targetKind
   const label=plate?'Source-authored factual plate':art?'Nonfactual artist background':trust?'Sourced factual labels':role==='primary'?proof.beforeLabel:proof.afterLabel
   if(plate&&(!String(ref?.factualAuthority??'').trim()||
      ref.sourceClaimId!==proof.sourceClaimId||ref.r819BackgroundEligible!==false))
    fail('factual plate cannot masquerade as R8.19 nonfactual art')
   if((art&&(ref?.r819Role!=='nonfactual-art'||ref?.containsFactualText!==false))||
      (trust&&(ref?.r819Role!=='factual-trust'||!String(ref?.factualAuthority??'').trim()||
       ref?.sourceClaimId!==proof.sourceClaimId)))
    fail('R8.19 art and trust need independent roles and source authority')
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
      ((plate||art||trust||(separate&&(role==='primary'||role==='target')))?
        (bytes.readUInt32BE(16)!==1080||bytes.readUInt32BE(20)!==1920):
       (bytes.readUInt32BE(16)<64||bytes.readUInt32BE(16)>1200||
        bytes.readUInt32BE(20)<64||bytes.readUInt32BE(20)>1200))||
      bytes[25]!==6||digest(bytes)!==ref.sha256)
    fail('physical PNG is not bounded RGBA source with matching SHA')
   const stageName=beat.id+'-'+role+'.png'
   const rel='r818-physical-assets/'+stageName,absolute=path.join(destDir,stageName)
   fs.writeFileSync(absolute,bytes,{flag:'wx'})
   if(digest(fs.readFileSync(absolute))!==ref.sha256)fail('staged physical art was altered')
   const targetBox=ref.targetBox
   if(beat.semanticAction==='source-bound-scaffold-assembles'&&!plate&&!art&&!trust&&
      (!Array.isArray(targetBox)||targetBox.length!==4||targetBox.some(v=>!Number.isInteger(v))||
      targetBox[0]<0||targetBox[1]<0||targetBox[2]<64||targetBox[3]<64||
      targetBox[0]+targetBox[2]>1080||targetBox[1]+targetBox[3]>1920))
     fail('source-bound scaffold requires two bounded authored resting boxes')
   staged[beat.id][role]={file:rel,sha256:ref.sha256,objectId,kind,label,
      ...(plate?{factualAuthority:ref.factualAuthority,sourceClaimId:ref.sourceClaimId,r819BackgroundEligible:false}:{}),
      ...(art?{r819Role:'nonfactual-art',containsFactualText:false}:{}),
      ...(trust?{r819Role:'factual-trust',factualAuthority:ref.factualAuthority,sourceClaimId:ref.sourceClaimId}:{}),
      ...(beat.semanticAction==='source-bound-scaffold-assembles'&&!plate&&!art&&!trust?{targetBox}:{})}
  }
 }
 return staged
}

/** Reject new art from auto-publication until the exact native art pixels and
 * actual human science/craft review have an independently verifiable receipt.
 * This is deliberately a HOLD, not a fake approval token or publication path.
 */
export function assertNoUnreviewedR818PhysicalArt(packageDir) {
 const root=path.resolve(packageDir)
 for(const name of ['r818-original-art-review-receipt.json','r818-physical-job.json','r817-first-pass.json']){
  const file=path.join(root,name)
  if(!fs.existsSync(file))continue
  const content=JSON.parse(fs.readFileSync(file,'utf8'))
  if(name==='r818-original-art-review-receipt.json' ||
     name==='r818-physical-job.json' && content.physicalArt && Object.keys(content.physicalArt).length>0 ||
     name==='r817-first-pass.json' && content.beats?.some(b=>b?.physicalArt))
   fail('source-bound original art needs separate exact-master science/craft approval before publication')
 }
 const dir=path.join(root,'r818-physical-assets')
 if(fs.existsSync(dir)&&fs.readdirSync(dir).some(file=>file.endsWith('.png')))
  fail('staged physical artwork cannot be auto-approved for publication')
 return true
}
