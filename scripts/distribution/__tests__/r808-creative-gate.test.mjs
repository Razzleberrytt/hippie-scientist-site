import { describe, expect, it } from 'vitest'
import { validateR808CreativeBrief, buildR808CreativeReceipt } from '../r808-creative-gate.mjs'

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


function compliant() {
  const b = brief()
  b.beats[0].motion.type = 'highlight'
  b.r808 = {
    viewerTakeaway:b.premise.earlyPayoff,
    mobileSafeArea:'platform-intersection',
    hookVisibleAtFrameZero:true,
    exactMasterSilentReview:'required',
    maxCoreWords:14,maxCoreChars:96,minReadableSeconds:0.85,
  }
  const roleNames = {hook:'promise',finding:'answer',evidence:'support',limitation:'boundary'}
  for(const beat of b.beats) if(roleNames[beat.role]){
    beat.r808={silentRole:roleNames[beat.role],silentMeaning:beat.onScreenText,safeArea:'platform-intersection'}
  }
  return b
}

describe('R8.08 silent comprehension contract',()=>{
  it('requires inherited R8.07 and hashes the actual rendered text',()=>{
    const b=compliant()
    expect(validateR808CreativeBrief(b)).toEqual([])
    const receipt=buildR808CreativeReceipt(b)
    expect(receipt).toMatchObject({release:'R8.08',status:'approved',minReadableSeconds:0.85})
    expect(receipt.overlaySha256).toMatch(/^[a-f0-9]{64}$/)
    b.beats[1].onScreenText='A different governed meaning.'
    b.beats[1].r808.silentMeaning=b.beats[1].onScreenText
    expect(buildR808CreativeReceipt(b).overlaySha256).not.toBe(receipt.overlaySha256)
  })
  it('rejects a blank first-frame hook',()=>{
    const b=compliant();b.beats[0].motion.type='reveal'
    expect(validateR808CreativeBrief(b).join('\n')).toMatch(/frame zero/)
  })
  it('rejects overlong on-screen text and stale silent summary',()=>{
    const b=compliant()
    b.beats[3].onScreenText=Array.from({length:20},()=> 'unreadable').join(' ')
    expect(validateR808CreativeBrief(b).join('\n')).toMatch(/reading budget|silentMeaning/)
  })
  it('rejects dropping the inherited R8.07 limitation motif',()=>{
    const b=compliant();b.beats[3].r807.motifId=''
    expect(validateR808CreativeBrief(b).join('\n')).toMatch(/motif must return/)
  })
})
