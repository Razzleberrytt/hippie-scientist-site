import {describe,it,expect} from 'vitest'
import {r812MechanismErrors,assertR812Mechanism,assertR812Storyboard,renderR812MechanismSvg} from '../r812-mechanisms.mjs'
import {parseR812Loudness,assertR812Loudness,R812_TARGET_LUFS} from '../r812-loudness.mjs'
import fs from 'node:fs'
import path from 'node:path'

const conversion={
 template:'enzyme-conversion', inputName:'Mitragynine',targetName:'CYP3A4 enzyme',
 outputName:'7-hydroxymitragynine',actionVerb:'converts',
 evidenceTier:'preclinical-or-mechanism',
 qualifier:'Human liver preparations, in vitro; not a clinical effect claim',
 onScreenSources:'PMID: 31263758, 38481700',sourceIds:['31263758','38481700'],claimIds:['conversion-liver']
}
const article='https://thehippiescientist.net/articles/mitragynine'
describe('EvidenceMotion R8.12 show dont tell safety',()=>{
 it('renders three actual named mechanism templates with before/after phases, visible qualifiers and PMIDs',()=>{
  const receptor={...conversion,template:'receptor-binding',targetName:'mu-opioid receptor',inputName:'7-hydroxymitragynine',outputName:'bound receptor',actionVerb:'binds'}
  const molecule={...conversion,template:'molecule-transform',targetName:'metabolic transformation'}
  for(const model of [conversion,receptor,molecule]){
   expect(r812MechanismErrors(model)).toEqual([])
   const before=renderR812MechanismSvg(model,{phase:'pre'})
   const after=renderR812MechanismSvg(model,{phase:'post'})
   expect(before).not.toBe(after)
   for(const key of [model.inputName,model.targetName,model.outputName,model.qualifier,'PMID: 31263758'])expect(after).toContain(key)
   expect(after).toContain('data-r812-mechanism')
  }
 })
 it('rejects unlabeled red blobs, missing lab qualifiers/PMIDs and mechanism-free scenes',()=>{
  expect(()=>assertR812Mechanism({...conversion,inputName:''})).toThrow(/name this object/)
  expect(()=>assertR812Mechanism({...conversion,onScreenSources:'Evidence'})).toThrow(/visible on-screen PMID/)
  expect(()=>assertR812Mechanism({...conversion,qualifier:'Observed in humans'})).toThrow(/lab-vs-human/)
  expect(()=>assertR812Storyboard([{role:'cta',durationSeconds:3}],{ctaUrl:article})).toThrow(/requires a mechanism/)
 })
 it('caps CTA at five seconds and splits lengthy evidence beats without dropping the source card',()=>{
  const valid=[
   {role:'hook',durationSeconds:2,mechanism:conversion},
   {role:'finding',r812Role:'lab-evidence',durationSeconds:4.8,mechanism:conversion},
   {role:'cta',durationSeconds:4.7},
   {role:'source',durationSeconds:3},
  ]
  expect(assertR812Storyboard(valid,{ctaUrl:article,requireHooks:true,hookApproaches:['question','contrast','reveal']})).toBe(true)
  expect(()=>assertR812Storyboard(valid.map(b=>b.role==='cta'?{...b,durationSeconds:9}:b),{ctaUrl:article})).toThrow(/at most 5 seconds/)
  expect(()=>assertR812Storyboard(valid.map(b=>b.r812Role==='lab-evidence'?{...b,durationSeconds:9}:b),{ctaUrl:article})).toThrow(/split the nine-second beat/)
  expect(()=>assertR812Storyboard(valid,{ctaUrl:'https://example.com'})).toThrow(/exact HTTPS article URL/)
 })
 it('requires independently measured -14 LUFS on encoded AAC, not a filter claim',()=>{
  expect(R812_TARGET_LUFS).toBe(-14)
  const stderr='[Parsed_ebur128] Summary:\n\nIntegrated loudness:\n    I:         -14.2 LUFS\n    Threshold: -23.0 LUFS\n\nLoudness range:\n    LRA:  1.3 LU\n\nTrue peak:\n    Peak: -1.1 dBFS'
  expect(assertR812Loudness(parseR812Loudness(stderr)).status).toBe('pass')
  expect(()=>assertR812Loudness({...parseR812Loudness(stderr),integratedLufs:-16.3})).toThrow(/-14 LUFS/)
  expect(()=>assertR812Loudness({...parseR812Loudness(stderr),truePeakDbfs:0.1})).toThrow(/true peak/)
 })
 it('keeps governed local word aligner, safe-area, voice and visually distinct hook MP4 producers',()=>{
  const base='scripts/distribution/'
  const pkg=fs.readFileSync(base+'render-vertical-video-package.mjs','utf8')
  const mp4=fs.readFileSync(base+'render-vertical-video-mp4.mjs','utf8')
  const drafts=fs.readFileSync(base+'r811-derived-assets.mjs','utf8')
  const hooks=fs.readFileSync(base+'r811-hook-preview-mp4.mjs','utf8')
  const aligner=fs.readFileSync(base+'r810-local-aligner.mjs','utf8')
  const gate=fs.readFileSync(base+'r810-package-qa.mjs','utf8')
  const voice=fs.readFileSync(base+'render-local-narration.py','utf8')
  expect(pkg).toContain('R8.12 safe-area text')
  expect(pkg).toContain('r812CtaUrl')
  for(const mode of ['question','contrast','reveal'])expect(drafts).toContain('data-r812-hook-approach=\\\"'+mode)
  expect(hooks).toContain('silent-draft.mp4')
  expect(aligner).toContain('mfa-offline')
  expect(gate).toContain('R8.10 production requires local evidence-backed word alignment')
  expect(mp4).toContain('ebur128=peak=true')
  expect(voice).toContain('voice model missing, re-fetch')
  expect(voice).toContain('voiceWeightsSha256')
  expect(voice).toContain('modelWeightsSha256')
 })
})
