import { describe,it,expect,vi } from 'vitest'
import crypto from 'node:crypto'
vi.mock('../r809-creative-gate.mjs',()=>({buildR809CreativeReceipt:()=>({overlaySha256:'a'.repeat(64)})}))
import { R810_ROLES,r810TextSafetyErrors,validateR810CreativeBrief,buildR810CreativeReceipt,assertR810TimedScenes } from '../r810-creative-gate.mjs'

const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex')
const url='https://thehippiescientist.net/compounds/example/'
function fixture(){
  const beats=[
    {id:'hook',role:'hook',narration:'What does this mean?',onScreenText:'What does this mean?'},
    {id:'definition',role:'finding',narration:'This is a science explainer.',onScreenText:'This is a science explainer.'},
    {id:'preclinical',role:'evidence',narration:'Animal evidence may show a mechanism.',onScreenText:'Animal evidence may show a mechanism.'},
    {id:'human',role:'finding',narration:'Human evidence is not established.',onScreenText:'Human evidence is not established.'},
    {id:'safety',role:'context',narration:'A rare risk may occur as of 2026-10-10.',onScreenText:'A rare risk may occur as of 2026-10-10.'},
    {id:'unknowns',role:'limitation',narration:'Unknown long term outcomes are not proven.',onScreenText:'Unknown long term outcomes are not proven.'},
    {id:'cta',role:'cta',narration:'Read the approved evidence page.',onScreenText:'Read the approved evidence page.'},
    {id:'source',role:'source',narration:'',onScreenText:url,holdSeconds:3},
  ]
  const ids=['hook','definition','preclinical','human','safety','unknowns','cta']
  const sourceLines=['PMID 12345678','Source-reviewed educational evidence']
  const approvedText=sourceLines.join('\n')
  return {sourceIdentity:{id:'example',sourceUrl:url},beats,
    r810:{
      slots:R810_ROLES.map((role,i)=>{
        const beat=beats.find(b=>b.id===ids[i])
        return {role,beatId:beat.id,narration:beat.narration,screenText:beat.onScreenText,
          claimIds:['claim-'+i],sourceIds:['PMID:12345678'],approval:'editorial-reviewed',
          reviewReceipt:{decision:'approved',reviewerRole:'editorial-science-reviewer',
            reviewerId:'editorial-reviewer',reviewedAt:'2026-10-10',
            approvedNarrationSha256:sha(beat.narration),approvedOverlaySha256:sha(beat.onScreenText),
            governedClaimIds:['claim-'+i]},
          ...(role==='lab-evidence'?{evidenceTier:'preclinical-or-mechanism'}:{}),
          ...(role==='human-evidence'?{evidenceTier:'human'}:{}),
          ...(role==='safety'?{timeSensitive:true}:{})}
      }),
      sourceLedger:{lines:sourceLines,approvedText,approvedTextSha256:sha(approvedText),
        reviewStatus:'approved',approvedBy:'editorial-reviewer',reviewedAt:'2026-10-10',minimumVisibleSeconds:3},
      claimAttestations:[{claimId:'claim-4',claimVerifiedAt:'2026-10-10',verifiedSourceId:'PMID:12345678',
        verifiedSourceSha256:sha('reviewed-actual-source'),reviewerId:'editorial-reviewer',maxAgeDays:7}],
      publicationApproval:'exact-master-required',estimatedWordTimingAllowed:false,
    },
  }
}
describe('EvidenceMotion R8.10 governed narrative and safety contract',()=>{
  const when={now:new Date('2026-10-11T12:00:00Z')}
  it('validates seven reviewed narrative roles and a silent separately bound ledger',()=>{
    const f=fixture()
    expect(validateR810CreativeBrief(f,when)).toEqual([])
    const receipt=buildR810CreativeReceipt(f,when)
    expect(receipt).toMatchObject({release:'R8.10',status:'approved',inheritedR809OverlaySha256:'a'.repeat(64)})
    expect(receipt.governedPlanSha256).toMatch(/^[a-f0-9]{64}$/)
  })
  it('rejects a missing narrative slot or an illicit role migration',()=>{
    const f=fixture()
    f.r810.slots.pop()
    expect(validateR810CreativeBrief(f,when).join('\n')).toMatch(/exactly seven/)
    const g=fixture();g.r810.slots[2].beatId='human'
    expect(validateR810CreativeBrief(g,when).join('\n')).toMatch(/legacy role mapping|duplicate/)
  })
  it('blocks ungoverned extra beats and physically reordered content despite valid slot labels',()=>{
    const extra=fixture()
    extra.beats.splice(5,0,{...extra.beats[5],id:'unreviewed-claim'})
    expect(validateR810CreativeBrief(extra,when).join('\n')).toMatch(/extra legacy beats/)
    const shuffled=fixture()
    ;[shuffled.beats[2],shuffled.beats[3]]=[shuffled.beats[3],shuffled.beats[2]]
    expect(validateR810CreativeBrief(shuffled,when).join('\n')).toMatch(/approved order/)
    const misplacedSource=fixture()
    misplacedSource.beats.unshift(misplacedSource.beats.pop())
    expect(validateR810CreativeBrief(misplacedSource,when).join('\n')).toMatch(/final beat/)
  })
  it('fails closed when screen text deletes risk/negation/uncertainty language',()=>{
    expect(r810TextSafetyErrors('May have a rare risk; do not use without review.',
      'Has a risk; use it')).toEqual(expect.arrayContaining([
      expect.stringContaining('may'),expect.stringContaining('rare'),expect.stringContaining('not'),
      expect.stringContaining('without')]))
    const f=fixture();f.beats[5].onScreenText='Known long term outcomes are proven.'
    f.r810.slots[5].screenText=f.beats[5].onScreenText
    expect(validateR810CreativeBrief(f,when).join('\n')).toMatch(/unknowns: on-screen text omitted/)
  })
  it('rejects source-ledger fabrication and expired as-of claim dating',()=>{
    const f=fixture();f.r810.sourceLedger.lines[0]='Invented citation'
    expect(validateR810CreativeBrief(f,when).join('\n')).toMatch(/source ledger text\/hash differs/)
    const old=fixture();old.r810.claimAttestations[0].claimVerifiedAt='2026-09-01'
    expect(validateR810CreativeBrief(old,when).join('\n')).toMatch(/stale|as-of date not visible/)
  })
  it('rejects an overly fast warning or silent-source card in actual voice measured seconds',()=>{
    const f=fixture()
    const scenes=f.r810.slots.map((slot,i)=>({beatId:slot.beatId,role:slot.role,
      start:i*5,speechEnd:i*5+4,end:i*5+4.4,voiceover:slot.narration}))
    scenes.push({beatId:'source',role:'source',start:35,end:39,voiceover:''})
    expect(assertR810TimedScenes(f,scenes)).toBe(true)
    scenes[4].speechEnd=scenes[4].start+0.8
    expect(()=>assertR810TimedScenes(f,scenes)).toThrow(/natural spoken duration/)
  })
  it('blocks replacing source review date with the fresh render date',()=>{
    const f=fixture();f.beats[4].narration='A rare risk may occur as of 2026-10-11.'
    f.beats[4].onScreenText=f.beats[4].narration
    f.r810.slots[4].screenText=f.beats[4].onScreenText
    f.r810.slots[4].narration=f.beats[4].narration
    expect(validateR810CreativeBrief(f,when).join('\n')).toMatch(/as-of date not visible/)
  })
})
