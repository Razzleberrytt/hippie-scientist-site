// Centralised affiliate tag config
// Override via environment variables in production

export const AFFILIATE_TAGS = {
  amazon: process.env.AMAZON_AFFILIATE_TAG ?? 'dev-affiliate-00',
} as const
