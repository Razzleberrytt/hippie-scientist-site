import { directR814Shot, auditR814ShotVariety } from '../r814-cinematic-director.mjs'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { renderR809VisualActor, R809_VISUAL_STAGES, CINEMATIC_LOOK } from '../r809-visual-actors.mjs'
import { renderVerticalVideoSceneSvg } from '../render-vertical-video-package.mjs'
import { assertNoDecorativeVideoChrome } from '../evidencemotion-delivery-guardrails.mjs'

const canvas = { x: 70, y: 540, width: 820, height: 560, foreground: '#dffef3', background: '#07202e' }

describe('CinematicDNA original shot identity and repetition controls', () => {
  it('is deterministic for the same evidence and changes when the story changes', () => {
    const basic={visualScene:'evidence',beatId:'hook',role:'hook',
      onScreenText:'Frequency of kratom use',compositionFamily:'evidence-focus'}
    const a=directR814Shot(basic)
    const b=directR814Shot(basic)
    const c=directR814Shot({...basic,onScreenText:'Comparison of dose amounts'})
    expect(a).toEqual(b)
    expect(a.id).toMatch(/^[a-f0-9]{16}$/)
    expect(a.id).not.toBe(c.id)
    expect(a.generatedScientificClaims).toBe(false)
    expect(a.inventedResearchValues).toBe(false)
    expect(a.camera).toMatch(/^(macro-push|orbital-drift|arc-reveal|diagonal-dolly)$/)
    expect(Math.abs(a.parallax.near.x)).toBeGreaterThan(Math.abs(a.parallax.far.x))
  })

  it('does not reuse the exact same static direction for a series of unrelated scenes', () => {
    const scenes=[
      {visualScene:'compare',role:'hook',beatId:'hook',onScreenText:'Frequency versus amount'},
      {visualScene:'evidence',role:'finding',beatId:'finding',onScreenText:'Observational survey'},
      {visualScene:'uncertainty',role:'limitation',beatId:'limit',onScreenText:'Association is not causation'},
    ]
    const result=auditR814ShotVariety(scenes)
    expect(result).toMatchObject({total:3,uniqueLooks:3,authorialVariation:true,scientificValuesGenerated:false})
    expect(result.identity).toMatch(/^[a-f0-9]{64}$/)
    expect(() => auditR814ShotVariety([scenes[0],scenes[0]])).toThrow(/repeated adjacent/)
  })
})

describe('EvidenceMotion R8.14 cinematic 2.5D craft regression', () => {
  it('renders 7 distinct narrated science objects with depth, light and occlusion', () => {
    expect(R809_VISUAL_STAGES).toHaveLength(7)
    expect(CINEMATIC_LOOK).toBe('ths-cinematic-2p5d-v1')
    const unique = new Set()
    for (const visualScene of R809_VISUAL_STAGES) {
      const svg = renderR809VisualActor({ visualScene }, { ...canvas, motionPhase:'post' })
      const pre = renderR809VisualActor({ visualScene }, { ...canvas, motionPhase:'pre' })
      expect(svg).toContain('data-evidencemotion-look="ths-cinematic-2p5d-v1"')
      expect(svg).toContain('data-depth-plane="far"')
      expect(svg).toContain('data-depth-plane="mid"')
      expect(svg).toContain('data-depth-plane="near"')
      expect(svg).toContain('data-art-object=')
      expect(svg).toContain('<radialGradient')
      expect(svg).toContain('<linearGradient')
      expect(svg).not.toContain('SCIENCE / SIGNAL / CONTEXT')
      expect(pre).not.toBe(svg)
      expect(pre).toContain('data-r809-visual-phase="pre"')
      expect(svg).toContain('data-r809-visual-phase="post"')
      expect(assertNoDecorativeVideoChrome('<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>')).toBe(true)
      unique.add(svg)
    }
    expect(unique.size).toBe(7)
  })

  it('rasterizes every cinematic SVG into nonblank differentiated frames with Sharp', async () => {
    const hashes = new Set()
    for (const visualScene of R809_VISUAL_STAGES) {
      const actor = renderR809VisualActor({visualScene}, {...canvas, motionPhase:'post'})
      const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280" viewBox="0 0 960 1280"><rect width="960" height="1280" fill="#071e30"/>${actor}</svg>`
      const {data,info} = await sharp(Buffer.from(scene)).resize(192,256).removeAlpha().raw().toBuffer({resolveWithObject:true})
      expect(info.channels).toBe(3)
      let active=0
      for(let i=0;i<data.length;i+=3) {
        if (Math.abs(data[i]-7)+Math.abs(data[i+1]-30)+Math.abs(data[i+2]-48)>54) active++
      }
      expect(active).toBeGreaterThan(110)
      hashes.add((await sharp(Buffer.from(scene)).resize(144,192).png().toBuffer()).toString('base64'))
    }
    expect(hashes.size).toBe(7)
  })

  it('marks the molecular-looking connectivity graphic as symbolic rather than chemical', () => {
    const svg = renderR809VisualActor({ visualScene:'molecule' }, canvas)
    expect(svg).toContain('data-art-object="symbolic-not-chemical-structure"')
    expect(svg).toContain('data-r809-symbolic-network="true"')
    expect(svg).not.toMatch(/7-hydroxymitragynine|CYP3A4|binding affinity|mg\/kg/i)
  })

  it('rejects arbitrary stages, invalid geometry and unapproved animation phases', () => {
    expect(() => renderR809VisualActor({ visualScene:'generic-slide' }, canvas)).toThrow(/illustration stage/)
    expect(() => renderR809VisualActor({ visualScene:'evidence' }, {...canvas,width:0})).toThrow(/positive viewport/)
    expect(() => renderR809VisualActor({ visualScene:'evidence' }, {...canvas,motionPhase:'unreviewed'})).toThrow(/pre\/post/)
  })

  it('survives integration through the governed semantic SVG renderer without replacing labels', () => {
    const scene={role:'limitation',beatId:'limit',visualScene:'uncertainty',
      onScreenText:'Survey cannot prove causation.',motionType:'hold',colorTreatment:'evidence',
      factualAuthority:'observational',compositionFamily:'evidence-focus',
      motifId:'evidence-thread',patternInterrupt:false}
    const svg=renderVerticalVideoSceneSvg(scene, {
      creativeMethodRelease:'R8.09',motionPhase:'post',
      sourceUrl:'https://pubmed.ncbi.nlm.nih.gov/38788532/',
      contentHash:'verified-test-packet',disclosure:'Educational research, not medical advice',
    }).svg
    expect(svg).toContain('data-evidencemotion-look="ths-cinematic-2p5d-v1"')
    expect(svg).toContain('Survey cannot prove')
    expect(svg).toContain('causation.')
    expect(svg).toContain('https://pubmed.ncbi.nlm.nih.gov/38788532/')
    expect(svg).toContain('Educational research, not medical advice')
    expect(svg).not.toContain('SCIENCE / SIGNAL / CONTEXT')
  })
})
