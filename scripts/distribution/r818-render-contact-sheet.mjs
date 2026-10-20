import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'
import sharp from 'sharp'
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
export function r818ReviewFrameTimes(beats){
 if(!Array.isArray(beats)||!beats.length||beats.length>20)
  throw Error('R8.18 review sheet requires 1-20 purpose-built video beats')
 const frames=[]
 for(const b of beats){
  if(!String(b.id||b.beatId||'').trim()||!(Number.isFinite(b.start)&&Number.isFinite(b.end))||
     b.end-b.start<.45)throw Error('R8.18 contact sheet beat identity/timing invalid')
  const delta=b.end-b.start
  for(const [phase,t] of [['start',b.start+.12],['mid',(b.start+b.end)/2],['end',b.end-.12]])
   frames.push({beatId:String(b.id||b.beatId),phase,seconds:Number(t.toFixed(3))})
 }
 return frames
}
function decodeFrame(ffmpegPath,mp4,seconds){
 const p=spawnSync(ffmpegPath,['-hide_banner','-v','error','-ss',String(seconds),
   '-i',mp4,'-frames:v','1','-f','image2pipe','-vcodec','png','-'],
   {encoding:null,timeout:60000,maxBuffer:12000000})
 if(p.status!==0||!Buffer.isBuffer(p.stdout)||p.stdout.length<512)
  throw Error('R8.18 decoded contact-sheet MP4 frame missing at '+seconds)
 return p.stdout
}
export async function renderR818ContactSheet({masterMp4,beats,outputDir,ffmpegPath='ffmpeg',frameDecoder=decodeFrame}){
 if(!fs.existsSync(masterMp4)||!outputDir)throw Error('R8.18 contact sheet requires existing exact master MP4 and outputDir')
 const master=fs.readFileSync(masterMp4),masterSha256=sha(master)
 const times=r818ReviewFrameTimes(beats)
 fs.mkdirSync(outputDir,{recursive:true})
 const w=240,h=427,pad=12,footer=42,cols=3,rows=beats.length
 const cells=[],receipts=[]
 for(let i=0;i<times.length;i++){
  const t=times[i],raw=await frameDecoder(ffmpegPath,masterMp4,t.seconds)
  const meta=await sharp(raw).metadata()
  if(meta.width!==1080||meta.height!==1920)
   throw Error('R8.18 contact sheet source is not native 1080x1920')
  const thumb=await sharp(raw).resize(w,h,{fit:'fill'}).png().toBuffer()
  const x=(i%cols)*(w+pad)+pad,y=Math.floor(i/cols)*(h+footer+pad)+pad
  cells.push({input:thumb,left:x,top:y})
  receipts.push({...t,frameSha256:sha(raw),thumbnailSha256:sha(thumb)})
 }
 const canvasW=cols*(w+pad)+pad,canvasH=rows*(h+footer+pad)+pad
 const sheet=await sharp({create:{width:canvasW,height:canvasH,channels:3,
   background:{r:10,g:19,b:30}}}).composite(cells).png().toBuffer()
 const sheetFile=path.join(outputDir,'r818-exact-master-contact-sheet.png')
 fs.writeFileSync(sheetFile,sheet)
 const proof={schemaVersion:'ths-r818-exact-master-contact-sheet-v1',
   sourceMp4Sha256:masterSha256,sourceVideoWidth:1080,sourceVideoHeight:1920,
   contactSheetFile:path.basename(sheetFile),contactSheetSha256:sha(sheet),
   samples:receipts,allBeatsThreeFrames:receipts.length===beats.length*3,
   reviewerJudgment:'PENDING_INDEPENDENT_HUMAN_VISUAL_REVIEW',pixelSemanticsCertified:false}
 const receiptPath=path.join(outputDir,'r818-contact-sheet-receipt.json')
 fs.writeFileSync(receiptPath,JSON.stringify(proof,null,2)+'\n')
 return {sheetFile,receiptPath,proof}
}
