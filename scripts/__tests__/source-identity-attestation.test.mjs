import { describe, expect, it } from 'vitest'
import {
  compareCandidateToCrossref,
  compareCandidateToPubmed,
  normalizeDoi,
  titleTokenSimilarity,
} from '../lib/source-identity-attestation.mjs'

describe('source identity attestation', () => {
  it('accepts punctuation-only title drift and normalized DOI forms', () => {
    const candidate = {
      pmid: '40622698',
      doi: 'https://doi.org/10.1001/JAMAINTERNMED.2025.2366',
      title: 'Cannabidiol and Liver Enzyme Level Elevations in Healthy Adults: A Randomized Clinical Trial',
      publicationYear: 2025,
      canonicalUrl: 'https://pubmed.ncbi.nlm.nih.gov/40622698/',
    }
    const entry = {
      uid: '40622698',
      title: 'Cannabidiol and Liver Enzyme Level Elevations in Healthy Adults: A Randomized Clinical Trial.',
      sortpubdate: '2025/07/07 00:00',
      articleids: [{ idtype: 'doi', value: '10.1001/jamainternmed.2025.2366' }],
    }
    expect(compareCandidateToPubmed(candidate, entry)).toMatchObject({ ok: true, issues: [] })
  })

  it('rejects the confirmed fake CBD PMID/title/DOI tuple', () => {
    const candidate = {
      pmid: '39211820',
      doi: '10.1186/cpr.2024.11820',
      title: 'Cannabidiol safety and drug-interaction profile: a systematic review of clinical and post-marketing evidence.',
      publicationYear: 2024,
      canonicalUrl: 'https://pubmed.ncbi.nlm.nih.gov/39211820/',
    }
    const resolved = {
      uid: '39211820',
      title: 'Associations of Major Lifetime and Everyday Discrimination with Cognitive Function among Middle-Aged and Older Adults.',
      sortpubdate: '2024/01/01 00:00',
      articleids: [{ idtype: 'doi', value: '10.18865/EthnDis-2023-42' }],
    }
    const result = compareCandidateToPubmed(candidate, resolved)
    expect(result.ok).toBe(false)
    expect(result.issues.join(' ')).toMatch(/title mismatch/i)
    expect(result.issues.join(' ')).toMatch(/DOI mismatch/i)
  })

  it('rejects the confirmed fake CBD pharmacology PMID/title/DOI tuple', () => {
    const candidate = {
      pmid: '40621044',
      doi: '10.1016/j.molnpharm.2025.07.004',
      title: 'Cannabidiol pharmacology and metabolite atlas: receptor-level and pathway-level synthesis.',
      publicationYear: 2025,
    }
    const resolved = {
      uid: '40621044',
      title: 'Ultrasonic-Assisted Impregnation as an Efficient Tool for the Manufacture of Cu-Containing Faujasite as an Active Catalyst for the Oxidation of Cyclohexene.',
      sortpubdate: '2025/06/30 00:00',
      articleids: [{ idtype: 'doi', value: '10.1021/acsomega.5c01797' }],
    }
    expect(compareCandidateToPubmed(candidate, resolved).ok).toBe(false)
  })

  it('rejects the confirmed fake flavonoids PMID/title/DOI tuple', () => {
    const candidate = {
      pmid: '39044112',
      doi: '10.1093/nte/ntae014',
      title: 'Safety signals and interaction liabilities of dietary flavonoids: systematic review and meta-analysis.',
      publicationYear: 2024,
    }
    const resolved = {
      uid: '39044112',
      title: 'Implementation of a Consultative Medication Teaching Clinic in an Academic Child and Adolescent Psychiatry Outpatient Clinic.',
      sortpubdate: '2024/07/22 00:00',
      articleids: [{ idtype: 'doi', value: '10.1007/s40596-024-02016-3' }],
    }
    expect(compareCandidateToPubmed(candidate, resolved).ok).toBe(false)
  })

  it('normalizes DOI URLs and refuses unrelated titles despite generic review words', () => {
    expect(normalizeDoi('DOI: 10.1000/ABC')).toBe('10.1000/abc')
    expect(titleTokenSimilarity('CBD systematic review', 'Medication clinic systematic review')).toBeLessThan(0.72)
  })

  it('can attest DOI-only candidates against Crossref metadata', () => {
    const candidate = {
      doi: '10.1002/mnfr.202300727',
      title: 'Dietary Flavonoids Consumption and Health: An Umbrella Review',
      publicationYear: 2024,
    }
    const payload = {
      message: {
        DOI: '10.1002/mnfr.202300727',
        title: ['Dietary Flavonoids Consumption and Health: An Umbrella Review'],
        published: { 'date-parts': [[2024, 6, 1]] },
      },
    }
    expect(compareCandidateToCrossref(candidate, payload)).toMatchObject({ ok: true, issues: [] })
  })
})
