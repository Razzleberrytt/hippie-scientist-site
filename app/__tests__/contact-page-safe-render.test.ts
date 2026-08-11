import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/info/contact/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('contact page safe rendering', () => {
  it('does not inject raw HTML to render the contact address', () => {
    const page = source()

    expect(page).not.toContain('dangerouslySetInnerHTML')
    expect(page).not.toContain('<!--email_off-->')
    expect(page).toContain("href='mailto:randolphwillie77@gmail.com'")
    expect(page).toContain('randolphwillie77@gmail.com')
  })

  it('keeps structured data on approved SEO components', () => {
    const page = source()

    expect(page).toContain('<AuthorityJsonLd')
    expect(page).toContain('<FaqJsonLd')
  })
})
