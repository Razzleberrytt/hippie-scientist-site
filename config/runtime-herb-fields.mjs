/**
 * Runtime-safe herb export contract.
 *
 * Keep this list minimal and frontend-facing only. These fields are safe to emit
 * into production JSON generated from the workbook.
 */
export const HERB_RUNTIME_FIELDS = [
  // Core identity / routing
  'id',
  'slug',
  'name',
  'latin_name',
  'common_names',
  'aliases',

  // Frontend presentation
  'summary',
  'short_description',
  'description',
  'hero',
  'hero_subtitle',
  'core_insight',
  'card_blurb',

  // Effects / category display
  'effects',
  'primary_effects',
  'secondary_effects',
  'category',
  'functional_categories',
  'traditional_uses',

  // Mechanisms / relationships
  'mechanism',
  'mechanisms',
  'mechanism_targets',
  'compound_profile',
  'active_constituents',
  'related_compounds',
  'related_herbs',
  'pathways',

  // Evidence / safety display
  'evidence',
  'evidence_grade',
  'evidence_level',
  'evidence_tier',
  'evidence_summary',
  'human_evidence',
  'research_status',
  'safety',
  'safety_confidence',
  'contraindications',
  'interactions',
  'side_effects',
  'caution_signals',
  'pregnancy_warning',

  // Usage / forms / protocols
  'dosage',
  'typical_dosage',
  'forms',
  'available_forms',
  'best_taken',
  'bioavailability_notes',
  'stacking_notes',
  'protocols',
  'conditions',
  'synergies',

  // Search / discovery
  'tags',
  'keywords',

  // Affiliate/runtime product display
  'affiliate_ready',
  'affiliate_query',
  'default_product_type',
  'preferred_vendor_url',
  'affiliate_url_template',
  'amazon_affiliate_url',
  'iherb_affiliate_url',
  'fallback_url',
  'product_cta',
  'buying_criteria',

  // Runtime gating / SEO
  'profile_status',
  'summary_quality',
  'runtime_export_decision',
  'visibility_tier',
  'robots',
  'sitemap_included',
  'meta_title',
  'meta_description',
]