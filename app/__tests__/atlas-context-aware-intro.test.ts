import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getAtlasLandingCopy } from '@/components/atlas/AtlasLandingContext'

const root = process.cwd()
const pageSource = readFileSync(join(root, 'app/tools/botanical-activity-atlas/page.tsx'), 'utf8')
const componentSource = readFileSync(join(root, 'src/components/atlas/AtlasLandingContext.tsx'), 'utf8')

describe('context-aware atlas landing intro', () => {
  it('provides distinct guidance for Anxiety, Sleep, and Focus arrivals', () => {
    expect(getAtlasLandingCopy('anxiety_hub')?.title).toContain('calming')
    expect(getAtlasLandingCopy('sleep_hub')?.title).toContain('sleep-oriented')
    expect(getAtlasLandingCopy('focus_hub')?.title).toContain('evidence')
  })

  it('stays hidden for direct, external, and unrelated arrivals', () => {
    expect(getAtlasLandingCopy('direct_or_external')).toBeNull()
    expect(getAtlasLandingCopy('editorial')).toBeNull()
    expect(getAtlasLandingCopy('herb_profile')).toBeNull()
  })

  it('explains active URL state and preserves clear next actions', () => {
    expect(componentSource).toContain('parseAtlasUrlState')
    expect(componentSource).toContain('Prefiltered atlas state')
    expect(componentSource).toContain('Best next step:')
    expect(componentSource).toContain("min-h-[44px]")
  })

  it('renders the intro before the comparison interface', () => {
    const introIndex = pageSource.indexOf('<AtlasLandingContext />')
    const atlasIndex = pageSource.indexOf('<BotanicalActivityAtlasClient records={herbs} />')

    expect(introIndex).toBeGreaterThan(-1)
    expect(atlasIndex).toBeGreaterThan(introIndex)
  })
})
