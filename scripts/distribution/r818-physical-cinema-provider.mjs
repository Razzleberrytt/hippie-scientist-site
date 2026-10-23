import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {stageR818PhysicalArt} from './r818-physical-art-loader.mjs'
const sha=x=>crypto.createHash('sha256').update(x).digest('hex')
const MODULE=new URL('./r818-physical-cinema.py',import.meta.url)
// Use a single native renderer to create both actual pixels and true projected
// object telemetry; neither receipt is reconstructed from a storyboard.
export function createR818PhysicalCinemaProvider({
 pythonExecutable='python3',scriptFile=null,artRoot=null,timeoutMs=20*60*1000
}={}){
 const script=path.resolve(scriptFile||MODULE.pathname)
 if(!fs.existsSync(script))throw Error('R8.18 VTK/Pillow physical producer missing')
 const sourceCodeSha256=sha(fs.readFileSync(script))
 let completedPackageDir=null
 return {
  sourceCodeSha256,
  nativeFrameRenderer({outputDir,scenes,assets,canonicalFirstPassPlan,rendererCodeSha256,sourceUrl,sourceContentHash}){
   if(!Array.isArray(canonicalFirstPassPlan?.beats)||!Array.isArray(scenes)||
      !Array.isArray(assets)||scenes.length!==canonicalFirstPassPlan.beats.length||
      scenes.length!==assets.length)
     throw Error('R8.18 physical rendering needs exact approved beat inventory')
   for(const b of canonicalFirstPassPlan.beats){
    if(b.artMethod==='rendered-3d'&&b.visualObject?.assetSha256!==sourceCodeSha256)
      throw Error('R8.18 approved 3D geometry asset SHA differs from executing Python source')
   }
   // Source-verified, locally staged original cutouts go to the SAME physical producer
   // as VTK/Pillow scenes. No invented motion receipts or SVG substitutions.
   const physicalArt=stageR818PhysicalArt({artRoot,outputDir,beats:canonicalFirstPassPlan.beats})
   const physicalArtManifestSha256=sha(JSON.stringify(physicalArt))
   const job={
    outputDir,scenes,plan:canonicalFirstPassPlan,rendererCodeSha256,
    physicalArt,physicalArtManifestSha256,
    renderedSceneAssetsSha256:sha(assets.map(x=>x.sha256).join('|')),
    sourceManifestSha256:sha(JSON.stringify({sourceUrl,sourceContentHash})),
    physicalRendererSha256:sourceCodeSha256
   }
   const jobPath=path.join(outputDir,'r818-physical-job.json')
   fs.writeFileSync(jobPath,JSON.stringify(job,null,2)+'\n',{flag:'wx'})
   const result=spawnSync(pythonExecutable,[script,'--job',jobPath],{
      encoding:'utf8',timeout:timeoutMs,maxBuffer:2000000
   })
   if(result.status!==0)throw Error('R8.18 native physical renderer failed; no SVG substitution allowed: '+
      String(result.stderr||result.error||'').slice(-2000))
   for(const file of ['r818-native-frames.json','r818-telemetry.json'])
     if(!fs.existsSync(path.join(outputDir,file)))
       throw Error('R8.18 physical producer omitted required '+file)
   completedPackageDir=outputDir
   return {path:path.join(outputDir,'r818-native-frames.json'),
     sourceCodeSha256,stdout:String(result.stdout||'').trim()}
  },
  rendererGeometryRecorder({outputDir,rendererCodeSha256,renderedSceneAssetsSha256,sourceManifestSha256}){
   if(!completedPackageDir||completedPackageDir!==outputDir)
     throw Error('R8.18 geometry recorder cannot be called without same-pass physical PNG frames')
   const file=path.join(outputDir,'r818-telemetry.json'),t=JSON.parse(fs.readFileSync(file,'utf8'))
   const job=JSON.parse(fs.readFileSync(path.join(outputDir,'r818-physical-job.json'),'utf8'))
   if(t.physicalArtManifestSha256!==job.physicalArtManifestSha256||
      sha(JSON.stringify(job.physicalArt))!==job.physicalArtManifestSha256)
     throw Error('R8.18 physical source-art provenance differs from same-pass rendering job')
   if(t.rendererCodeSha256!==rendererCodeSha256||
      t.renderedSceneAssetsSha256!==renderedSceneAssetsSha256||
      t.sourceManifestSha256!==sourceManifestSha256)
      throw Error('R8.18 physical telemetry differs from actual rendering request')
   return {path:file,sourceCodeSha256}
  }
 }
}
