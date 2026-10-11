import { describe,it,expect } from 'vitest'
import { parseMfaJson,assertAlignedTranscript } from '../r810-local-aligner.mjs'
import { renderR810AlignedCaptionTracks } from '../r810-aligned-captions.mjs'

describe('R8.10 offline forced-alignment contract',()=>{
  const source={start:0,end:4,tiers:{words:{type:'interval',entries:[
    [0.1,0.4,'human'],[0.5,0.95,'evidence'],[1,1.4,'may'],[1.5,2.0,'help']
  ]}}}
  const script={scenes:[{beatId:'human',start:0,speechEnd:2.2,end:2.5,text:'Human evidence may help'}]}
  it('parses the documented MFA JSON words tier and preserves actual speech boundaries',()=>{
    const words=parseMfaJson(source)
    expect(words).toHaveLength(4)
    expect(assertAlignedTranscript(script,words)).toHaveLength(4)
    const captioned=renderR810AlignedCaptionTracks(script.scenes,words)
    expect(captioned.srt).toContain('Human evidence may help')
    expect(captioned.ass).toContain('Dialogue: 0')
    expect(captioned.srt).not.toContain('00:00:02,500')
  })
  it('rejects unknown words, missing tiers, duplicated text and out-of-beat timestamps',()=>{
    expect(()=>parseMfaJson({tiers:{phones:{entries:[]}}})).toThrow(/words tier/)
    expect(()=>parseMfaJson({tiers:{words:{entries:[[0,1,'<unk>']]}}})).toThrow(/OOV/)
    const words=parseMfaJson(source)
    expect(()=>assertAlignedTranscript(script,words.slice(0,3))).toThrow(/word count/)
    expect(()=>assertAlignedTranscript(script,[...words.slice(0,3),{...words[3],word:'proven'}])).toThrow(/altered word/)
    expect(()=>assertAlignedTranscript(script,[...words.slice(0,3),{...words[3],end:2.4}])).toThrow(/speech bounds/)
  })
  it('never turns an estimate into a word alignment receipt',()=>{
    const words=parseMfaJson(source)
    const captioned=renderR810AlignedCaptionTracks(script.scenes,words)
    expect(captioned.cueCount).toBeGreaterThan(0)
    expect(captioned.ass).not.toContain('generic molecule icon')
  })
})
