import { describe, it, expect } from 'vitest'
import { assessPublicationApproval, classifyPublicationChange } from './canonical-publication-approval.mjs'

const sha='a'.repeat(40)
const older='b'.repeat(40)
const pr={number:6703,base:{repo:{owner:{login:'Razzleberrytt'},full_name:'Razzleberrytt/hippie-scientist-site'}},head:{sha,repo:{full_name:'Razzleberrytt/hippie-scientist-site'}}}
const publicFile='content/articles/new-licorice-claim.md'
const approval=(head=sha,login='Razzleberrytt',id=1)=>({
  id, user:{login,type:'User'},body:`THS-PUBLICATION-APPROVED PR=#6703 HEAD=${head}`,created_at:'2026-10-12T16:00:00Z'
})
const decide=(changedFiles,extra={})=>assessPublicationApproval({pr,changedFiles,...extra})

describe('canonical publication approval',()=>{
  it('auto-clears only inert staging, without clinical publication rights',()=>{
    expect(classifyPublicationChange(['docs/research/deep-enrichment-13.md','ops/editorial-runtime/publication-pilots/x.md']).kind).toBe('AUTO_STAGING')
    const r=decide(['ops/editorial-runtime/publication-pilots/d-mannose.md'])
    expect(r.allowed).toBe(true)
    expect(r.kind).toBe('AUTO_STAGING')
  })
  it('retains original controller governance for unrelated code, never calls it publication approval',()=>{
    const r=decide(['scripts/ui/palette.mjs'])
    expect(r).toMatchObject({allowed:true,kind:'EXISTING_GATES'})
  })
  it('holds on empty, malformed, or unknown changed-files input',()=>{
    for(const files of [[],null,['']]){
      expect(classifyPublicationChange(files).kind).toBe('HOLD')
      expect(decide(files).allowed).toBe(false)
    }
  })
  it('requires human approval for clinical articles, public herb data and app guidance, including mixed diffs',()=>{
    for(const file of [publicFile,'public/data/herbs-detail/licorice.json','public/data/claims.json','app/guides/sleep/page.tsx','data-sources/herb_monograph_master.xlsx']){
      const r=decide([file])
      expect(r.kind).toBe('HUMAN_PUBLICATION')
      expect(r.allowed).toBe(false)
    }
    expect(decide(['docs/research/safe.md',publicFile]).allowed).toBe(false)
  })
  it('requires exact head, owner and exact PR number (general approval is invalid)',()=>{
    for(const c of [
      approval(older),
      approval(sha,'someoneelse'),
      {...approval(),body:'Approve all'},
      {...approval(),body:`THS-PUBLICATION-APPROVED PR=#999 HEAD=${sha}`},
      {...approval(),user:{login:'Razzleberrytt',type:'Bot'}}
    ]){
      expect(decide([publicFile],{comments:[c]}).allowed).toBe(false)
    }
  })
  it('accepts trusted owner comment bound to exact current head while retaining other gates',()=>{
    const r=decide([publicFile],{comments:[approval()]})
    expect(r.allowed).toBe(true)
    expect(r.kind).toBe('HUMAN_PUBLICATION')
    expect(r.reason).toMatch(/existing science and release gates/)
  })
  it('owner revocation after approval must close the publication gate',()=>{
    const revoked={...approval(sha,'Razzleberrytt',2),body:`THS-PUBLICATION-REVOKED PR=#6703 HEAD=${sha}`,created_at:'2026-10-12T17:00:00Z'}
    expect(decide([publicFile],{comments:[approval(),revoked]}).allowed).toBe(false)
  })
  it('accepts only the current exact-head approved reviewer state',()=>{
    const prior={id:1, user:{login:'Razzleberrytt',type:'User'},commit_id:sha, state:'APPROVED',submitted_at:'2026-10-12T16:00:00Z'}
    const change={...prior,id:2,state:'CHANGES_REQUESTED',submitted_at:'2026-10-12T17:00:00Z'}
    expect(decide([publicFile],{reviews:[prior]}).allowed).toBe(true)
    expect(decide([publicFile],{reviews:[prior,change]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,commit_id:older}]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,user:{login:'other',type:'User'}}]}).allowed).toBe(false)
  })
  it('blocks when exact PR or base owner identity is missing',()=>{
    const tampered={...pr,base:{repo:{full_name:'Razzleberrytt/hippie-scientist-site'}}}
    expect(decide([publicFile],{pr:tampered,comments:[approval()]}).allowed).toBe(false)
    const fork={...pr,head:{...pr.head,repo:{full_name:'other/fork'}}}
    expect(decide([publicFile],{pr:fork,comments:[approval()]}).allowed).toBe(false)
  })
})
