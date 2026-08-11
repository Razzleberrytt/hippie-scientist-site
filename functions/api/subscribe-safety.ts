import { onRequest as subscribe } from './subscribe'

type SubscribeContext = Parameters<typeof subscribe>[0]
type SafetySignupEnv = SubscribeContext['env'] & {
  MAILCHIMP_SAFETY_CHECKLIST_TAG?: string
}

/**
 * Generic site-wide safety-checklist signup.
 *
 * Reuses the hardened /api/subscribe implementation (origin checks, Turnstile,
 * rate limiting, Mailchimp upsert) while preventing its legacy ADHD tag from
 * being stamped onto generic subscribers. If a dedicated safety-checklist tag
 * is configured, feed it through the existing tag-writing path.
 */
export const onRequest = async (context: SubscribeContext): Promise<Response> => {
  const env = context.env as SafetySignupEnv
  const safetyTag = env.MAILCHIMP_SAFETY_CHECKLIST_TAG?.trim()

  return subscribe({
    ...context,
    env: {
      ...env,
      MAILCHIMP_ADHD_TAG: safetyTag || undefined,
    },
  })
}
