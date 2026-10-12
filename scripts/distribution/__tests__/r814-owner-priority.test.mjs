import { describe, expect, it } from 'vitest'
import { R814_OWNER_ART_DIRECTION, validateR814Plan,
  measureR814Motion, assertR814MotionAcceptance } from '../r814-motion-acceptance.mjs'

const scenes=[
  {beatId:'hook',role:'hook',start:0,end:2},
  {beatId:'science',role:'finding',start:2,end:4},
  {beatId:'nuance',role:'limitation',start:4,end:6},
  {beatId:'cta',role:'cta',start:6,end:8},
]

describe('Owner-first EvidenceMotion creative authority',()=>{
  it('does not let independent reviewer heuristics override the user art direction',()=>{
    expect(R814_OWNER_ART_DIRECTION.priority).toBe('owner-first')
    expect(R814_OWNER_ART_DIRECTION.reviewerThresholdsAre).toBe('diagnostic')
    const result=validateR814Plan(scenes,'https://pubmed.ncbi.nlm.nih.gov/38788532/')
    expect(result.passed).toBe(true)
    expect(result.ownerPriority).toBe('owner-first')
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toEqual(expect.arrayContaining([
      expect.stringMatching(/pattern interrupt/),
      expect.stringMatching(/key number/),
    ]))
  })
  it('still refuses fabricated or ungrounded numbers',()=>{
    const changed=scenes.map((x,i)=>i===1?{...x,r814KeyNumber:{
      display:'−92% cure rate',sourceId:'PMID: 12345678',evidenceType:'observational'}}:x)
    expect(()=>validateR814Plan(changed,'https://pubmed.ncbi.nlm.nih.gov/38788532/')).toThrow(/source-bound/)
  })
  it('reports measured static motion without vetoing an intentional cinematic hold',()=>{
    const opts={sampleWidth:8,sampleHeight:8,sampleFps:2,minBeatChangeRatio:0.01}
    const data=Buffer.alloc(8*8*16,12)
    const result=measureR814Motion(data,scenes,opts)
    expect(result.staticFraction).toBe(1)
    expect(result.meetsVTargets).toBe(false)
    expect(result.recommendations.some(x=>x.includes('40%'))).toBe(true)
    expect(assertR814MotionAcceptance(result)).toMatchObject({status:'review-required-not-auto-rejected',ownerPriority:'owner-first'})
  })
  it('still rejects missing decoder evidence',()=>{
    expect(()=>assertR814MotionAcceptance({beats:[],decodedFinalMp4:false})).toThrow(/missing decoded-final-MP4 evidence/)
  })
})
