import { describe,it,expect } from 'vitest'
import { auditR811ZeroCredits, inspectR811GenerationSource } from '../r811-zero-credit-audit.mjs'
import { r811HookPreviewFfmpegArgs } from '../r811-hook-preview-mp4.mjs'

describe('EvidenceMotion R8.11 bootstrapping/no-metered-generation gates',()=>{
  it('audits every declared local R8.11 generation entrypoint',()=>{
    expect(auditR811ZeroCredits()).toMatchObject({passed:true,filesAudited:8})
  })
  it('refuses paid imports and direct provider/API network integrations',()=>{
    expect(inspectR811GenerationSource('bad.mjs',"import Client from 'openai'")).toContain(
      'bad.mjs imports an unapproved, potentially metered generation package: openai')
    expect(inspectR811GenerationSource('bad.mjs','await fetch("https://api.example.com")').join(' ')).toMatch(/network fetch/)
    expect(inspectR811GenerationSource('bad.mjs','const k=process.env.OPENAI_API_KEY').join(' ')).toMatch(/credential/)
  })
  it('prototypes exact three-second offline, silent, watermarked A/B clips',()=>{
    const args=r811HookPreviewFfmpegArgs({pngPath:'/tmp/test.png',outputPath:'/tmp/draft.mp4'})
    expect(args).toContain('-an')
    expect(args.slice(args.indexOf('-t')+1,args.indexOf('-t')+2)).toEqual(['3'])
    expect(args).toContain('libx264')
    expect(()=>r811HookPreviewFfmpegArgs({pngPath:'https://provider.example/img',outputPath:'/tmp/a.mp4'})).toThrow(/local/)
    expect(()=>r811HookPreviewFfmpegArgs({pngPath:'/tmp/a.png',outputPath:'/tmp/b.mp4',duration:9})).toThrow(/three-second/)
  })
})
