// Centralised affiliate tag config
// Override via environment variables in production. Treat blank/whitespace
// values as unset so CI/CD systems that materialize missing variables as an
// empty string cannot silently erase affiliate attribution.
const amazonAffiliateTag = process.env.AMAZON_AFFILIATE_TAG?.trim() || 'razzleberr0e2-20'
// One-time compatibility guard: an older GitHub/Cloudflare environment may still
// carry the retired Associates tag. Normalize only that known stale value while
// preserving normal environment-based rotation for any future tag.
const normalizedAmazonAffiliateTag = amazonAffiliateTag === 'razzleberry02-20'
  ? 'razzleberr0e2-20'
  : amazonAffiliateTag

export const AFFILIATE_TAGS = {
  amazon: normalizedAmazonAffiliateTag,
} as const
