import { describe, it, expect } from 'vitest'
import { buildR809CaptionCues, renderR809CaptionsSrt, renderR809CaptionAss, validateR809CaptionsSrt } from '../r809-caption-track.mjs'
import { renderR809VisualActor } from '../r809-visual-actors.mjs'

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
  it('fails instead of flashing a long sentence too quickly',()=>{
    expect(()=>buildR809CaptionCues([{start:0,end:0.1,voiceover:'This is an example of too much text.'}])).toThrow(/too fast/)
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
