import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const herbComponent = fs.readFileSync(
  path.join(process.cwd(), 'components', 'seo', 'HerbCompoundLinks.tsx'),
  'utf8',
)
const compoundComponent = fs.readFileSync(
  path.join(process.cwd(), 'components', 'seo', 'CompoundSourceHerbs.tsx'),
  'utf8',
)
const herbPage = fs.readFileSync(
  path.join(process.cwd(), 'app', 'herbs', '[slug]', 'page.tsx'),
  'utf8',
)
const compoundPage = fs.readFileSync(
  path.join(process.cwd(), 'app', 'compounds', '[slug]', 'page.tsx'),
  'utf8',
)

describe('profile discovery resolved-record reuse', () => {
  it('passes the already-resolved herb into HerbCompoundLinks while retaining fallback resolution', () => {
    expect(herbPage).toContain(
      '<HerbCompoundLinks herbSlug={herb.slug} herbName={displayName} herb={herbRecord as RuntimeRecord} />',
    )
    expect(herbComponent).toContain('herb?: RuntimeRecord | null')
    expect(herbComponent).toContain(
      'resolvedHerb ? Promise.resolve(resolvedHerb) : getHerbBySlug(herbSlug)',
    )
  })

  it('passes the already-resolved compound into CompoundSourceHerbs while retaining fallback resolution', () => {
    expect(compoundPage).toContain(
      '<CompoundSourceHerbs compoundSlug={compound.slug} compoundName={displayName} compound={compound as RuntimeRecord} />',
    )
    expect(compoundComponent).toContain('compound?: RuntimeRecord | null')
    expect(compoundComponent).toContain(
      'resolvedCompound ? Promise.resolve(resolvedCompound) : getCompoundBySlug(compoundSlug)',
    )
  })
})
