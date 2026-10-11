#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateR811Plan, buildR811Receipt } from './r811-creative-operations.mjs'
import { buildR811DraftAssets } from './r811-derived-assets.mjs'
import { verifyR811Package } from './r811-package-qa.mjs'
import { registerR811Asset, r811AssetReuseReport } from './r811-asset-library.mjs'
import { renderVerticalVideoSceneSvg } from './render-vertical-video-package.mjs'
import { analyzeR811HookExperiment, snapshotR811Experiment, approveR811HookPattern, getR811CadenceReport } from './r811-learning-operations.mjs'
import { registerR811ComponentVersion, getR811ComponentLineage } from './r811-template-lineage.mjs'

const defaultRoot = 'ops/evidencemotion/flywheel'
const help = [
'EvidenceMotion R8.11 — manual-first, local-only compounding operations',
'  preflight --input PLAN.json --r810 RECEIPT.json',
'  previews --input PLAN.json --r810 RECEIPT.json --hook SCENE.json --package OUTPUT_DIR --source-url URL --source-hash CONTENT_HASH --disclosure TEXT',
'  inspect-package --package PACKAGE_DIR',
'  catalog-asset --input ASSET_METADATA.json --file SELF_CONTAINED.svg [--asset-root DIR]',
'  assets [--asset-root DIR]',
'  compare-hooks --experiment EXPERIMENT_ID [--window first-7d] [--metric three-second-hold]',
'  snapshot-hooks --experiment EXPERIMENT_ID [--window first-7d] [--metric three-second-hold]',
'  approve-hook --input REVIEW.json',
'  component-version --input COMPONENT.json',
'  component-lineage --kind hook|beat-skeleton|caption-style|actor-style',
'  cadence [--days 7] [--target 2]',
'All register/posting/stats remain manual; R8.11 never spends credits, publishes, changes claims or silently chooses a winner.',
].join('\n')
function parseArgs(argv){
  const [action,...tokens]=argv,args={}
  if (!action || action==='help'||action==='--help') return {action:'help',args}
  if(tokens.length%2)throw Error('Each argument requires a --field value')
  for(let i=0;i<tokens.length;i+=2){
    if(!tokens[i].startsWith('--')||!tokens[i+1]||tokens[i+1].startsWith('--'))throw Error('Use --field value arguments')
    args[tokens[i].slice(2)]=tokens[i+1]
  }
  return {action,args}
}
const fromJson=(p)=>JSON.parse(fs.readFileSync(path.resolve(p),'utf8'))
export function runR811CLI(argv){
  const {action,args}=parseArgs(argv)
  if(action==='help')return help
  const root=path.resolve(args.root||defaultRoot)
  const assetRoot=path.resolve(args['asset-root']||'ops/evidencemotion/assets')
  const input=()=>{if(!args.input)throw Error('--input JSON file required');return fromJson(args.input)}
  const options={experimentId:args.experiment,metricWindow:args.window||'first-7d',primaryMetric:args.metric||'three-second-hold'}
  switch(action){
    case 'preflight':{
      if(!args.r810)throw Error('--r810 approved creative receipt required')
      const plan=input(),science=fromJson(args.r810),errors=validateR811Plan(plan,{creativeR810:science})
      if(errors.length)throw Error('R8.11 preflight rejected: '+errors.join('; '))
      return JSON.stringify(buildR811Receipt(plan,{creativeR810:science}),null,2)
    }
    case 'previews':{
      if(!args.r810||!args.hook||!args.package||!args['source-url']||!args['source-hash']||!args.disclosure){
        throw Error('R8.11 previews require approved science, actual narrated hook scene, package dir and source')
      }
      return JSON.stringify(buildR811DraftAssets({
        packageDir:args.package,plan:input(),creativeR810:fromJson(args.r810),
        firstHookScene:fromJson(args.hook),renderScene:renderVerticalVideoSceneSvg,
        sourceUrl:args['source-url'],contentHash:args['source-hash'],disclosure:args.disclosure,
      }),null,2)
    }
    case 'inspect-package':{
      if(!args.package)throw Error('--package DIR required')
      return JSON.stringify(verifyR811Package(args.package),null,2)
    }
    case 'catalog-asset':{
      if(!args.file)throw Error('--file SVG required')
      return JSON.stringify(registerR811Asset(assetRoot,{...input(),content:fs.readFileSync(path.resolve(args.file),'utf8')}),null,2)
    }
    case 'assets':return JSON.stringify(r811AssetReuseReport(assetRoot),null,2)
    case 'compare-hooks':return JSON.stringify(analyzeR811HookExperiment(root,options),null,2)
    case 'snapshot-hooks':return JSON.stringify(snapshotR811Experiment(root,root,options),null,2)
    case 'approve-hook':return JSON.stringify(approveR811HookPattern(root,root,input()),null,2)
    case 'component-version':return JSON.stringify(registerR811ComponentVersion(root,input()),null,2)
    case 'component-lineage':return JSON.stringify(getR811ComponentLineage(root,args.kind),null,2)
    case 'cadence':return getR811CadenceReport(root,{days:args.days?Number(args.days):7,
      targetVideosPerDay:args.target?Number(args.target):2}).markdown
    default:throw Error('R8.11 unknown command: '+action+'\n'+help)
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{console.log(runR811CLI(process.argv.slice(2)))}
  catch(error){console.error('R8.11 FAIL: '+error.message);process.exitCode=1}
}
