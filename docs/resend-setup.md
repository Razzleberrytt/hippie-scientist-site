# Form endpoint setup (current model)

Canonical deployment for this repository is Netlify static hosting.

## Current form flow

All user-facing forms (newsletter, contact, lead capture) submit JSON to the URL configured in:

- `VITE_FORM_ENDPOINT`

If `VITE_FORM_ENDPOINT` is not set, forms show an error and do not fake a success state.

## Payload shape

Client submissions include:

- `formType` (`newsletter`, `contact`, `lead-capture`)
- `email`
- optional metadata fields (`name`, `subject`, `message`, `source`, `context`, `pagePath`)
- `submittedAt` timestamp

## Legacy endpoint note

- `api/subscribe.ts` is still present as a legacy serverless handler sample.
- It is **not** a canonical deploy dependency for the Netlify static flow.
- Use it only if you explicitly deploy on a platform that serves `/api/*` functions and point `VITE_FORM_ENDPOINT` at that route.
