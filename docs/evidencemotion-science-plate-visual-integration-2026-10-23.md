# EvidenceMotion science-plate teaching objects — October 23, 2026

**Status: implementation candidate / REVIEW ONLY.** The vitamin montage showed that large, recognizable biological illustrations, distinct accent colors and subject framing read more clearly than generic floating objects. This change ports that visual treatment into the existing R8.09/R8.14 cinematic actor, **not** into a second video-production system.

## Reviewed scene example

~~~json
{
  "id": "vitamin-a",
  "role": "finding",
  "narration": "Vitamin A helps support normal vision.",
  "onScreenText": "Vitamin A: normal vision",
  "factualAuthority": "NIH-ODS-A",
  "r809": {
    "visualScene": "evidence",
    "scienceIllustration": {
      "motif": "retina",
      "subject": "Vitamin A",
      "sourceId": "NIH-ODS-A"
    }
  }
}
~~~

Supported motifs: **retina**, **nerve-blood**, **collagen**, **calcium-bone**, **membrane**, and **clotting**.

The science-plate sourceId must equal the same narrated scene's existing factualAuthority. Unrecognized motifs, unsigned authority and missing narration are rejected. Symbolic teaching geometry is not measured anatomy, a clinical outcome, a dose recommendation, or evidence that extra supplementation benefits healthy people. Human scientific review still determines whether each illustration is accurate for the specific reviewed statement.

R8.14 cinematic shot direction and three native art planes are reused. The existing R8.09/R8.10 voice-owned before/after phases govern the visuals. Extra mobile artwork space does not move the disclosure or dedicated source card. The existing source ledger, word-caption, R8.17/R8.18 native-frame/telemetry, phone/art/craft and publication gates remain unchanged.

## Verify

~~~bash
npx vitest run scripts/distribution/__tests__/science-plate-actors.test.mjs
~~~

The prior independent vitamin video is an artistic reference, NOT proof that EvidenceMotion generated it. This integration is not an excellent-first-pass acceptance, a published master, or a completed canonical workcard. Protected exact-head CI and owner review remain mandatory.
