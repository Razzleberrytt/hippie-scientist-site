import { describe, it, expect } from 'vitest'
import { generateDetailMetadata, herbJsonLd, compoundJsonLd, isMeaningfulFaqAnswer, shouldIndexRoute } from '../seo'

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

      expect(meta.title).toBe('Ashwagandha Benefits, Dosage & Safety')
      expect(meta.description).toContain('Ashwagandha dosage ranges')
      expect(meta.description).toContain('Strong research evidence')
      expect(meta.alternates?.canonical).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
    })

    it('generates correct metadata for a compound', () => {
      const meta = generateDetailMetadata(mockCompound, 'compound')

      expect(meta.title).toBe('L-Theanine: Effects, Dose and Safety')
      expect(meta.description).toContain('L-Theanine dosage by use case')
      expect(meta.alternates?.canonical).toBe('https://thehippiescientist.net/compounds/l-theanine/')
    })

    it('prefers a manual meta_title / meta_description when present', () => {
      const meta = generateDetailMetadata(
        { ...mockHerb, meta_title: 'Custom Ashwagandha Title', meta_description: 'Custom description override.' },
        'herb',
      )

      expect(meta.title).toBe('Custom Ashwagandha Title')
      expect(meta.description).toBe('Custom description override.')
    })

    it('uses meta_title and meta_description overrides if provided', () => {
      const overrideHerb = {
        ...mockHerb,
        meta_title: 'Hand-authored Ashwagandha Title Override',
        meta_description: 'Hand-authored Ashwagandha Description override.',
      }
      const meta = generateDetailMetadata(overrideHerb, 'herb')

      expect(meta.title).toBe('Hand-authored Ashwagandha Title Override')
      expect(meta.description).toBe('Hand-authored Ashwagandha Description override.')
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

    it('honors explicit publish policy for generated profile pages', () => {
      const decision = shouldIndexRoute('/herbs/echinacea-purpurea', {
        slug: 'echinacea-purpurea',
        profile_status: 'partial',
        indexability_status: 'PUBLISH',
        robots: 'index,follow',
        sitemap_included: true,
        summary: 'Short generated summary.',
      })

      expect(decision).toMatchObject({
        index: true,
        follow: true,
        reason: 'indexability-policy-publish',
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
      // Effects no longer mis-mapped to duplicateTherapy (wrong schema.org semantics).
      expect((jsonLd.about as Record<string, unknown>).duplicateTherapy).toBeUndefined()
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

    it('upgrades to MolecularEntity when molecular identifiers are present', () => {
      const jsonLd = compoundJsonLd({
        name: 'Apigenin',
        slug: 'apigenin',
        molecularFormula: 'C15H10O5',
        casNumber: '520-36-5',
        pubchemCid: 5280443,
      })

      expect(jsonLd.about['@type']).toEqual(['MolecularEntity', 'ChemicalSubstance'])
      expect(jsonLd.about.molecularFormula).toBe('C15H10O5')
      expect(jsonLd.about.sameAs).toContain('https://pubchem.ncbi.nlm.nih.gov/compound/5280443')
    })
  })

  describe('isMeaningfulFaqAnswer', () => {
    it('rejects short and boilerplate answers, accepts substantive ones', () => {
      expect(isMeaningfulFaqAnswer('See dosing guidelines and product labeling.')).toBe(false)
      expect(isMeaningfulFaqAnswer('Too short.')).toBe(false)
      expect(
        isMeaningfulFaqAnswer(
          'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.',
        ),
      ).toBe(false)
      expect(
        isMeaningfulFaqAnswer(
          'Ashwagandha is typically dosed at 300 to 600 mg of a standardized root extract once or twice daily with food.',
        ),
      ).toBe(true)
    })
  })
})
