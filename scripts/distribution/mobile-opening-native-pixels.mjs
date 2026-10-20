/**
 * Negative-only opening clutter screen on bytes actually fed to the MP4 encoder.
 *
 * SVG semantic-role lint cannot prove that the separate R8.18/R8.19 PNG source
 * contains the same opening. Decode the final composited native frames instead.
 * Horizontal fine-detail bands are only a conservative clutter risk heuristic;
 * no OCR, legibility, spoken-claim check or creative/publishing approval implied.
 */
import crypto from 'node:crypto'
import sharp from 'sharp'
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex')

export async function assertNativeMobileOpeningPixels(samples){
 if(!Array.isArray(samples)||!samples.length||samples.length>5||
   samples.some(x=>!Buffer.isBuffer(x)||x.length<100))
   throw Error('MOBILE_OPENING_HOLD:ACTUAL_NATIVE_PIXEL_SAMPLES_REQUIRED')
 const reports=[]
 for(const png of samples){
  let decoded
  try{
   const {data,info}=await sharp(png,{failOn:'error'})
    .resize(216,384,{fit:'fill',kernel:'lanczos3'}).grayscale().raw()
    .toBuffer({resolveWithObject:true})
   const metadata=await sharp(png).metadata()
   if(metadata.format!=='png'||metadata.width!==1080||metadata.height!==1920||
     info.width!==216||info.height!==384||info.channels!==1)
     throw Error('wrong native pixel dimensions')
   decoded=data
  }catch{
   throw Error('MOBILE_OPENING_HOLD:ACTUAL_NATIVE_FRAME_DECODE_FAILED')
  }
  let bands=0,inBand=false,rows=0,highest=0
  for(let y=20;y<265;y++){
   let transitions=0,bright=0
   for(let x=25;x<191;x++){
    const a=decoded[y*216+x],b=decoded[y*216+x+1]
    if(Math.abs(a-b)>65)transitions++
    if(a>215)bright++
   }
   // Fine-detail horizontal copy-like ink, not a broad hero silhouette.
   const active=transitions>=28&&bright>=5&&bright<=160
   if(active){rows++;if(!inBand){inBand=true;bands++}}
   else inBand=false
   highest=Math.max(highest,transitions)
  }
  const finding={nativePngSha256:sha(png),fineDetailBands:bands,
   fineDetailRows:rows,peakHorizontalTransitions:highest,
   possibleClutter:bands>=9&&rows>=22}
  reports.push(finding)
  if(finding.possibleClutter)
   throw Error('MOBILE_OPENING_HOLD:NATIVE_FRAME_EXCESSIVE_FINE_DETAIL_BANDS')
 }
 return {status:'ACTUAL_COMPOSITED_NATIVE_FRAME_NEGATIVE_SCREEN_ONLY',
  samples:reports,canApproveAudienceQuality:false,canApprovePublication:false,
  limitations:'Pixel-band clutter heuristic, not text recognition, comprehension or complete artistic inspection'}
}
