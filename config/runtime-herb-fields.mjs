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
  'raw_mechanisms',
  'canonical_mechanisms',
  'mechanism_categories',
  'mechanism_classes',
  'mechanism_target_systems',
  'mechanism_normalization_status',
  'unmapped_mechanisms',
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
  'evidence_design_match',
  'evidence_risk_of_bias',
  'evidence_consistency',
  'evidence_rationale',
  'trial_design_insight',
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


  // Semantic ecosystem intelligence
  'topic_clusters',
  'ecosystem_tags',
  'pathway_companions',
  'comparison_candidates',
  'synergy_relationships',
  'authority_supernode',
  'semantic_neighbors',
  'ecosystem_anchors',
  'related_topics',
  'pathway_ecosystems',
  'mechanism_ecosystems',
  'authority_score',
  'evidence_authority_status',
  'authority_status',
  'clusters',
  'herb_internal_link_cluster',
  'semantic_ready',

  // Search / discovery
  'tags',
  'keywords',

  // Affiliate/runtime product display
  'affiliate_ready',
  'affiliate_url',
  'affiliate_label',
  'affiliate_query',
  'default_product_type',
  'preferred_vendor_url',
  'affiliate_url_template',
  'amazon_affiliate_url',
  'iherb_affiliate_url',
  'fallback_url',
  'product_cta',
  'buying_criteria',

  // Content freshness
  'last_updated',
  'last_reviewed',

  // Runtime gating / SEO
  'doNotMonetize',
  'doNotPromote',
  'governance_status',
  'legal_status',
  'controlled_status',
  'controlled_schedule',
  'dea_status',
  'dea_watchlist_status',
  'regulatory_status',
  'profile_status',
  'summary_quality',
  'runtime_export_decision',
  'visibility_tier',
  'robots',
  'sitemap_included',
  'indexability_status',
  'indexability_score',
  'indexability_reasons',
  'meta_title',
  'meta_description',
  'featured',
  'controlled_substance',
  'legal_status',
]
