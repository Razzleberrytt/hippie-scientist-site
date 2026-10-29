#!/usr/bin/env node
// Offline word alignment for R8.10. No paid/hosted fallback, no model downloads.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex')
const normalize=(v)=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,'')
const clean=(v)=>String(v??'').trim()
const read=(v)=>JSON.parse(fs.readFileSync(v,'utf8'))
const create=(file,body)=>{
  const text=JSON.stringify(body,null,2)+'\n'
  fs.writeFileSync(file,text,{flag:'wx',mode:0o444})
  return {file,sha256:sha(text)}
}
const existingFile=(p,name)=>{
  const target=path.resolve(p||'')
  if(!fs.statSync(target).isFile())throw Error('R8.10 missing local '+name)
  return target
}
export function parseMfaJson(output){
  if(!output?.tiers||typeof output.tiers!=='object')throw Error('R8.10 MFA JSON lacks tiers')
  const candidates=Object.entries(output.tiers)
    .filter(([name,tier])=>/\bwords\b/i.test(name)&&Array.isArray(tier?.entries))
  if(candidates.length!==1)throw Error('R8.10 expected one MFA words tier')
  const entries=candidates[0][1].entries
  const words=entries.filter(row=>Array.isArray(row)&&clean(row[2])).map(row=>({
    start:Number(row[0]),end:Number(row[1]),word:clean(row[2])
  }))
  if(!words.length||words.some(w=>!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.end<=w.start||w.start<0||
    ['<unk>','<eps>','spn'].includes(w.word.toLowerCase())))throw Error('R8.10 MFA has unaligned/OOV/invalid words')
  return words
}
export function assertAlignedTranscript(script,aligned){
  const scenes=script?.scenes||[]
  const expected=scenes.flatMap(scene=>clean(scene.text).split(/\s+/).filter(Boolean).map(word=>({word,scene})))
  if(expected.length!==aligned.length||!expected.length)throw Error('R8.10 MFA word count differs from exact narration transcript')
  let lastEnd=0
  for(let i=0;i<expected.length;i++){
    const actual=aligned[i],target=expected[i]
    if(normalize(actual.word)!==normalize(target.word))throw Error('R8.10 MFA transcript altered word '+i+': '+target.word)
    if(actual.start<Number(target.scene.start)-0.002||actual.end>Number(target.scene.speechEnd)+0.002||
      actual.start<lastEnd-0.002)throw Error('R8.10 MFA word outside actual scene speech bounds: '+i)
    lastEnd=actual.end
  }
  return expected
}
export function renderOfflineAlignmentDraft({packageDir,mfaBinary,expectedMfaVersion,dictionaryPath,acousticModelPath}){
  const dir=path.resolve(packageDir)
  const wav=existingFile(path.join(dir,'narration.wav'),'narration WAV')
  const manifestBytes=fs.readFileSync(path.join(dir,'video-asset-manifest.json'))
  const manifest=JSON.parse(manifestBytes)
  if(sha(fs.readFileSync(wav))!==manifest.narrationAudio?.sha256)
    throw Error('R8.10 source WAV differs from manifest-approved original audio')
  if(manifest.creativeMethodRelease!=='R8.10')throw Error('R8.10 alignment requires the actual R8.10 package')
  const scriptFile=existingFile(path.join(dir,'narration-script.json'),'narration transcript')
  const scriptBytes=fs.readFileSync(scriptFile),script=JSON.parse(scriptBytes)
  if(sha(scriptBytes)!==manifest.narrationScript?.sha256)throw Error('R8.10 narration script differs from package SHA-256')
  const dictionary=existingFile(dictionaryPath,'MFA pronunciation dictionary')
  const model=existingFile(acousticModelPath,'MFA acoustic model')
  const exe=existingFile(mfaBinary,'MFA binary')
  const version=spawnSync(exe,['--version'],{encoding:'utf8',timeout:30000})
  if(version.status!==0||!clean(expectedMfaVersion)||!String(version.stdout+version.stderr).includes(expectedMfaVersion))throw Error('R8.10 MFA version is not pinned/expected')
  const transcript=script.scenes.map(x=>clean(x.text)).filter(Boolean).join(' ')
  if(!transcript)throw Error('R8.10 cannot align an empty narration')
  const transcriptFile=path.join(dir,'r810-align-exact-script.txt')
  fs.writeFileSync(transcriptFile,transcript+'\n',{flag:'wx',mode:0o444})
  const resultFile=path.join(dir,'r810-mfa-output.json')
  const run=spawnSync(exe,['align_one','--output_format','json','--no_tokenization',
    wav,transcriptFile,dictionary,model,resultFile],{encoding:'utf8',timeout:30*60*1000,maxBuffer:1024*1024})
  if(run.status!==0||!fs.existsSync(resultFile))throw Error('R8.10 offline MFA alignment failed: '+clean(run.stderr).slice(0,300))
  const raw=fs.readFileSync(resultFile)
  const aligned=parseMfaJson(JSON.parse(raw.toString('utf8')))
  const expected=assertAlignedTranscript(script,aligned)
  const words=expected.map((x,i)=>({word:x.word,start:aligned[i].start,end:aligned[i].end}))
  const draft={
    schemaVersion:'ths-r810-local-word-alignment-v1',engine:'mfa-offline',
    timingSource:'acoustic-forced-alignment',wordLevelAccuracyClaimed:false,
    audioSha256:sha(fs.readFileSync(wav)),scriptSha256:sha(scriptBytes),
    acousticModelSha256:sha(fs.readFileSync(model)),dictionarySha256:sha(fs.readFileSync(dictionary)),
    alignerCodeSha256:sha(fs.readFileSync(new URL(import.meta.url))),
    mfaVersion:clean(expectedMfaVersion),rawAlignmentSha256:sha(raw),wordCount:words.length,
    words,meteredCreditsRequired:false,accountRequired:false,
    humanAuditoryReview:null,releaseStatus:'awaiting-human-review',
  }
  return create(path.join(dir,'word-alignment.draft.json'),draft)
}
// Candidate MFA output cannot attest independently verified human review.
// Only an authenticated, auditable reviewer controller may ever issue that receipt.
export function approveOfflineAlignment() {
  throw Error('R8.10 local approval disabled: require authenticated independent reviewer workflow')
}
function parseArgs(argv){
  const [command,...rest]=argv,args={}
  for(let i=0;i<rest.length;i+=2){if(!rest[i]?.startsWith('--')||!rest[i+1])throw Error('R8.10 alignment expects --field value');args[rest[i].slice(2)]=rest[i+1]}
  return {command,args}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{
    const {command,args}=parseArgs(process.argv.slice(2))
    const result=command==='align'?renderOfflineAlignmentDraft({
      packageDir:args.package,mfaBinary:args.mfa,expectedMfaVersion:args.version,
      dictionaryPath:args.dictionary,acousticModelPath:args.model
    }):command==='approve'?approveOfflineAlignment({
      packageDir:args.package,reviewerId:args.reviewer,reviewedAt:args.reviewedAt,
      observedExactAudioSha256:args.audioSha256
    }):(()=>{throw Error('Usage: align --package DIR --mfa PATH --version PIN --dictionary PATH --model PATH; or approve --package DIR --reviewer ID --reviewedAt ISO --audioSha256 ACTUAL_SHA')})()
    console.log(JSON.stringify(result,null,2))
  }catch(e){console.error('R8.10 alignment FAIL: '+e.message);process.exitCode=1}
}
