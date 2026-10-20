#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {authorR819LayerInventory} from './r819-layer-inventory-writer.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const args=process.argv.slice(2)
if(args.length!==2||args[0]!=='--package-dir'){
 console.error('Usage: node scripts/distribution/author-r819-layers-cli.mjs --package-dir /path/to/governed-package')
 process.exit(2)
}
try{
 const dir=path.resolve(args[1])
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'video-asset-manifest.json'),'utf8'))
 const m=manifest.r818NativeFrames
 if(m?.file!=='r818-native-frames.json'||!/^[a-f0-9]{64}$/.test(m.sha256))
  throw Error('R8.19 requires an already pinned R8.18 native frame manifest')
 const b=fs.readFileSync(path.join(dir,m.file))
 if(sha(b)!==m.sha256)throw Error('R8.18 native manifest changed')
 const timeline=JSON.parse(fs.readFileSync(path.join(dir,'video-timeline.json'),'utf8'))
 const seq=verifyR818NativeFrames(dir,JSON.parse(b.toString('utf8')),timeline.scenes)
 const result=authorR819LayerInventory(dir,seq)
 console.log(JSON.stringify({status:result.status,
  manifestR819LayerSequence:{file:result.file,sha256:result.sha256},
  beatCount:result.beatCount,frameCount:result.frameCount},null,2))
}catch(e){
 console.error('R8.19 inventory author refused package: '+e.message)
 process.exitCode=1
}
