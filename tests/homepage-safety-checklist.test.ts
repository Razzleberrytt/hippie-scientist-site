import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('homepage safety checklist capture', () => {
  it('renders one owned-audience conversion surface on the homepage', () => {
    const page = read('app/page.tsx')
    const footer = read('src/components/Footer.tsx')
    const signup = read('components/NewsletterSignup.tsx')

    expect(page).not.toContain("import HomepageEmailCapture from '@/components/HomepageEmailCapture'")
    expect(page).not.toContain('<HomepageEmailCapture />')
    expect(footer).toContain("location='global-footer'")
    expect(footer).toContain('Take the 5-question safety check before your next supplement')
    expect(footer).toContain('Send me the checklist')
    expect(signup).toContain("location === 'global-footer' && pathname === '/'")
    expect(signup).toContain("? 'homepage-safety-checklist' : location")
    expect(signup).toContain('data-signup-location={resolvedLocation}')
    expect(signup).toContain("name='SOURCE' value={resolvedLocation}")
    expect(signup).toContain('source: resolvedLocation')
    expect(signup).not.toContain('if (suppressOnHomepage) return null')
  })
})
