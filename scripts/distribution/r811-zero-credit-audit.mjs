#!/usr/bin/env node
// Fail-closed, first-party guard for the R8.11 local generation critical path.
// Does not replace dependency auditing or the existing publishing/science gates.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const names = [
  'r811-creative-operations.mjs','r811-derived-assets.mjs','r811-asset-library.mjs',
  'r811-package-qa.mjs','r811-learning-operations.mjs','r811-template-lineage.mjs',
  'r811-operations-cli.mjs','r811-hook-preview-mp4.mjs',
]
export function inspectR811GenerationSource(file,content){
  const errors=[]
  const imported=[...content.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(match=>match[1])
  const allow=new Set(['sharp'])
  for(const dependency of imported){
    if(!dependency.startsWith('./')&&!dependency.startsWith('node:')&&!allow.has(dependency)){
      errors.push(file+' imports an unapproved, potentially metered generation package: '+dependency)
    }
  }
  const forbidden=[
    [/\bfetch\s*\(/,'network fetch'],
    [/https?\.request\s*\(/,'HTTP provider request'],
    [/process\.env\.(?:OPENAI|ELEVENLABS|FAL|MIDJOURNEY|HIGGSFIELD|ANTHROPIC|TIKTOK|META)_?[A-Z_]*/i,'provider API credential'],
    [/\b(?:axios|got|undici)\s*\(/,'network client'],
    [/child_process\.exec\s*\(/,'unbounded shell execution'],
  ]
  for(const [regex,reason] of forbidden) if(regex.test(content))errors.push(file+' includes forbidden '+reason)
  return errors
}
export function auditR811ZeroCredits(directory=root){
  const issues=[]
  for(const name of names){
    const file=path.join(directory,name)
    if(!fs.existsSync(file))issues.push('Missing audited R8.11 generation module: '+name)
    else issues.push(...inspectR811GenerationSource(name,fs.readFileSync(file,'utf8')))
  }
  if(issues.length)throw Error('R8.11 zero-credit build gate failed:\n- '+issues.join('\n- '))
  return {passed:true,filesAudited:names.length,
    policy:'No provider generation imports or network calls. Sharp, FFmpeg, and local files only.',
    scope:'R8.11 first-party generation entrypoints; complementary to inherited site build/security gates'}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{console.log(JSON.stringify(auditR811ZeroCredits(),null,2))}
  catch(e){console.error(e.message);process.exitCode=1}
}
