import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('magnesium intent and canonical boundary', () => {
  const sleepGuide = read('app/guides/sleep/magnesium-types-for-sleep/page.tsx')
  const generalGuide = read('app/guides/other/magnesium-types-guide/page.tsx')
  const redirects = read('public/_redirects')

  it('keeps the legacy cited article URL owned by the canonical sleep guide', () => {
    expect(redirects).toContain('/articles/magnesium-types-for-sleep /guides/sleep/magnesium-types-for-sleep/ 301')
    expect(redirects).toContain('/articles/magnesium-types-for-sleep/ /guides/sleep/magnesium-types-for-sleep/ 301')
    expect(sleepGuide).toContain("path: `/guides/sleep/${SLUG}`")
    expect(generalGuide).toContain("path: '/guides/other/magnesium-types-guide/'")
  })

  it('makes the sleep-specific versus general magnesium jobs reciprocal and explicit', () => {
    expect(sleepGuide).toContain('href="/guides/other/magnesium-types-guide/"')
    expect(sleepGuide).toContain('General Magnesium Types Guide')
    expect(generalGuide).toContain('href="/guides/sleep/magnesium-types-for-sleep/"')
    expect(generalGuide).toContain('Looking specifically for magnesium forms for sleep?')
    expect(generalGuide).toContain('This page compares magnesium forms across absorption and multiple human outcomes.')
  })

  it('does not turn the intent boundary into a new efficacy or superiority claim', () => {
    const boundary = generalGuide.slice(
      generalGuide.indexOf('Looking specifically for magnesium forms for sleep?'),
      generalGuide.indexOf('Compare magnesium forms for sleep →'),
    )
    expect(boundary).toContain('placebo efficacy, bioavailability and head-to-head superiority as separate questions')
    expect(boundary).not.toMatch(/best magnesium|proven superior|works better|treats insomnia/i)
  })
})
