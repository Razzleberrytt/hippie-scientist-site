import { describe, it, expect, vi } from 'vitest'
import { generateDetailMetadata, herbJsonLd, compoundJsonLd } from '../seo'

describe('SEO Metadata & JSON-LD Utilities', () => {
  const mockHerb = {
    name: 'Ashwagandha',
    slug: 'ashwagandha',
    summary: 'Ashwagandha is an adaptogenic herb. It is commonly used to reduce stress and anxiety.',
    evidenceLevel: 'strong',
    safetyNotes: 'Avoid using during pregnancy.',
    primary_effects: ['Anxiolytic', 'Stress Reduction'],
    runtime_export_decision: 'show',
    profile_status: 'complete',
    summary_quality: 'high',
  }

  const mockCompound = {
    name: 'L-Theanine',
    slug: 'l-theanine',
    summary: 'L-Theanine is an amino acid analog found in tea. It promotes relaxation without drowsiness.',
    evidenceLevel: 'moderate',
    safetyNotes: 'Well tolerated at typical doses.',
    compoundClass: 'Amino Acid',
    runtime_export_decision: 'show',
    profile_status: 'complete',
    summary_quality: 'high',
  }

  describe('generateDetailMetadata', () => {
    it('generates correct title, description, and alternates for a herb', () => {
      const meta = generateDetailMetadata(mockHerb, 'herb')

      expect(meta.title).toContain('Ashwagandha')
      expect(meta.title).toContain('Evidence-Based Guide')
      expect(meta.description).toContain('Ashwagandha is an adaptogenic herb.')
      expect(meta.description).toContain('Rated with strong')
      expect(meta.description).toContain('Review safety and drug interactions before use.')
      expect(meta.alternates?.canonical).toBe('https://www.thehippiescientist.net/herbs/ashwagandha')
    })

    it('generates correct metadata for a compound', () => {
      const meta = generateDetailMetadata(mockCompound, 'compound')

      expect(meta.title).toContain('L Theanine')
      expect(meta.title).toContain('Evidence-Based Guide')
      expect(meta.alternates?.canonical).toBe('https://www.thehippiescientist.net/compounds/l-theanine')
    })

    it('sets robots to noindex if record is not indexable', () => {
      const draftHerb = {
        ...mockHerb,
        profile_status: 'draft',
        summary_quality: 'weak',
      }
      const meta = generateDetailMetadata(draftHerb, 'herb')

      expect(meta.robots).toEqual({
        index: false,
        follow: true,
      })
    })
  })

  describe('herbJsonLd', () => {
    it('returns a comprehensive MedicalWebPage JSON-LD schema', () => {
      const jsonLd = herbJsonLd({
        name: mockHerb.name,
        slug: mockHerb.slug,
        description: mockHerb.summary,
        evidenceGrade: 'Strong',
        safetyNotes: mockHerb.safetyNotes,
        primaryEffects: mockHerb.primary_effects,
      })

      expect(jsonLd['@type']).toContain('MedicalWebPage')
      expect(jsonLd.medicalAudience).toBe('Consumer')
      expect(jsonLd.about['@type']).toBe('MedicalTherapy')
      expect(jsonLd.about.evidenceLevel).toBe('Strong')
      expect(jsonLd.about.safetyWarnings).toBe(mockHerb.safetyNotes)
      expect(jsonLd.about.duplicateTherapy).toEqual(mockHerb.primary_effects)
    })
  })

  describe('compoundJsonLd', () => {
    it('returns a comprehensive MedicalWebPage schema for compounds', () => {
      const jsonLd = compoundJsonLd({
        name: mockCompound.name,
        slug: mockCompound.slug,
        description: mockCompound.summary,
        category: mockCompound.compoundClass,
        evidenceGrade: 'Moderate',
        safetyNotes: mockCompound.safetyNotes,
      })

      expect(jsonLd['@type']).toContain('MedicalWebPage')
      expect(jsonLd.about['@type']).toBe('ChemicalSubstance')
      expect(jsonLd.about.name).toBe(mockCompound.name)
      expect(jsonLd.about.description).toBe(mockCompound.compoundClass)
      expect(jsonLd.about.evidenceLevel).toBe('Moderate')
      expect(jsonLd.about.safetyWarnings).toBe(mockCompound.safetyNotes)
    })
  })
})
