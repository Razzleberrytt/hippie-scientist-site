import test from 'node:test'
import fs from 'node:fs'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import {assertNativeMobileOpeningPixels} from '../mobile-opening-native-pixels.mjs'
async function png(clutter=false){
 const width=1080,height=1920,bytes=Buffer.alloc(width*height*3,12)
 // A clean recognizable rectangular teaching object has broad geometry.
 for(let y=430;y<1050;y++)for(let x=280;x<790;x++){
  const p=(y*width+x)*3;bytes[p]=185;bytes[p+1]=190;bytes[p+2]=193
 }
 if(clutter){
  // Nine distinct dense rows of text-like fragments. This reproduces the
  // visual clutter geometry rather than claiming OCR of words.
  for(let block=0;block<10;block++)for(let yy=0;yy<20;yy++){
   const y=140+block*94+yy
   for(let x=120;x<930;x++){
    const ink=(Math.floor(x/6)%2===0)?252:16
    const p=(y*width+x)*3;bytes[p]=ink;bytes[p+1]=ink;bytes[p+2]=ink
   }
  }
 }
 return sharp(bytes,{raw:{width,height,channels:3}}).png().toBuffer()
}
test('real decoded native 1080x1920 PNG with focused hero clears negative-only screen',async()=>{
 const b=await png()
 const x=await assertNativeMobileOpeningPixels([b,b])
 assert.equal(x.samples.length,2)
 assert.equal(x.canApproveAudienceQuality,false)
 assert.equal(x.canApprovePublication,false)
})
test('clutter on actual native pixels fails despite any otherwise clean SVG',async()=>{
 await assert.rejects(assertNativeMobileOpeningPixels([await png(true)]),/MOBILE_OPENING_HOLD:NATIVE_FRAME_EXCESSIVE_FINE_DETAIL_BANDS/)
})
test('no native frames and forged non-PNG proof both fail closed',async()=>{
 await assert.rejects(assertNativeMobileOpeningPixels([]),/ACTUAL_NATIVE_PIXEL_SAMPLES_REQUIRED/)
 await assert.rejects(assertNativeMobileOpeningPixels([Buffer.alloc(1024)]),/ACTUAL_NATIVE_FRAME_DECODE_FAILED/)
})

test('final encoded MP4 includes caption composition before mobile opening pixel screening',()=>{
 // Contract test for the integration path; the pixel-screen functional tests
 // above independently exercise real 1080x1920 PNG decoding and clutter HOLD.
 const code=fs.readFileSync(new URL('../render-vertical-video-mp4.mjs',import.meta.url),'utf8')
 const encoded=code.indexOf('const outputBytes = fs.readFileSync(output)')
 const decoded=code.indexOf('const encodedFramePattern=path.join(tempDir,')
 const screen=code.indexOf('const finalPixelGate=await assertNativeMobileOpeningPixels(',decoded)
 assert.ok(encoded>=0&&decoded>encoded&&screen>decoded,
   'decoded final-output inspection must follow H.264 encode, not just source PNG inspection')
 for(const needle of ["'-i',output,", "'-vf','fps=2'", "'-frames:v','4'"])
   assert.ok(code.slice(decoded,screen).includes(needle), 'missing final-film decode contract: '+needle)
 assert.match(code.slice(decoded,screen), /FINAL_ENCODED_CAPTION_FRAMES_MISSING/)
 assert.match(code.slice(screen), /inspectionScope:'FINAL_DECODED_MP4_AFTER_ASS_CAPTION_COMPOSITING'/)
 assert.ok(code.slice(screen).includes('exactMp4Sha256:sha256(outputBytes)'), 'final master hash binding missing')
 assert.match(code.slice(screen), /encodedMobileOpeningProof,hookPixelProof/)
})
