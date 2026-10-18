import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import {assertNativeMobileOpeningPixels} from '../mobile-opening-native-pixels.mjs'
async function png(clutter=false){
 const width=1080,height=1920,bytes=Buffer.alloc(width*height*3,12)
 // A clean recognizable rectangular teaching object has broad geometry.
 for(let y=430;y<1050;y++)for(let x=280;x<790;x++){
  let p=(y*width+x)*3;bytes[p]=185;bytes[p+1]=190;bytes[p+2]=193
 }
 if(clutter){
  // Nine distinct dense rows of text-like fragments. This reproduces the
  // visual clutter geometry rather than claiming OCR of words.
  for(let block=0;block<10;block++)for(let yy=0;yy<20;yy++){
   const y=140+block*94+yy
   for(let x=120;x<930;x++){
    const ink=(Math.floor(x/6)%2===0)?252:16
    let p=(y*width+x)*3;bytes[p]=ink;bytes[p+1]=ink;bytes[p+2]=ink
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
