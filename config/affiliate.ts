// Centralised affiliate tag config
// Override via environment variables in production. Treat blank/whitespace
// values as unset so CI/CD systems that materialize missing variables as an
// empty string cannot silently erase affiliate attribution.
const amazonAffiliateTag = process.env.AMAZON_AFFILIATE_TAG?.trim() || 'razzleberry02-20'

export const AFFILIATE_TAGS = {
  amazon: amazonAffiliateTag,
} as const
