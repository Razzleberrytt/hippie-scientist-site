import { describe, expect, it } from 'vitest'
import {
  buildSearchGovernanceArtifact,
  renderSearchGovernanceMarkdown,
} from '../search-opportunity-governance'

describe('Search Console governance report', () => {
  it('classifies intent, flags unambiguous wrong URLs, and tracks page-set stability', () => {
    const current = {
      generatedAt: '2026-08-15T00:00:00.000Z',
      pages: [],
      queries: [
        {
          query: 'magnesium glycinate vs citrate',
          clicks: 5,
          impressions: 100,
          position: 8,
          pages: ['/herbs/magnesium/', '/guides/compare/magnesium-glycinate-vs-citrate/'],
          competingPages: 2,
        },
        {
          query: 'ashwagandha dosage',
          clicks: 4,
          impressions: 80,
          position: 7,
          pages: ['/herbs/ashwagandha/'],
          competingPages: 1,
        },
      ],
    }
    const previous = {
      pages: [],
      queries: [
        {
          query: 'magnesium glycinate vs citrate',
          clicks: 2,
          impressions: 60,
          position: 10,
          pages: ['/guides/compare/magnesium-glycinate-vs-citrate/'],
          competingPages: 1,
        },
      ],
    }

    const report = buildSearchGovernanceArtifact({
      current,
      previous,
      intentMap: {
        'magnesium glycinate vs citrate': '/guides/compare/magnesium-glycinate-vs-citrate/',
        'ashwagandha dosage': '/guides/ashwagandha-dosage/',
      },
      generatedAt: '2026-08-15T01:00:00.000Z',
    })

    const comparison = report.queries.find((row) => row.query.startsWith('magnesium'))!
    const dosage = report.queries.find((row) => row.query.startsWith('ashwagandha'))!

    expect(comparison.intent).toBe('comparison')
    expect(comparison.cannibalized).toBe(true)
    expect(comparison.mismatch).toBe(false)
    expect(comparison.pageSetStability).toBe(0.5)
    expect(comparison.actions).toContain('differentiate-or-consolidate-competing-pages')
    expect(comparison.actions).toContain('query-to-page-instability-after-release')

    expect(dosage.intent).toBe('dose')
    expect(dosage.mismatch).toBe(true)
    expect(dosage.mismatchReason).toBe('single-wrong-url')
  })

  it('flags CTR underperformers but protects winning metadata experiments', () => {
    const report = buildSearchGovernanceArtifact({
      current: {
        pages: [
          { url: '/guides/sleep/magnesium-for-sleep/', impressions: 1000, clicks: 10, position: 5 },
          { url: '/weak-page/', impressions: 1000, clicks: 10, position: 5 },
        ],
        queries: [],
      },
      experiments: [
        {
          id: 'exp-1',
          url: '/guides/sleep/magnesium-for-sleep/',
          startedAt: '2026-08-01',
          titleBefore: 'Old title',
          titleAfter: 'Winning title',
          baselineCtr: 0.02,
          resultCtr: 0.04,
          status: 'won',
        },
      ],
    })

    const protectedPage = report.pages.find((row) => row.url.includes('magnesium-for-sleep'))!
    const weakPage = report.pages.find((row) => row.url === '/weak-page/')!

    expect(protectedPage.underperforming).toBe(true)
    expect(protectedPage.preserveMetadata).toBe(true)
    expect(protectedPage.rewriteEligible).toBe(false)
    expect(weakPage.rewriteEligible).toBe(true)
    expect(report.summary.metadataProtected).toBe(1)
    expect(report.summary.metadataRewriteEligible).toBe(1)
  })

  it('renders a human-readable routing and CTR report without inventing a winner for multi-page queries', () => {
    const report = buildSearchGovernanceArtifact({
      current: {
        pages: [],
        queries: [
          {
            query: 'l theanine for sleep',
            clicks: 5,
            impressions: 100,
            position: 9,
            pages: ['/herbs/l-theanine/', '/guides/sleep/l-theanine-for-sleep/'],
            competingPages: 2,
          },
        ],
      },
      intentMap: { 'l theanine for sleep': '/guides/sleep/l-theanine-for-sleep/' },
    })

    const markdown = renderSearchGovernanceMarkdown(report)
    expect(markdown).toContain('Search Intent, Routing & CTR Governance')
    expect(markdown).toContain('Cannibalized queries: **1**')
    expect(markdown).toContain('without inventing a preferred-page distribution')
  })
})
