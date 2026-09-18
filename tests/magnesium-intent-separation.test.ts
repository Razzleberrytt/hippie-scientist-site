import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const sleepForms = read('app/guides/sleep/magnesium-types-for-sleep/page.tsx')
const generalTypes = read('app/guides/other/magnesium-types-guide/page.tsx')
const sleepShortlist = read('app/guides/sleep/best-supplements-for-sleep/page.tsx')

describe('magnesium intent separation', () => {
  it('keeps the sleep-form and general-types routes as distinct canonical reader jobs', () => {
    expect(sleepForms).toContain("const SLUG = 'magnesium-types-for-sleep'")
    expect(sleepForms).toContain('path: `/guides/sleep/${SLUG}`')
    expect(generalTypes).toContain("path: '/guides/other/magnesium-types-guide/'")
    expect(sleepShortlist).toContain("alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' }")

    expect(generalTypes).not.toContain("path: '/guides/sleep/magnesium-types-for-sleep/'")
    expect(sleepForms).not.toContain("path: '/guides/other/magnesium-types-guide/'")
  })

  it('makes the broad-versus-sleep intent boundary explicit in both directions', () => {
    expect(sleepForms).toContain('href="/guides/other/magnesium-types-guide/"')
    expect(sleepForms).toContain('General Magnesium Types &amp; Absorption')

    expect(generalTypes).toContain('href="/guides/sleep/magnesium-types-for-sleep/"')
    expect(generalTypes).toContain('separate sleep-form reader job')
    expect(generalTypes).toContain('sleep outcomes distinct from general bioavailability comparisons')
  })

  it('routes form-comparison intent from the sleep shortlist to the specialized page', () => {
    expect(sleepShortlist).toContain('href="/guides/sleep/magnesium-types-for-sleep/"')
    expect(sleepShortlist).toContain('Compare magnesium forms for sleep')
  })
})
