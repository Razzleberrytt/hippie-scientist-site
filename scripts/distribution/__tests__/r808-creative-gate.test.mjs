import { describe, expect, it } from 'vitest'
import { validateR808CreativeBrief, buildR808CreativeReceipt } from '../r808-creative-gate.mjs'
import { validateR809CreativeBrief, buildR809CreativeReceipt } from '../r809-creative-gate.mjs'

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

function noviceExplainer(){
  const b=compliant()
  b.beats.find(beat=>beat.role==='evidence').narration='Evidence: a randomized human trial, a study in people assigned by chance.'
  b.beats.find(beat=>beat.role==='evidence').spokenAnchor='Evidence: a'
  b.r809={
    targetAudience:'general-public',
    assumedPriorKnowledge:'none',
    languagePolicy:'plain-english-first',
    claimAuthority:'EvidenceBridge',
    narrationCaptionSource:'exact-governed-voice-script',
    burnInNarrationCaptions:true,
    captionSync:'voice-derived-phrase-cues',
    captionMaxWords:7,
    captionMaxLines:2,
    canonicalStyle:'2p5d-science-explainer-v1',
    noPremiumCredits:true,animationMustTeach:true,
    platformSafeArea:'platform-intersection',
    decorativeProgressHudAllowed:false,
    publicClarityReview:'required',
    exactMasterCaptionReview:'required',
    technicalTerms:[{term:'randomized',firstUseBeatId:'evidence',explanationBeatId:'evidence',plainMeaning:'assigned by chance'}],glossaryCoverageReviewed:true
  }
  const visualByRole={hook:'person',finding:'compare',evidence:'evidence',limitation:'uncertainty',context:'safety',cta:'outro'}
  for(const beat of b.beats) if(beat.narration){
    beat.r809={
      visualScene:visualByRole[beat.role],
      visualReason:'The illustrated actor shows the viewer the actual scientific narrative visually.'
    }
  }
  return b
}

describe('EvidenceMotion R8.09 general-public animated-explainer contract',()=>{
  it('inherits R8.08 and binds every spoken scene and caption policy to the approved narration',()=>{
    const b=noviceExplainer()
    expect(validateR809CreativeBrief(b)).toEqual([])
    const receipt=buildR809CreativeReceipt(b)
    expect(receipt).toMatchObject({release:'R8.09',status:'approved',burnInNarrationCaptions:true})
    const previous=receipt.overlaySha256
    b.beats[1].r809.visualScene='molecule'
    expect(buildR809CreativeReceipt(b).overlaySha256).not.toBe(previous)
  })
  it('rejects an unspecified PowerPoint-style visual and missing plain-English explanation',()=>{
    const b=noviceExplainer()
    b.beats[1].r809.visualScene='generic-slide'
    expect(validateR809CreativeBrief(b).join('\n')).toMatch(/cartoon teaching scene/)
    b.beats[1].r809.visualScene='compare'
    b.r809.technicalTerms=[{term:'randomized',firstUseBeatId:'evidence',explanationBeatId:'evidence',plainMeaning:'assigned by chance'},{term:'trial',firstUseBeatId:'evidence',explanationBeatId:'evidence',plainMeaning:'a different missing explanation'}]
    expect(validateR809CreativeBrief(b).join('\n')).toMatch(/plain meaning of trial/)
  })
  it('detects technical scientific terms omitted from a declared glossary',()=>{
    const b=noviceExplainer()
    b.r809.technicalTerms=[]
    expect(validateR809CreativeBrief(b).join('\n')).toMatch(/randomized was spoken without an explanatory glossary entry/)
  })
  it('requires explanations for multiword scientific terms too',()=>{
    const b=noviceExplainer()
    b.beats.find(beat=>beat.role==='evidence').narration += ' It was a clinical trial.'
    expect(validateR809CreativeBrief(b).join('\\n')).toMatch(/clinical trial was spoken without an explanatory glossary entry/)
  })
  it('rejects ungrounded captions or missing knowledge-level policy',()=>{
    const b=noviceExplainer()
    b.r809.captionSync='generic-timer'
    b.r809.assumedPriorKnowledge='some'
    expect(validateR809CreativeBrief(b).join('\n')).toMatch(/short burned-in narration captions/)
    expect(validateR809CreativeBrief(b).join('\n')).toMatch(/without prior scientific knowledge/)
  })
})
