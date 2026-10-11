import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { verifyR811Package } from './r811-package-qa.mjs'

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const validPath = (value) => typeof value === 'string' && value.length>0 && !/^https?:/i.test(value)
export function r811HookPreviewFfmpegArgs({pngPath,outputPath,duration=3}) {
  if(!validPath(pngPath)||!validPath(outputPath)||!Number.isFinite(duration)||duration!==3)throw Error('R8.11 only supports a local, exactly three-second preview')
  return ['-hide_banner','-loglevel','error','-loop','1','-framerate','30','-i',pngPath,
    '-vf',"scale=1080:1920:flags=lanczos,zoompan=z='min(zoom+0.00018,1.045)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30",
    '-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',
    '-t','3','-movflags','+faststart','-map_metadata','-1','-y',outputPath]
}
export async function renderR811SilentHookPreviews(packageDir,{ffmpegPath=process.env.FFMPEG_PATH||'ffmpeg'}={}) {
  const dir=path.resolve(packageDir)
  const proof=verifyR811Package(dir)
  if(!proof?.oneExperiment)throw Error('R8.11 only renders previews from a fully governed experiment package')
  if (!validPath(ffmpegPath)) throw Error('R8.11 forbids hosted media transformation')
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'r811-previews-'))
  const results=[]
  try{
    for(const arm of ['a','b','c']){
      const svgFile=path.join(dir,'r811-hook-'+arm+'-preview.svg')
      const bytes=fs.readFileSync(svgFile)
      const pngFile=path.join(temporary,'hook-'+arm+'.png')
      await sharp(bytes).png({compressionLevel:9}).toFile(pngFile)
      const output=path.join(dir,'r811-hook-'+arm+'-silent-draft.mp4')
      const result=spawnSync(ffmpegPath,r811HookPreviewFfmpegArgs({pngPath:pngFile,outputPath:output}),
        {encoding:'utf8',timeout:5*60*1000,maxBuffer:1024*1024})
      if(result.status!==0)throw Error('R8.11 local FFmpeg preview failed: '+String(result.stderr||result.error||'').slice(0,350))
      const mp4=fs.readFileSync(output)
      if(!mp4.length)throw Error('R8.11 FFmpeg created an empty draft MP4')
      results.push({arm,sourceSvgSha256:sha(bytes),draftVideoSha256:sha(mp4),durationSeconds:3,
        sound:false,publishable:false,watermarkedDraft:true,
        localRendering:true,paidCredits:0,requiresNewVoiceAndMasterQa:true})
    }
    const record={schemaVersion:'ths-evidencemotion-r811-silent-preview-v1',experimentId:proof.experimentId,
      planSha256:proof.planSha256,derivativeWorkOrderSha256:proof.derivativeProof.workOrderSha256,
      videos:results,realABPublicationEvidence:false}
    const receiptPath=path.join(dir,'r811-silent-preview.receipt.json')
    fs.writeFileSync(receiptPath,JSON.stringify(record,null,2)+'\n',{flag:'wx'})
    return {receiptPath,previews:results}
  }finally{
    fs.rmSync(temporary,{recursive:true,force:true})
  }
}
