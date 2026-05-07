/**
 * Runtime-safe compound export contract.
 *
 * Keep this list minimal and frontend-facing only. These fields are safe to emit
 * into production JSON generated from the workbook.
 */
export const COMPOUND_RUNTIME_FIELDS = [
  // Core identity / routing
  'id',
  'slug',
  'name',
  'aliases',

  // Frontend presentation
  'summary',
  'short_description',
  'description',
  'hero',
  'hero_subtitle',
  'core_insight',
  'card_blurb',

  // Classification / effects
  'compound_class',
  'source_type',
  'natural_sources',
  'effects',
  'primary_effects',
  'secondary_effects',
  'functional_categories',

  // Mechanisms / relationships
  'mechanism',
  'mechanisms',
  'mechanism_targets',
  'pathways',
  'receptor_targets',
  'biological_activity',
  'related_compounds',
  'related_herbs',

  // Evidence / safety
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

  // Pharmacology / usage
  'dosage',
  'typical_dosage',
  'forms',
  'available_forms',
  'bioavailability',
  'half_life',
  'absorption_notes',
  'metabolism',
  'stacking_notes',

  // Protocols / search
  'protocols',
  'conditions',
  'synergies',
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