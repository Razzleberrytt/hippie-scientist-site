import { describe, expect, it } from 'vitest'
import { validateR806CreativeBrief, buildR806CreativeReceipt } from '../r806-creative-gate.mjs'

function brief() {
  const source='https://thehippiescientist.net/example/'
  const makeBeat=(id,role,narration,mode)=>({
    id, role, narration, onScreenText:narration || source,
    visualPurpose:'Teach this exact spoken idea.',
    spokenAnchor:narration ? narration.split(' ').slice(0,2).join(' ') : '',
    visualAction:narration ? 'Reveal the teaching object on the spoken anchor.' : 'Hold source.',
    motion:{type:narration?'reveal':'hold'},
    cutReason:role==='source'?'end':'reveal',
    factualAuthority:role==='hook'?'creative-framing':role==='source'?'canonical-source':'canonical-input',
    primaryEntities:[id], comparisonRequired:false,
    pauseAfterSeconds:narration?0.12:0,
    ...(narration?{}:{holdSeconds:3}),
    r806:{visualMode:mode,teachingObject:`${role}-object`},
  })
  const beats=[
    makeBeat('hook','hook','What the evidence actually says','object'),
    makeBeat('finding','finding','The canonical finding.','comparison'),
    makeBeat('evidence','evidence','Evidence: randomized human trial.','source-evidence'),
    makeBeat('limitation','limitation','The canonical limitation.','diagram'),
    makeBeat('source','source','', 'source-evidence'),
    makeBeat('context','context','Educational, not medical advice.','kinetic-type'),
    makeBeat('cta','cta','Read the full evidence page.','kinetic-type'),
  ]
  beats[4].onScreenText=source
  return {
    release:'R8.05',
    sourceIdentity:{id:'example',sourceUrl:source},
    premise:{
      interestScore:5,coldViewerWhyCare:'The result changes a common assumption.',
      viewerQuestion:'What does the result actually change?',earlyPayoff:'The canonical finding.',
      methodologyBeforePayoff:false,hookMode:'consequence',methodIsStory:false,paperSummaryOpening:false,
    },
    timing:{durationPolicy:'natural',narrationIsTimingMaster:true,voiceFirstBeatMapApproved:true},
    beats,recovery:{macroRebuildCount:0},
    r806:{
      conceptLab:{
        selectedId:'c2',
        candidates:[
          {id:'c1',angle:'myth-break',whyCare:'Correct a common assumption.',visualPromise:'Break the assumption visually.',mentalJob:'What does the result actually change?',interestScore:4,visualPotentialScore:4,confusionScore:2},
          {id:'c2',angle:'consequence',whyCare:'Show why the result matters.',visualPromise:'Show the consequence immediately.',mentalJob:'What does the result actually change?',interestScore:5,visualPotentialScore:5,confusionScore:1},
          {id:'c3',angle:'comparison',whyCare:'Contrast what people expect with what happened.',visualPromise:'Use a clean side-by-side.',mentalJob:'What does the result actually change?',interestScore:4,visualPotentialScore:5,confusionScore:2},
        ],
      },
      opening:{coverText:'What the evidence actually says',firstFrameText:'What the evidence actually says',firstLine:'What the evidence actually says',audioOffPromise:'The first three beats communicate the question and answer without audio.'},
      delivery:{metricoolOptional:true,manualFallbackRequired:true,providerMayMutateArtifact:false},
    },
  }
}

describe('R8.06 creative overlay',()=>{
  it('accepts a native-feeling concept plan over R8.05 runtime',()=>{
    const b=brief()
    expect(validateR806CreativeBrief(b)).toEqual([])
    expect(buildR806CreativeReceipt(b)).toMatchObject({release:'R8.06',runtimeBaseRelease:'R8.05',status:'approved',selectedConceptId:'c2',openingConvergence:true})
  })
  it('rejects sterile opening and Metricool dependency',()=>{
    const b=brief()
    b.beats[0].r806.visualMode='kinetic-type'
    b.beats[1].r806.visualMode='kinetic-type'
    b.beats[2].r806.visualMode='kinetic-type'
    b.r806.delivery.metricoolOptional=false
    const errors=validateR806CreativeBrief(b).join('\n')
    expect(errors).toMatch(/three consecutive/)
    expect(errors).toMatch(/Metricool as optional/)
  })
  it('rejects a weak selected concept before render',()=>{
    const b=brief()
    b.r806.conceptLab.candidates[1].visualPotentialScore=3
    expect(validateR806CreativeBrief(b).join('\n')).toMatch(/visualPotentialScore >= 4/)
  })
})
