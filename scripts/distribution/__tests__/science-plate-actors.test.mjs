import {describe,it,expect} from 'vitest'
import {SCIENCE_PLATE_MOTIFS,renderSciencePlateActor} from '../science-plate-actors.mjs'
import {renderR809VisualActor} from '../r809-visual-actors.mjs'
import {renderVerticalVideoSceneSvg} from '../render-vertical-video-package.mjs'

const scene = motif => ({
  beatId: 'vitamin-a-research-01',
  role: 'finding',
  motionType: 'reveal',
  visualScene: 'evidence',
  scienceIllustration: {motif,subject:'Vitamin A',sourceId:'NIH-ODS-A'},
  factualAuthority:'NIH-ODS-A',
  onScreenText:'Vitamin A supports normal vision',
  voiceover:'Vitamin A supports normal vision.',
  colorTreatment:'primaryDark',
})
const shot={id:'example-cinematic-dna',parallax:{far:{x:3,y:2},mid:{x:6,y:-4},near:{x:9,y:5}}}
describe('EvidenceMotion reusable science teaching plates',()=>{
 it('renders six genuinely different, sourced physical teaching objects',()=>{
  expect(SCIENCE_PLATE_MOTIFS).toEqual(['retina','nerve-blood','collagen','calcium-bone','membrane','clotting'])
  const rendered=SCIENCE_PLATE_MOTIFS.map(motif=>{
   const svg=renderSciencePlateActor(scene(motif),{x:96,y:640,width:700,height:570,shot})
   expect(svg).toContain('data-ths-science-plate="'+motif+'"')
   expect(svg).toContain('data-science-plate-source="NIH-ODS-A"')
   expect(svg).toContain('data-cinematic-dna="example-cinematic-dna"')
   expect(svg).toContain('data-depth-plane="far"')
   expect(svg).toContain('data-depth-plane="mid"')
   expect(svg).toContain('data-depth-plane="near"')
   expect(svg).toContain('REVIEW_ONLY_NOT_PUBLICATION_APPROVED')
   return svg
  })
  expect(new Set(rendered).size).toBe(6)
 })
 it('uses the existing R8.14 director and motion phase in the canonical R8.09 actor',()=>{
  const s=scene('collagen')
  const opts={x:96,y:640,width:700,height:570,foreground:'#fffdf7',background:'#1f4a3a'}
  const a=renderR809VisualActor(s,{...opts,motionPhase:'pre'})
  const b=renderR809VisualActor(s,{...opts,motionPhase:'post'})
  expect(a).not.toBe(b)
  expect(a).toContain('data-science-plate-source="NIH-ODS-A"')
  expect(b).toContain('data-science-plate-motion-phase="post"')
  expect(b).toContain('data-cinematic-dna=')
 })
 it('reuses the actual governed scene SVG path, not a side generator',()=>{
  const rendered=renderVerticalVideoSceneSvg(scene('retina'),{
   creativeMethodRelease:'R8.09',
   sourceUrl:'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/',
   contentHash:'a'.repeat(64),
   disclosure:'Educational content. No medical advice.',
  })
  expect(rendered.width).toBe(1080)
  expect(rendered.height).toBe(1920)
  expect(rendered.svg).toContain('data-ths-science-plate="retina"')
  expect(rendered.svg).toContain('data-science-plate-source="NIH-ODS-A"')
  expect(rendered.svg).toContain('data-r809-visual-scene="evidence"')
 })
 it('rejects claims without the scene authority and never makes a release decision',()=>{
  expect(()=>renderSciencePlateActor({...scene('retina'),factualAuthority:'other'},
    {x:96,y:640,width:700,height:570,shot})).toThrow(/factual authority/)
  expect(()=>renderSciencePlateActor({...scene('retina'),voiceover:''},
    {x:96,y:640,width:700,height:570,shot})).toThrow(/factual authority/)
  expect(()=>renderSciencePlateActor(scene('invented-brain-scan'),
    {x:96,y:640,width:700,height:570,shot})).toThrow(/Unapproved/)
  expect(()=>renderSciencePlateActor(scene('retina'),
    {x:96,y:640,width:700,height:100,shot})).toThrow(/mobile/)
  const s=scene('retina')
  s.scienceIllustration.subject='A & B "trial"'
  const svg=renderSciencePlateActor(s,{x:96,y:640,width:700,height:570,shot})
  expect(svg).toContain('A &amp; B &quot;trial&quot;')
  expect(svg).not.toContain('A & B "trial"')
 })
})
