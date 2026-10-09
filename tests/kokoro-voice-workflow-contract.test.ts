import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const workflow = readFileSync('.github/workflows/kokoro-voice-production.yml', 'utf8')

describe('Kokoro recovery workflow fails closed', () => {
  it('applies the canonical R8.05 creative gate before expensive dependencies', () => {
    const gate = workflow.indexOf('assertR805CreativeBrief(brief)')
    const dependencyInstall = workflow.indexOf('Install required no-credit voice dependencies')
    expect(gate).toBeGreaterThan(0)
    expect(dependencyInstall).toBeGreaterThan(gate)
    expect(workflow).toContain('Kokoro requires at least two narrated semantic beats')
  })

  it('checks actual PCM signal, not only the hash, duration or metadata', () => {
    expect(workflow).toContain("wav.getsampwidth()==2")
    expect(workflow).toContain("wav.readframes(wav.getnframes())")
    expect(workflow).toContain('peak>=0.03 and rms>=0.005 and active>=0.01')
    expect(workflow).toContain('Voice receipt signal mismatch')
    expect(workflow).toContain('Silent/near-silent Kokoro audio blocked')
  })

  it('keeps exact Kokoro identity and human final-master review', () => {
    expect(workflow).toContain("obj['engine']['model']=='Kokoro-82M'")
    expect(workflow).toContain("obj['engine']['voice']=='am_michael'")
    expect(workflow).toContain('HF_HUB_DISABLE_XET')
    expect(workflow).toContain("sha('narration.wav')")
    expect(workflow).not.toMatch(/elevenlabs|descript\.com/i)
  })
})
