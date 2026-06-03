export async function searchClinicalTrials(compoundSlug, limiter) {
  if (limiter) {
    await limiter.take()
  }

  return {
    source: 'clinicaltrials',
    compound_slug: compoundSlug,
    retrieved_at: new Date().toISOString(),
    trials: [
      {
        title: `Clinical trial metadata related to ${compoundSlug}`,
        metadata_only: true,
      },
    ],
  }
}
