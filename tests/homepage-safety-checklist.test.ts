import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('homepage safety checklist capture', () => {
  it('keeps the owned-audience conversion surface on the homepage', () => {
    const page = read('app/page.tsx')
    const capture = read('components/HomepageEmailCapture.tsx')

    expect(page).toContain("import HomepageEmailCapture from '@/components/HomepageEmailCapture'")
    expect(page).toContain('<HomepageEmailCapture />')
    expect(capture).toContain("location='homepage-safety-checklist'")
    expect(capture).toContain("variant='editorial'")
    expect(capture).toContain('Get the free 5-point supplement safety checklist')
    expect(capture).toContain('Send me the checklist')
  })
})
