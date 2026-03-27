# Form endpoint setup (current model)

Canonical deployment for this repository is Netlify static hosting.

## Current form flow

All user-facing forms (newsletter, contact, lead capture) submit JSON to the URL configured in:

- `VITE_FORM_ENDPOINT`

If `VITE_FORM_ENDPOINT` is not set, forms show an error and do not fake a success state.

## Payload shape

Client submissions include:

- `formType` (`newsletter`, `contact`, `lead-capture`)
- `email` (normalized to lowercase and trimmed)
- optional metadata fields (`name`, `subject`, `message`, `source`, `context`, `pagePath`)
- `submittedAt` timestamp

## Local testing expectations

Use any request inspector endpoint (webhook.site, Beeceptor, RequestBin, etc.) as
`VITE_FORM_ENDPOINT` during local development.

Expected behavior:

- HTTP `2xx`: success state is shown.
- HTTP non-`2xx` or network failure: error state is shown.
- Honeypot filled: error state is shown and request is blocked.
- Missing `VITE_FORM_ENDPOINT`: error state is shown (no optimistic success).

## Legacy endpoint note

- `api/subscribe.ts` is still present as a legacy serverless handler sample.
- It is **not** a canonical deploy dependency for the Netlify static flow.
- Use it only if you explicitly deploy on a platform that serves `/api/*` functions and point `VITE_FORM_ENDPOINT` at that route.
