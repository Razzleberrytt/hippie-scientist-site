# Newsletter subscription security contract — #6987

Status: fix-forward preparation after merged PR #6989; not yet released.
Base: `cee73b9726dea4f74a5065719ef94344a69f7d50`.
Date: November 6, 2026 (US Eastern).

## Demonstrated gap

The retained research-interest form delegates to `EmailCaptureBox`. Its API
request contained email, magnet and source, but no `turnstileToken`.
`/api/subscribe-safety` delegates to the existing subscribe handler, which verifies
that token whenever a server secret is configured. Removing the competing
generic form made this older integration gap material to the sole signup path.
The earlier UI/payload tests did not cover the configured security widget.

## Correction

Reuse the existing `TurnstileWidget` for API-based forms. Disable and reject
submission without its token when configured, submit the token under the
existing backend field name, and clear/reset it after each attempt so failed
requests can retry with a fresh challenge. Keep research preferences, attribution,
provider routing and honeypot behavior intact. External form providers retain
their existing browser submission path.

Require both HTTP success and the API's explicit `ok: true` before showing or
tracking signup success. HTTP 200 with an unsuccessful or non-JSON body must not
be reported as a subscription. Error feedback uses an alert role.

No server security check, key, origin control, rate limit or consent gate is
changed. Public-key/secret configuration and real provider delivery are not
verified by mocked tests; no real subscription or email was sent.

## Validation and admission

- Seven focused suites / 62 tests passed, including the backend subscribe suite,
  all five newsletter choices, shared ownership, segmentation and nine new
  security/response cases.
- Changed-source lint and whitespace validation passed.
- Shared fast/security preflight and typecheck passed.
- Full production export, exact-head CI and hosted visual/performance checks:
  required before protected merge; not claimed by local tests.

This is the same active R #6987 finishing task, with a new bounded follow-up only
after PR #6989 was verified merged on main. The original release's deployment
run 42261222848 has since succeeded, including its exact production-receipt check;
this follow-up still needs its own release evidence. Preserve every unrelated held PR and use the sole
protected serialized controller after complete overlap/admission checks. This
does not add a second active implementation ticket or publication permission.
