# Welcome Email Sequence

The canonical welcome sequence lives in `content/emailWelcomeSequence.ts`. That typed manifest is the source of truth for order, cadence, subject/preview copy, body copy, destinations, and campaign attribution. This document describes the operating contract rather than duplicating email copy that can drift.

## Sequence contract

| Email | Timing | Purpose | Primary destination |
| --- | ---: | --- | --- |
| 1 | Immediately | Deliver the promised supplement safety checklist | `/info/supplement-safety-checklist/` |
| 2 | Day 1 | Explain what evidence grades do and do not mean | `/info/methodology/` |
| 3 | Day 3 | Show how to evaluate a supplement label | `/learn/product-quality/` |
| 4 | Day 5 | Demonstrate the Safety Checker | `/safety-checker/` |
| 5 | Day 8 | Introduce the strongest research resources | `/evidence/evidence-report/` |
| 6 | Day 11 | Demonstrate a high-value evidence/safety comparison | `/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/` |
| 7 | Day 14 | Invite readers to choose research interests | `/info/newsletter/#research-interests` |

## Editorial rules

- The sequence is evidence-first and educational; it must not become a disguised product funnel.
- Email 1 must deliver the promised resource before asking for anything else.
- Evidence grades and mechanism language must keep their limitations visible.
- Trial doses, safety warnings, and medication context must not be converted into personalized medical instructions.
- Email 7 asks only for content interests (Sleep, Stress, Anxiety, Focus, or General research), not symptoms, diagnoses, medications, or other health information.
- Product or affiliate links are not part of the canonical welcome sequence. If a later commercial campaign is created, it must use the site affiliate-disclosure and safety gates independently.
- Every primary and secondary site link in the canonical sequence carries `utm_source=newsletter`, `utm_medium=email`, `utm_campaign=welcome_sequence`, and an email-number `utm_content` value so return traffic can be measured without placing email addresses in URLs.

## Provider implementation

The repository owns the content contract; the email provider owns delivery timing. Provider automation should mirror the seven `delayDays` values from `content/emailWelcomeSequence.ts` rather than maintaining a second handwritten schedule.

When provider automation is changed, validate that all seven purposes still exist exactly once and that Email 1 remains immediate. The Vitest contract in `content/__tests__/emailWelcomeSequence.test.ts` guards those invariants.
