import { describe, expect, it } from 'vitest'
import { validateR807CreativeBrief, buildR807CreativeReceipt } from '../r807-creative-gate.mjs'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'

function brief() {
  const source='https://thehippiescientist.net/example/'
  const makeBeat=(id,role,narration,visualMode,compositionFamily,rhythmAction)=>({
    id,role,narration,onScreenText:narration||source,
    visualPurpose:'Teach this exact spoken idea.',
    spokenAnchor:narration?narration.split(' ').slice(0,2).join(' '):'',
    visualAction:narration?'Reveal the teaching object on the spoken anchor.':'Hold source.',
    motion:{type:narration?'reveal':'hold'},
    cutReason:role==='source'?'end':'reveal',
    factualAuthority:role==='hook'?'creative-framing':role==='source'?'canonical-source':'canonical-input',
    primaryEntities:[id],comparisonRequired:false,pauseAfterSeconds:narration?0.12:0,
    ...(narration?{}:{holdSeconds:3}),
    r806:{visualMode,teachingObject:`${role}-object`},
    r807:{compositionFamily,rhythmAction,motifId:'',patternInterrupt:false,patternInterruptReason:''},
  })
  const beats=[
    makeBeat('hook','hook','What the evidence actually says','object','hero-object','orient'),
    makeBeat('finding','finding','The canonical finding.','comparison','split-compare','confirm'),
    makeBeat('evidence','evidence','Evidence: randomized human trial.','source-evidence','evidence-focus','prove'),
    makeBeat('limitation','limitation','The canonical limitation.','diagram','diagram-flow','pivot'),
    makeBeat('source','source','', 'source-evidence','evidence-focus','resolve'),
    makeBeat('context','context','Educational, not medical advice.','kinetic-type','kinetic-type','resolve'),
    makeBeat('cta','cta','Read the full evidence page.','kinetic-type','kinetic-type','resolve'),
  ]
  beats[0].r807.motifId='result-thread'
  beats[3].r807.motifId='result-thread'
  beats[3].r807.patternInterrupt=true
  beats[3].r807.patternInterruptReason='limitation-pivot'
  beats[4].onScreenText=source
  return {
    release:'R8.05',
    sourceIdentity:{id:'example',sourceUrl:source},
    premise:{interestScore:5,coldViewerWhyCare:'The result changes a common assumption.',viewerQuestion:'What does the result actually change?',earlyPayoff:'The canonical finding.',methodologyBeforePayoff:false,hookMode:'consequence',methodIsStory:false,paperSummaryOpening:false},
    timing:{durationPolicy:'natural',narrationIsTimingMaster:true,voiceFirstBeatMapApproved:true},
    beats,recovery:{macroRebuildCount:0},
    r806:{
      conceptLab:{selectedId:'c2',candidates:[
        {id:'c1',angle:'myth-break',whyCare:'Correct a common assumption.',visualPromise:'Break it visually.',mentalJob:'What does the result actually change?',interestScore:4,visualPotentialScore:4,confusionScore:2},
        {id:'c2',angle:'consequence',whyCare:'Show why it matters.',visualPromise:'Show the consequence.',mentalJob:'What does the result actually change?',interestScore:5,visualPotentialScore:5,confusionScore:1},
        {id:'c3',angle:'comparison',whyCare:'Contrast expectation and result.',visualPromise:'Use a side-by-side.',mentalJob:'What does the result actually change?',interestScore:4,visualPotentialScore:5,confusionScore:2},
      ]},
      opening:{coverText:'What the evidence actually says',firstFrameText:'What the evidence actually says',firstLine:'What the evidence actually says',audioOffPromise:'The opening question and answer are readable without audio.'},
      delivery:{metricoolOptional:true,manualFallbackRequired:true,providerMayMutateArtifact:false},
    },
    r807:{
      visualThesis:'A single result thread changes form as certainty narrows.',
      motif:{id:'result-thread',purpose:'Carry the same question from hook into the limitation pivot.'},
      rhythm:{semanticPatternInterruptRequired:true,maxConsecutiveCompositionFamily:2,maxConsecutiveVisualMode:2,exactMasterCertification:'required'},
    },
  }
}

describe('R8.07 visual authorship gate',()=>{
  it('accepts authored rhythm over R8.06',()=>{
    const b=brief()
    expect(validateR807CreativeBrief(b)).toEqual([])
    const receipt=buildR807CreativeReceipt(b)
    expect(receipt).toMatchObject({release:'R8.07',runtimeBaseRelease:'R8.05',status:'approved',patternInterruptBeatId:'limitation',maxCompositionRun:1})
    expect(receipt.overlaySha256).toMatch(/^[a-f0-9]{64}$/)
  })
  it('rejects composition repetition debt',()=>{
    const b=brief()
    b.beats[0].r807.compositionFamily='hero-object'
    b.beats[1].r807.compositionFamily='hero-object'
    b.beats[2].r807.compositionFamily='hero-object'
    expect(validateR807CreativeBrief(b).join('\n')).toMatch(/more than two consecutive/)
  })
  it('rejects decorative rather than semantic pattern interruption',()=>{
    const b=brief()
    b.beats[3].r807.patternInterruptReason='random-flash'
    expect(validateR807CreativeBrief(b).join('\n')).toMatch(/limitation-pivot/)
  })
  it('rejects motif that never returns at the limitation pivot',()=>{
    const b=brief()
    b.beats[3].r807.motifId=''
    expect(validateR807CreativeBrief(b).join('\n')).toMatch(/motif must return/)
  })
})


it('fails closed on unknown creative methodology labels',()=>{
  expect(()=>buildLosslessCreativeSpec({systemRelease:'R8.05',creativeMethodRelease:'R8.99'})).toThrow(/unsupported creative methodology/)
})
