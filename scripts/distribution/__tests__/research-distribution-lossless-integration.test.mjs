import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const normalizeSentence = (value) => {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ')
  return /[.!?]$/.test(text) ? text : `${text}.`
}

describe('canonical research distribution lossless integration', () => {
  it('emits a validated lossless creative spec from the canonical generator', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-distribution-lossless-'))
    try {
      execFileSync(process.execPath, ['scripts/distribution/build-research-distribution.mjs'], {
        cwd: process.cwd(),
        env: { ...process.env, DISTRIBUTION_OUTPUT: outDir },
        stdio: 'pipe',
      })

      const objects = JSON.parse(fs.readFileSync('data/distribution/research-objects.json', 'utf8'))
      const source = objects.find((object) => object.id === 'ashwagandha-stress-evidence')
      const generated = JSON.parse(fs.readFileSync(path.join(outDir, 'ashwagandha-stress-evidence.json'), 'utf8'))
      const spec = generated.creativeSpec

      expect(spec.claimSafetyStatus).toBe('validated-lossless')
      expect(spec.status).not.toBe('blocked-unsafe-truncation')
      expect(spec.carousel.slides.filter((slide) => slide.role === 'finding').map((slide) => slide.headline).join(' ')).toBe(normalizeSentence(source.finding))
      expect(spec.carousel.slides.filter((slide) => slide.role === 'limitation').map((slide) => slide.headline).join(' ')).toBe(normalizeSentence(source.limitation))
      expect(spec.verticalVideo.rendererContract.factualScenesMustBeDerivedFromLosslessCopyPlan).toBe(true)
      expect(spec.guardrails.losslessGovernedCopyRequired).toBe(true)
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true })
    }
  })
})
