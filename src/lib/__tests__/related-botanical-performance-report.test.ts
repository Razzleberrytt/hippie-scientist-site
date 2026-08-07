import { describe, expect, it } from 'vitest'
import { buildRelatedBotanicalPerformance } from '@/lib/atlasAnalyticsReport'

describe('Related Botanicals analytics report', () => {
  it('deduplicates repeated impressions and computes CTR/depth by card', () => {
    const events = [
      {
        type: 'related_botanicals_shown',
        slug: 'ashwagandha',
        item: 'rhodiola~1~10~explicit-effect|compound-class,kava~2~8~explicit-effect',
        context: 'session:s1;depth:1;reason_types:compound-class|explicit-effect',
      },
      {
        type: 'related_botanicals_shown',
        slug: 'ashwagandha',
        item: 'rhodiola~1~10~explicit-effect|compound-class,kava~2~8~explicit-effect',
        context: 'session:s1;depth:1;reason_types:compound-class|explicit-effect',
      },
      {
        type: 'related_botanical_click',
        slug: 'ashwagandha',
        item: 'rhodiola',
        context: 'session:s1;position:1;score:10;reason_types:explicit-effect|compound-class;profile_depth:2',
      },
      {
        type: 'related_botanicals_shown',
        slug: 'ashwagandha',
        item: 'rhodiola~1~10~explicit-effect|compound-class,kava~2~8~explicit-effect',
        context: 'session:s2;depth:1;reason_types:compound-class|explicit-effect',
      },
    ]

    const report = buildRelatedBotanicalPerformance(events)
    const rhodiola = report.cardRows.find((row) => row.targetSlug === 'rhodiola')
    expect(rhodiola).toMatchObject({ impressions: 2, clicks: 1, position: 1 })
    expect(rhodiola?.ctr).toBe(0.5)
    expect(rhodiola?.averageClickDepth).toBe(2)
    expect(rhodiola?.deepExplorationRate).toBe(0)
    expect(report.attributedImpressions).toBe(4)
    expect(report.attributedClicks).toBe(1)
  })

  it('attributes reason types per card and ranks deeper exploration first', () => {
    const events = [
      {
        type: 'related_botanicals_shown', slug: 'a',
        item: 'b~1~9~compound|explicit-effect,c~2~7~explicit-effect',
        context: 'session:s1;depth:1;reason_types:compound|explicit-effect',
      },
      {
        type: 'related_botanical_click', slug: 'a', item: 'b',
        context: 'session:s1;position:1;score:9;reason_types:compound|explicit-effect;profile_depth:3',
      },
      {
        type: 'related_botanicals_shown', slug: 'a',
        item: 'b~1~9~compound|explicit-effect,c~2~7~explicit-effect',
        context: 'session:s2;depth:1;reason_types:compound|explicit-effect',
      },
      {
        type: 'related_botanical_click', slug: 'a', item: 'c',
        context: 'session:s2;position:2;score:7;reason_types:explicit-effect;profile_depth:2',
      },
    ]

    const report = buildRelatedBotanicalPerformance(events)
    const compound = report.reasonRows.find((row) => row.reasonType === 'compound')
    const effect = report.reasonRows.find((row) => row.reasonType === 'explicit-effect')

    expect(compound).toMatchObject({ impressions: 2, clicks: 1, deepExplorationRate: 1 })
    expect(effect).toMatchObject({ impressions: 4, clicks: 2, deepExplorationRate: 0.5 })
    expect(report.reasonRows[0]?.reasonType).toBe('compound')
  })

  it('excludes events without a session id', () => {
    const report = buildRelatedBotanicalPerformance([
      { type: 'related_botanicals_shown', slug: 'a', item: 'b~1~9~compound', context: 'depth:1' },
      { type: 'related_botanical_click', slug: 'a', item: 'b', context: 'position:1;profile_depth:2' },
    ])

    expect(report.attributedImpressions).toBe(0)
    expect(report.attributedClicks).toBe(0)
    expect(report.unattributedEvents).toBe(2)
  })
})
