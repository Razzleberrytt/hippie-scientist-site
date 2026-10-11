import { describe, it, expect } from 'vitest'
import { buildR809CaptionCues, renderR809CaptionsSrt, renderR809CaptionAss, validateR809CaptionsSrt } from '../r809-caption-track.mjs'
import { renderR809VisualActor } from '../r809-visual-actors.mjs'
import { renderVerticalVideoSceneSvg } from '../render-vertical-video-package.mjs'

const scenes=[
  {beatId:'intro', start:0, end:5, voiceover:'Think of a receptor as a docking spot for certain molecules.'},
  {beatId:'finding',start:5,end:10,voiceover:'Different molecules may affect the same receptor in different ways.'},
  {beatId:'source',start:10,end:14,voiceover:''},
]
describe('EvidenceMotion R8.09 speech-first captions',()=>{
  it('splits exact narration into no more than 7 words / 2 lines, losslessly',()=>{
    const cues=buildR809CaptionCues(scenes)
    expect(cues.length).toBeGreaterThan(2)
    expect(cues.every(c=>c.text.split(/\s+/).filter(Boolean).length<=7)).toBe(true)
    expect(cues.every(c=>c.text.split('\n').length<=2)).toBe(true)
    expect(cues.filter(c=>c.beatId==='intro').map(c=>c.text.replace(/\n/g,' ')).join(' ')).toBe(scenes[0].voiceover)
    expect(cues.at(-1).end).toBe(10)
    expect(cues.every(c=>c.end>c.start)).toBe(true)
  })
  it('has only one accepted text source, with no manually substitutable captions',()=>{
    const srt=renderR809CaptionsSrt(scenes)
    expect(validateR809CaptionsSrt(scenes,srt)).toBe(true)
    expect(()=>validateR809CaptionsSrt(scenes,srt.replace('docking','loading'))).toThrow(/caption track deviates/)
    expect(renderR809CaptionAss(scenes)).toContain('Style: THS')
    expect(renderR809CaptionAss(scenes)).toContain('Dialogue: 0')
    expect(renderR809CaptionAss(scenes)).not.toContain('loading')
  })
  it('rejects unrenderable ASS control characters instead of silently deleting narration',()=>{
    expect(()=>renderR809CaptionAss([{start:0,end:4,voiceover:'This {braced} phrase is spoken.'}]))
      .toThrow(/unrenderable control characters/)
  })
  it('fails instead of flashing a long sentence too quickly',()=>{
    expect(()=>buildR809CaptionCues([{start:0,end:0.1,voiceover:'This is an example of too much text.'}])).toThrow(/too fast/)
  })
  it('never flashes a one-character final caption after a long phrase',()=>{
    const sample=[{beatId:'readability',start:0,end:1,voiceover:'one two three four five six seven x'}]
    const cues=buildR809CaptionCues(sample)
    expect(cues).toHaveLength(2)
    expect(cues.map(c=>c.text).join(' ').split(/\s+/).join(' ')).toBe(sample[0].voiceover)
    expect(cues.every(c=>c.end-c.start>=0.42-1e-6)).toBe(true)
    expect(cues.at(-1).end).toBe(1)
  })
  it('stops captions when speech ends, not after the narration pause',()=>{
    const sample=[{beatId:'pause',start:2,end:5,speechEnd:4.4,voiceover:'Narration ends before the scene ends.'}]
    const cues=buildR809CaptionCues(sample)
    expect(cues[0].start).toBe(2)
    expect(cues.at(-1).end).toBe(4.4)
    expect(cues.every(c=>c.end<=4.4)).toBe(true)
    expect(()=>buildR809CaptionCues([{...sample[0],speechEnd:5.1}])).toThrow(/invalid voice beat times/)
  })
  it('preserves inherited R8.07 rhythm, motifs and interruption in R8.09 rendered pixels',()=>{
    const base={
      role:'limitation',beatId:'limitation',visualScene:'uncertainty',
      onScreenText:'Human evidence remains uncertain.',
      motionType:'hold',colorTreatment:'evidence',
      factualAuthority:'canonical-input',compositionFamily:'evidence-focus',
      motifId:'evidence-thread',patternInterrupt:true,
    }
    const options={
      creativeMethodRelease:'R8.09',motionPhase:'post',
      sourceUrl:'https://thehippiescientist.net/compounds/mitragynine/',
      contentHash:'sha256-demo',disclosure:'Educational evidence review',
    }
    const render=scene=>renderVerticalVideoSceneSvg(scene,options).svg
    const first=render(base)
    expect(first).toContain('data-r809-visual-scene="uncertainty"')
    expect(first).toContain('data-r807-composition="evidence-focus"')
    expect(first).toContain('data-r807-motif="evidence-thread"')
    expect(first).toContain('data-r807-pattern-interrupt="true"')
    expect(render({...base,compositionFamily:'split-compare'})).not.toBe(first)
    expect(render({...base,motifId:'changed-motif'})).not.toBe(first)
    expect(render({...base,patternInterrupt:false})).not.toBe(first)
  })
  it('inherits the deterministic 0.85-second readable claim dwell gate',async()=>{
    const {readFileSync}=await import('node:fs')
    const renderer=readFileSync('scripts/distribution/render-vertical-video-package.mjs','utf8')
    expect(renderer).toContain("['R8.08', 'R8.09'].includes(methodRelease)")
    expect(renderer).toContain('visibleSeconds < 0.85 - 0.0006')
    expect(renderer).toContain('insufficient real readable claim dwell')
  })
  it('draws authored science cartoon objects, not slideshow placeholders',()=>{
    for(const visualScene of ['person','compare','molecule','evidence','uncertainty','safety','outro']){
      const svg=renderR809VisualActor({visualScene},{x:50,y:250,width:760,height:490,foreground:'#ffffff',background:'#111827'})
      expect(svg).toContain(`data-r809-visual-scene="${visualScene}"`)
      const pre=renderR809VisualActor({visualScene},{x:50,y:250,width:760,height:490,foreground:'#ffffff',motionPhase:'pre'})
      expect(pre).toContain('data-r809-visual-phase="pre"')
      expect(pre).not.toBe(svg)
      expect(svg).not.toContain('progressbar')
    }
    expect(()=>renderR809VisualActor({visualScene:'generic-slide'},{x:0,y:0,width:700,height:400,foreground:'#fff'})).toThrow(/illustration stage/)
  })
})
