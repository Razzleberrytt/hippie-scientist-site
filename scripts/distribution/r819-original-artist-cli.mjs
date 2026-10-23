#!/usr/bin/env node
// Exact R8.19 independent original-artist input handoff. Never publishes.
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {authorR819OriginalArtistPixelProof} from './r819-original-artist-pixel-proof.mjs'
function args(argv){
 const found={}
 for(let i=0;i<argv.length;i+=2){
  const key=argv[i]
  if(!['--package-dir','--source-ledger','--native-frames','--plan'].includes(key)||
     !argv[i+1]||argv[i+1].startsWith('--'))throw Error('R8.19 CLI unknown/incomplete argument: '+key)
  if(found[key])throw Error('R8.19 CLI repeated argument '+key)
  found[key]=argv[i+1]
 }
 for(const key of ['--package-dir','--source-ledger','--native-frames','--plan'])
  if(!found[key])throw Error('R8.19 CLI missing '+key)
 return found
}
export async function runR819OriginalArtistCli(argv){
 const a=args(argv),root=path.resolve(a['--package-dir'])
 const pick=(key)=>{
  const file=path.resolve(root,a[key])
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||
      !fs.statSync(file).isFile()||!fs.realpathSync(file).startsWith(root+path.sep))
   throw Error('R8.19 CLI JSON file escapes or is missing: '+key)
  return JSON.parse(fs.readFileSync(file,'utf8'))
 }
 return authorR819OriginalArtistPixelProof(root,{
  source:pick('--source-ledger'),nativeSequence:pick('--native-frames'),plan:pick('--plan')
 })
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 runR819OriginalArtistCli(process.argv.slice(2)).then(r=>{
  console.log(JSON.stringify(r,null,2))
 }).catch(e=>{console.error(e.message);process.exitCode=1})
}
