import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EvidenceBadge, { normalizeEvidenceTier } from '../EvidenceBadge'

describe('normalizeEvidenceTier', () => {
  it('maps tier-a strings to strong', () => {
    expect(normalizeEvidenceTier('Tier-A')).toBe('strong')
    expect(normalizeEvidenceTier('tier a')).toBe('strong')
    expect(normalizeEvidenceTier('a')).toBe('strong')
    expect(normalizeEvidenceTier('strong')).toBe('strong')
  })

  it('maps tier-b strings to moderate', () => {
    expect(normalizeEvidenceTier('Tier-B')).toBe('moderate')
    expect(normalizeEvidenceTier('tier b')).toBe('moderate')
    expect(normalizeEvidenceTier('b')).toBe('moderate')
    expect(normalizeEvidenceTier('moderate')).toBe('moderate')
  })

  it('maps tier-c / preliminary to early', () => {
    expect(normalizeEvidenceTier('Tier-C')).toBe('early')
    expect(normalizeEvidenceTier('preliminary')).toBe('early')
    expect(normalizeEvidenceTier('c')).toBe('early')
  })

  it('maps review/mixed/limited to review', () => {
    expect(normalizeEvidenceTier('mixed evidence')).toBe('review')
    expect(normalizeEvidenceTier('limited data')).toBe('review')
    expect(normalizeEvidenceTier('under review')).toBe('review')
  })

  it('returns unknown for null/undefined/empty', () => {
    expect(normalizeEvidenceTier(null)).toBe('unknown')
    expect(normalizeEvidenceTier(undefined)).toBe('unknown')
    expect(normalizeEvidenceTier('')).toBe('unknown')
  })
})

describe('EvidenceBadge', () => {
  it('renders strong tier label', () => {
    render(<EvidenceBadge tier="strong" />)
    expect(screen.getByText('Strong evidence')).toBeTruthy()
  })

  it('renders moderate tier label', () => {
    render(<EvidenceBadge tier="moderate" />)
    expect(screen.getByText('Moderate evidence')).toBeTruthy()
  })

  it('renders early tier label', () => {
    render(<EvidenceBadge tier="early" />)
    expect(screen.getByText('Early evidence')).toBeTruthy()
  })

  it('renders review label for review and unknown tiers', () => {
    const { rerender } = render(<EvidenceBadge tier="review" />)
    expect(screen.getByText('Evidence review')).toBeTruthy()

    rerender(<EvidenceBadge tier="unknown" />)
    expect(screen.getByText('Evidence review')).toBeTruthy()
  })

  it('renders custom label when provided', () => {
    render(<EvidenceBadge tier="strong" label="Tier A · 12 RCTs" />)
    expect(screen.getByText('Tier A · 12 RCTs')).toBeTruthy()
  })

  it('applies tooltip via title attribute', () => {
    render(<EvidenceBadge tier="moderate" tooltip="3 meta-analyses" />)
    const el = screen.getByTitle('3 meta-analyses')
    expect(el).toBeTruthy()
  })
})
