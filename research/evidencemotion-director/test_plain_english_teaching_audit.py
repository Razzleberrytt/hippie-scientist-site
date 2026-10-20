import unittest
from plain_english_teaching_audit import audit_public_text, spoken_section

class PlainEnglishTeachingRegression(unittest.TestCase):
    def test_realistic_beginner_chemistry_script_is_screened_not_approved(self):
        s=("An oxygen-and-hydrogen pair is called a hydroxyl group. "
           "This computer illustration shows one possible 3D shape, not a measurement. "
           "PubChem is a public chemistry database with a record number called a CID.")
        r=audit_public_text(s)
        self.assertEqual(r['status'],'SCREENED_FOR_NAMED_TERMS_ONLY')
        self.assertFalse(r['automaticApproval'])
        self.assertFalse(r['qualifiedScienceReviewed'])

    def test_unexplained_hydroxyl_is_flagged(self):
        self.assertTrue(any(x['term']=='hydroxyl'
                            for x in audit_public_text('The hydroxyl is responsible for the difference.')['flags']))

    def test_explained_hydroxyl_is_allowed(self):
        r=audit_public_text('An oxygen and hydrogen pair is called a hydroxyl group.')
        self.assertFalse(r['flags'])

    def test_undefined_pubchem_is_flagged(self):
        self.assertTrue(any(x['term']=='PubChem' for x in audit_public_text('Check PubChem.')['flags']))

    def test_defined_pubchem_is_allowed(self):
        self.assertFalse(audit_public_text('PubChem is a publicly available chemistry database.')['flags'])

    def test_receptor_needs_cell_explanation(self):
        self.assertTrue(audit_public_text('The receptor binds to something.')['flags'])
        self.assertFalse(audit_public_text('A receptor is a part of a cell that can respond to signals.')['flags'])

    def test_computer_3d_model_must_be_labelled_as_estimate(self):
        self.assertTrue(audit_public_text('A 3D model appears on screen.')['flags'])
        self.assertFalse(audit_public_text('A 3-D picture is one possible shape estimated by a computer.')['flags'])

    def test_conformer_can_be_taught_not_automatically_banned(self):
        self.assertFalse(audit_public_text('A conformer is one possible molecule shape from a computer.')['flags'])
        self.assertTrue(audit_public_text('The conformer proves it.')['flags'])

    def test_specialist_jargon_unexplained_is_flagged(self):
        self.assertTrue(audit_public_text('ETKDG, MMFF, and pharmacodynamics.')['flags'])

    def test_source_record_number_requires_definition(self):
        self.assertTrue(audit_public_text('Source CID 44301524')['flags'])
        self.assertFalse(audit_public_text('CID means the record number in a chemistry database.')['flags'])

    def test_drawing_cannot_prove_human_effects(self):
        self.assertTrue(any(x['reason']=='INFERRED_HUMAN_EFFECT_FROM_DIAGRAM'
                            for x in audit_public_text('This molecular picture proves safety.')['flags']))

    def test_molecule_picture_overclaim_is_rejected_too(self):
        r=audit_public_text('This molecule picture proves safety.')
        self.assertIn('INFERRED_HUMAN_EFFECT_FROM_DIAGRAM',
                      [x['reason'] for x in r['flags']])

    def test_only_spoken_section_is_scanned_not_internal_notes(self):
        md='## Suggested spoken script\nAn oxygen-and-hydrogen pair is called hydroxyl group.\n\n## Notes\nETKDG is in the developer notes.'
        self.assertNotIn('ETKDG',spoken_section(md))

    def test_our_actual_proposed_7oh_spoken_script_teaches_named_jargon(self):
        from pathlib import Path
        path=Path(__file__).with_name('7OH-PLAIN-ENGLISH-SCRIPT-PILOT-2026-10-13.md')
        content=spoken_section(path.read_text())
        report=audit_public_text(content)
        self.assertEqual(report['flags'],[],report)
        self.assertFalse(report['automaticApproval'])

    def test_missing_public_section_rejected(self):
        with self.assertRaisesRegex(ValueError,'PUBLIC_SPOKEN_SECTION_MISSING'):
            spoken_section('## Editorial notes\nNo public-facing draft yet.')

if __name__=='__main__':
    unittest.main()
