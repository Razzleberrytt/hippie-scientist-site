#!/usr/bin/env node
/**
 * P0 CI measurement: read-only exact GitHub Actions run/job receipts.
 * Never infers missing durations or equates repeated step names with safely
 * removable validation. No release gate or workflow is modified.
 *
 * Usage:
 *   GH_TOKEN=... node scripts/ci/report-generation-ci-timing.mjs \
 *     --repo owner/repo --runs 123456,123457
 */
import {pathToFileURL} from 'node:url'

const validTime=(value)=>{
  if(typeof value!=='string'||!value)return null
  const date=Date.parse(value)
  return Number.isFinite(date)?date:null
}
export function elapsedMinutes(first,last){
  const a=validTime(first),b=validTime(last)
  return a===null||b===null||b<a?null:Math.round((b-a)/600)/100
}
const finished=(status)=>status==='completed'
const safeStatus=(value)=>typeof value==='string'&&value?value:'unknown'

export function summarizeWorkflowTiming(run,jobs){
  if(!run||!Number.isSafeInteger(run.id)||!Array.isArray(jobs))
    throw Error('Expected an Actions run with an integer ID and its jobs array')
  const resultJobs=jobs.map((j)=>{
    const steps=(Array.isArray(j.steps)?j.steps:[]).map(step=>({
      name:String(step.name||'unnamed'),
      number:Number.isInteger(step.number)?step.number:null,
      status:safeStatus(step.status),
      conclusion:step.conclusion||null,
      minutes:finished(step.status)?elapsedMinutes(step.started_at,step.completed_at):null,
    }))
    return {
      id:j.id??null,name:String(j.name||'unnamed'),
      status:safeStatus(j.status),conclusion:j.conclusion||null,
      minutes:finished(j.status)?elapsedMinutes(j.started_at,j.completed_at):null,
      steps,
    }
  }).sort((a,b)=>a.name.localeCompare(b.name)||String(a.id).localeCompare(String(b.id)))
  const measurements=resultJobs.map(j=>j.minutes)
  const allMeasured=resultJobs.length>0&&measurements.every(v=>v!==null)
  const candidates=new Map()
  for(const j of resultJobs)for(const step of j.steps){
    if(!/(?:lint|typecheck|test|build|install dependencies|npm ci)/i.test(step.name))continue
    const normalized=step.name.trim().toLowerCase().replace(/\s+/g,' ')
    if(!candidates.has(normalized))candidates.set(normalized,[])
    candidates.get(normalized).push(j.name)
  }
  const possibleOverlap=[...candidates.entries()]
    .filter(([,owners])=>owners.length>1)
    .map(([step,owners])=>({step,jobNames:owners.sort(),disposition:'manual-equivalence-review-required'}))
    .sort((a,b)=>a.step.localeCompare(b.step))
  return {
    schemaVersion:1,
    repoFullName:run.repository?.full_name||null,
    runId:run.id,headSha:run.head_sha||null,
    name:String(run.name||'unknown'),event:String(run.event||'unknown'),
    status:safeStatus(run.status),conclusion:run.conclusion||null,
    wallMinutes:finished(run.status)?elapsedMinutes(run.run_started_at||run.created_at,run.updated_at):null,
    runnerJobMinutes:allMeasured?Math.round(measurements.reduce((a,b)=>a+b,0)*100)/100:null,
    measuredJobs:measurements.filter(v=>v!==null).length,
    totalJobs:resultJobs.length,
    jobs:resultJobs,
    possibleOverlap,
    note:'Repeated names are investigation candidates, not safely removable gates. Missing/incomplete timing is null (Unknown).',
  }
}

export function summarizeGenerationSample(reports){
  const sorted=[...reports].sort((a,b)=>a.runId-b.runId)
  const done=sorted.filter(r=>r.status==='completed'&&r.wallMinutes!==null)
  const values=done.map(r=>r.wallMinutes).sort((a,b)=>a-b)
  const percentile=(p)=>{
    if(!values.length)return null
    const index=(values.length-1)*p,lower=Math.floor(index),upper=Math.ceil(index)
    return Math.round((values[lower]+(values[upper]-values[lower])*(index-lower))*100)/100
  }
  return {
    schemaVersion:1,runCount:sorted.length,completedMeasuredRuns:values.length,
    wallMinutesP50:percentile(.5),wallMinutesP95:percentile(.95),
    runnerMinutesMeasured:sorted.every(r=>r.runnerJobMinutes!==null)
      ?Math.round(sorted.reduce((a,r)=>a+r.runnerJobMinutes,0)*100)/100:null,
    reports:sorted,
    interpretation:'Only comparable code-path/workflow/run conditions support before-versus-after efficiency conclusions. Never treat Unknown as zero.',
  }
}

async function githubJson(url,token){
  const response=await fetch(url,{headers:{
    'Accept':'application/vnd.github+json',
    'Authorization':'Bearer '+token,
    'X-GitHub-Api-Version':'2022-11-28',
    'User-Agent':'THS-generational-ci-benchmark',
  }})
  if(!response.ok)throw Error('GitHub read-only API returned HTTP '+response.status+' for requested run')
  return response.json()
}

export async function fetchTimingRun(repo,id,token){
  if(!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(repo)||!Number.isSafeInteger(id)||id<1)
    throw Error('Invalid repository or workflow run ID')
  if(!token)throw Error('GH_TOKEN is required for read-only Actions metadata')
  const base='https://api.github.com/repos/'+repo+'/actions/runs/'+id
  const run=await githubJson(base,token)
  let jobs=[],page=1,total=0
  do{
    const batch=await githubJson(base+'/jobs?per_page=100&page='+page,token)
    if(!Array.isArray(batch.jobs))throw Error('GitHub jobs payload is unavailable')
    jobs.push(...batch.jobs)
    total=batch.total_count||jobs.length
    page++
    if(page>30&&jobs.length<total)throw Error('GitHub jobs pagination limit exceeded')
  }while(jobs.length<total)
  return summarizeWorkflowTiming(run,jobs)
}

async function main(){
  const args=process.argv.slice(2)
  const get=(flag)=>{const index=args.indexOf(flag);return index<0?null:args[index+1]||null}
  const repo=get('--repo'),idsRaw=get('--runs')
  if(!repo||!idsRaw)throw Error('Usage: --repo owner/name --runs numericID,numericID')
  const ids=idsRaw.split(',').map(s=>Number(s.trim()))
  if(!ids.length||ids.some(id=>!Number.isSafeInteger(id)||id<1)||new Set(ids).size!==ids.length)
    throw Error('Workflow run IDs must be unique positive integers')
  const results=[]
  for(const id of ids)results.push(await fetchTimingRun(repo,id,process.env.GH_TOKEN))
  process.stdout.write(JSON.stringify(summarizeGenerationSample(results),null,2)+'\n')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{process.stderr.write('CI timing report: '+error.message+'\n');process.exitCode=1})
}
