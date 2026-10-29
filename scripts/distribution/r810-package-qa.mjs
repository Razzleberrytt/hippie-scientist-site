import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { verifyR811Package } from './r811-package-qa.mjs'
import { parseMfaJson } from './r810-local-aligner.mjs'
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex')
const norm = (s) => String(s ?? '').trim().replace(/\s+/g,' ')
const wordTokens = (s) => (String(s ?? '').toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[])
function readBound(dir,file,label,expectedSha){
  if(!/^[a-z0-9._-]+$/i.test(String(file||''))||file==='..')throw Error('R8.10 unsafe '+label+' filename')
  const b=fs.readFileSync(path.join(dir,file))
  if(sha(b)!==expectedSha)throw Error('R8.10 '+label+' hash mismatch')
  return b
}
export function verifyR810WordAlignment(packageDir) {
  const dir=path.resolve(packageDir)
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'video-asset-manifest.json'),'utf8'))
  if(manifest.creativeMethodRelease!=='R8.10')throw Error('R8.10 word alignment only accepts R8.10 packages')
  // A local file and reviewerId cannot prove an authenticated independent review.
  // Keep candidate timing/QA usable but make RELEASE fail closed until a trusted issuer exists.
  const alignmentFile=path.join(dir,'word-alignment.receipt.json')
  if(!fs.existsSync(alignmentFile))throw Error('R8.10 production requires local evidence-backed word alignment; phrase estimates are draft-only')
  const receipt=JSON.parse(fs.readFileSync(alignmentFile,'utf8'))
  const wav=fs.readFileSync(path.join(dir,'narration.wav'))
  const scriptBytes=readBound(dir,manifest.narrationScript?.file,'narration-script',manifest.narrationScript?.sha256)
  const script=JSON.parse(scriptBytes.toString('utf8'))
  const raw=fs.readFileSync(path.join(dir,'r810-mfa-output.json'))
  const sourceWords=parseMfaJson(JSON.parse(raw.toString('utf8')))
  const localAlignerHash=sha(fs.readFileSync(new URL('./r810-local-aligner.mjs',import.meta.url)))
  if(receipt.rawAlignmentSha256!==sha(raw)
    ||receipt.alignerCodeSha256!==localAlignerHash
    ||sourceWords.length!==receipt.words?.length
    ||sourceWords.some((w,i)=>w.word.toLowerCase().replace(/[^a-z0-9]/g,'')!==String(receipt.words[i]?.word||'').toLowerCase().replace(/[^a-z0-9]/g,'')
      ||Math.abs(w.start-receipt.words[i].start)>0.002
      ||Math.abs(w.end-receipt.words[i].end)>0.002)){
    throw Error('R8.10 local acoustic-alignment receipt diverges from original MFA output or pinned producer')
  }
  const looksLikeSha=(x)=>/^[a-f0-9]{64}$/i.test(String(x||''))
  if(receipt.schemaVersion!=='ths-r810-local-word-alignment-v1'||receipt.engine!=='mfa-offline'
    ||receipt.timingSource!=='acoustic-forced-alignment'||receipt.wordLevelAccuracyClaimed!==true
    ||receipt.audioSha256!==sha(wav)||receipt.scriptSha256!==sha(scriptBytes)
    ||!looksLikeSha(receipt.acousticModelSha256)||!looksLikeSha(receipt.dictionarySha256)
    ||!looksLikeSha(receipt.alignerCodeSha256)||receipt.meteredCreditsRequired!==false
    ||receipt.accountRequired!==false)throw Error('R8.10 word alignment has no valid offline model/script/WAV provenance')
  const words=Array.isArray(receipt.words)?receipt.words:[]
  const expected=script.scenes.flatMap(scene=>norm(scene.text).split(' ').filter(Boolean).map(word=>({word,scene})))
  if(words.length!==expected.length||!words.length)throw Error('R8.10 word alignment does not cover every spoken token')
  let lastEnd=0
  for(let i=0;i<words.length;i++){
    const entry=words[i], target=expected[i]
    if(wordTokens(entry?.word).join('')!==wordTokens(target.word).join(''))throw Error('R8.10 word transcript diverged at token '+i)
    const start=Number(entry.start),end=Number(entry.end),sceneStart=Number(target.scene.start),speechEnd=Number(target.scene.speechEnd)
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<lastEnd-0.002||end<=start
      ||start<sceneStart-0.002||end>speechEnd+0.002)throw Error('R8.10 word timing violates exact spoken-audio bounds at token '+i)
    lastEnd=end
  }
  if(receipt.humanAuditoryReview?.status!=='pass'||!norm(receipt.humanAuditoryReview?.reviewerId)
    ||receipt.humanAuditoryReview?.exactAudioSha256!==sha(wav))throw Error('R8.10 alignment needs independent exact-audio auditory QA')
  throw Error('R8.10 publication HOLD: no authenticated independent reviewer authority for word-alignment approval receipts')
}
const escapeXml=(value)=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[x]))
export function verifyR810PackageGate(packageDir,{now=new Date(),requireAlignment=false}={}){
  const dir=path.resolve(packageDir)
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'video-asset-manifest.json'),'utf8'))
  if(manifest.creativeMethodRelease!=='R8.10'||manifest.creativeR810?.status!=='approved')throw Error('R8.10 governed package approval missing')
  const ledger=readBound(dir,manifest.sourceLedger?.file,'source-ledger',manifest.sourceLedger?.sha256).toString('utf8')
  const expected=(manifest.creativeR810?.sourceLedgerLines||[]).join('\n')
  if(ledger!==expected||sha(ledger)!==manifest.creativeR810?.sourceLedgerTextSha256)throw Error('R8.10 ledger text is not identical to approved source notes')
  const assets=Array.isArray(manifest.assets)?manifest.assets:[]
  const source=assets.filter(a=>a.role==='source')
  if(source.length!==1||source[0].spoken!==false||Number(source[0].duration)<3)throw Error('R8.10 source ledger must be silent and readable for at least three seconds')
  const sourceSvg=readBound(dir,source[0].file,'source-scene',source[0].sha256).toString('utf8')
  for(const [i,line] of manifest.creativeR810.sourceLedgerLines.entries()){
    if(!sourceSvg.includes('data-r810-ledger-line="'+(i+1)+'"')||!sourceSvg.includes(escapeXml(line)))throw Error('R8.10 approved citation absent from actual source-card SVG')
  }
  if(!sourceSvg.includes('font-size="32"'))throw Error('R8.10 ledger lacks minimum source font size')
  const banned=['generic molecule icon','lorem ipsum','placeholder graphic','debug caption','insert citation here','todo: replace']
  for(const asset of assets){
    const svg=readBound(dir,asset.file,'video-scene',asset.sha256).toString('utf8')
    if(banned.some(word=>svg.toLowerCase().includes(word)))throw Error('R8.10 banned placeholder rendered in '+asset.file)
  }
  for(const a of manifest.creativeR810.claimAttestations||[]){
    const verified=Date.parse(String(a.claimVerifiedAt)+'T23:59:59Z')
    const current=Number(new Date(now))
    if(!Number.isFinite(verified)||!Number.isFinite(current)||current-verified>Number(a.maxAgeDays)*86400000||verified-current>86400000)throw Error('R8.10 stale legal/safety claim at publication staging')
  }
  const alignment=requireAlignment?verifyR810WordAlignment(dir):null
  const r811 = manifest.productionSystemRelease === 'R8.11' ? verifyR811Package(dir,{ manifest }) : null
  return {ledgerSha256:sha(ledger),sceneCount:assets.length,alignment,r811}
}
