export async function searchPubMed(compoundSlug, limiter) {
  if (limiter) {
    await limiter.take()
  }

  return {
    source: 'pubmed',
    compound_slug: compoundSlug,
    retrieved_at: new Date().toISOString(),
    studies: [
      {
        title: `Human clinical evidence related to ${compoundSlug}`,
        metadata_only: true,
      },
    ],
  }
}
