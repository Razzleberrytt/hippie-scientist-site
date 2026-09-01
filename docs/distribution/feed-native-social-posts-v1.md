# Feed-native social posts v1

The distribution engine should read like a useful social post first and a research artifact second, without weakening evidence governance.

## Publishing contract

For Facebook and Instagram distribution packages:

1. Open with a short curiosity-first hook written for a scrolling reader.
2. Keep the canonical research finding and limitation lossless after whitespace normalization.
3. Break governed multi-sentence copy into readable paragraphs rather than presenting it as an abstract.
4. Keep evidence type and grade visible, but do not lead with metadata.
5. Use the canonical first-party evidence page as the source in generated artifacts.
6. Use no more than three relevant hashtags.
7. Avoid generic CTAs such as “Read the evidence map”; use “Full evidence + sources” for feed copy.
8. Never add certainty, efficacy, superiority, dosing, or safety claims in a hook.

## Creative contract

Carousel covers, short-video openings, and thumbnail variants use the compact curiosity hook produced by `social-post-copy.mjs`. The hook is creative framing only. The governed finding, evidence grade, limitation, source, and disclosure remain immutable factual fields.

The first two seconds should answer the question “why should I keep watching?” rather than repeat the article title. Examples of permitted framing include:

- “What does [subject] actually do?”
- “Does [subject] hold up in human studies?”
- “[subject]: what actually changed?”
- “[subject]: what do the studies show?”

## Fail-closed rules

Generation must fail when the finding or limitation is dropped, the canonical source is missing, a hook exceeds the readability budget, more than three hashtags are emitted, or unsupported certainty enters the opening framing.

Metricool continues to consume the governed Instagram field from the generated distribution package, so improvements to this copy contract automatically propagate to Facebook/Instagram publication without a second independent caption generator.
