import {describe,it,expect} from 'vitest'
import {
  elapsedMinutes,summarizeWorkflowTiming,summarizeGenerationSample,fetchTimingRun,
} from '../report-generation-ci-timing.mjs'

const run={
  id:1001,name:'CI',event:'pull_request',head_sha:'sha-abc',
  status:'completed',conclusion:'success',
  created_at:'2026-10-08T12:00:00Z',
  run_started_at:'2026-10-08T12:01:00Z',
  updated_at:'2026-10-08T12:31:00Z',
  repository:{full_name:'example/ths'},
}
const job=(id,name,start,end,steps=[])=>({
  id,name,status:'completed',conclusion:'success',
  started_at:'2026-10-08T'+start+':00Z',
  completed_at:'2026-10-08T'+end+':00Z',
  steps,
})
const step=(name,start,end)=>({name,status:'completed',conclusion:'success',
  started_at:'2026-10-08T'+start+':00Z',
  completed_at:'2026-10-08T'+end+':00Z'})

describe('generational CI measurement',()=>{
  it('respects missing, invalid and out-of-order timestamps',()=>{
    expect(elapsedMinutes('2026-10-08T12:00:00Z','2026-10-08T12:30:00Z')).toBe(30)
    expect(elapsedMinutes('2026-10-08T12:30:00Z','2026-10-08T12:00:00Z')).toBeNull()
    expect(elapsedMinutes(undefined,'2026-10-08T12:30:00Z')).toBeNull()
    expect(elapsedMinutes('garbage','also garbage')).toBeNull()
  })
  it('distinguishes workflow wall time from parallel job runner time',()=>{
    const report=summarizeWorkflowTiming(run,[
      job(1,'Build','12:02','12:30',[step('Run typecheck','12:04','12:08')]),
      job(2,'Validation','12:03','12:25',[step('Run typecheck','12:05','12:10')]),
    ])
    expect(report.wallMinutes).toBe(30)
    expect(report.runnerJobMinutes).toBe(50)
    expect(report.measuredJobs).toBe(2)
    expect(report.possibleOverlap).toEqual([{
      step:'run typecheck',jobNames:['Build','Validation'],
      disposition:'manual-equivalence-review-required',
    }])
    expect(report.headSha).toBe('sha-abc')
  })
  it('marks incomplete runs and missing job durations Unknown, never zero',()=>{
    const r=summarizeWorkflowTiming({...run,status:'in_progress',conclusion:null},[
      {...job(1,'Waiting','12:02','12:03'),status:'in_progress',completed_at:null},
    ])
    expect(r.wallMinutes).toBeNull()
    expect(r.runnerJobMinutes).toBeNull()
    expect(r.jobs[0].minutes).toBeNull()
    expect(r.measuredJobs).toBe(0)
  })
  it('produces deterministic order and measured percentiles',()=>{
    const base=summarizeWorkflowTiming(run,[job(1,'CI validation','12:01','12:20')])
    const second={...base,runId:1002,wallMinutes:10,runnerJobMinutes:10}
    const combined=summarizeGenerationSample([second,base])
    expect(combined.reports.map(x=>x.runId)).toEqual([1001,1002])
    expect(combined.wallMinutesP50).toBe(20)
    expect(combined.wallMinutesP95).toBe(29)
    expect(combined.runnerMinutesMeasured).toBe(29)
  })
  it('does not infer quantitative ROI from missing samples',()=>{
    const r=summarizeGenerationSample([])
    expect(r.wallMinutesP50).toBeNull()
    expect(r.wallMinutesP95).toBeNull()
    expect(r.runnerMinutesMeasured).toBeNull()
    expect(r.interpretation).toMatch(/Unknown/)
  })
  it('rejects invalid IDs or unavailable permission before network request',async()=>{
    await expect(fetchTimingRun('bad repo',123,'token')).rejects.toThrow(/Invalid/)
    await expect(fetchTimingRun('owner/repo',123,'')).rejects.toThrow(/GH_TOKEN/)
  })
})
