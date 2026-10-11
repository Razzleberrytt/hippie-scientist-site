#!/usr/bin/env node
// Manual-first EvidenceMotion Flywheel: no platform credentials or autopublishing.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { registerFlywheelVideo, registerFlywheelFromPackage, appendFlywheelObservation, persistFlywheelHookPatterns, flywheelInsights,
  renderFlywheelLearningReport, proposeFlywheelTemplate,
  approveFlywheelTemplate, versionFlywheelTemplate
} from './evidencemotion-flywheel.mjs'

const help = [
'EvidenceMotion Flywheel — local append-only learning',
'Commands:',
'  register --input VIDEO.json [--root DIR]',
'  register --input VIDEO.json --package R8.10_PACKAGE_DIR [--root DIR]',
'  observe --input METRICS.json [--root DIR]',
'  hooks [--window first-7d] [--root DIR]',
'  topics [--window first-7d] [--root DIR]',
'  report [--window first-7d] [--last 10] [--root DIR]',
'  propose --input PROPOSAL.json [--root DIR]',
'  approve --input APPROVAL.json [--root DIR]',
'  version --proposal PROPOSAL_ID [--root DIR]',
'Manual data does not count as provider-verified; Unknown remains null.',
'No command authorizes publication or science changes.'
].join('\n')
function args(argv){
  const result={}
  for(let i=0;i<argv.length;i++){
    const token=argv[i]
    if(!token.startsWith('--'))throw Error('Unexpected argument '+token)
    const key=token.slice(2),value=argv[++i]
    if(!value||value.startsWith('--'))throw Error('Missing value for --'+key)
    result[key]=value
  }
  return result
}
function readInput(file){
  if(!file)throw Error('A JSON file is required: --input FILE')
  return JSON.parse(fs.readFileSync(path.resolve(file),'utf8'))
}
export function runFlywheelCLI(argv){
  const [command,...rest]=argv
  if(!command||['-h','--help','help'].includes(command))return help
  const opts=args(rest),root=path.resolve(opts.root||'ops/evidencemotion/flywheel')
  const window=opts.window||'first-7d'
  switch(command){
    case 'register':return JSON.stringify(opts.package ? registerFlywheelFromPackage(root,{...readInput(opts.input),packageDir:opts.package}) : registerFlywheelVideo(root,readInput(opts.input)),null,2)
    case 'observe':return JSON.stringify(appendFlywheelObservation(root,readInput(opts.input)),null,2)
    case 'hooks':persistFlywheelHookPatterns(root,{metricWindow:window});return JSON.stringify(flywheelInsights(root,{metricWindow:window}).hookPatterns,null,2)
    case 'topics':return JSON.stringify(flywheelInsights(root,{metricWindow:window}).topics,null,2)
    case 'report':{
      const last=opts.last===undefined?10:Number(opts.last)
      if(!Number.isSafeInteger(last)||last<1||last>100)throw Error('--last must be an integer between 1 and 100')
      return renderFlywheelLearningReport(root,{metricWindow:window,last})
    }
    case 'propose':return JSON.stringify(proposeFlywheelTemplate(root,readInput(opts.input)),null,2)
    case 'approve':return JSON.stringify(approveFlywheelTemplate(root,readInput(opts.input)),null,2)
    case 'version':{
      if(!opts.proposal)throw Error('Use --proposal PROPOSAL_ID')
      return JSON.stringify(versionFlywheelTemplate(root,opts.proposal),null,2)
    }
    default:throw Error('Unknown flywheel command '+command+'\n'+help)
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{console.log(runFlywheelCLI(process.argv.slice(2)))}
  catch(error){console.error('Flywheel FAIL: '+error.message);process.exitCode=1}
}
