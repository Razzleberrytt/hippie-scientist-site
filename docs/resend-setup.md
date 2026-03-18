# Resend subscribe endpoint setup

This project includes a Vercel serverless endpoint at `/api/subscribe`.

## What it does

- Accepts `POST` requests with JSON body: `{ "email": "you@example.com" }`
- Validates email input
- Sends a notification email through Resend
- Returns a JSON success/error response

## Required environment variables (Vercel)

Set these in **Vercel → Project Settings → Environment Variables**:

- `RESEND_API_KEY` - your Resend API key
- One destination inbox variable (pick one):
  - `RESEND_AUDIENCE_EMAIL` (preferred)
  - `RESEND_TO_EMAIL`
  - `OWNER_EMAIL`
  - `CONTACT_EMAIL`

The endpoint sends new signups to whichever destination variable is set first in the list above.

## API file

- `api/subscribe.ts` handles the secure backend request.
- The frontend never receives the Resend key.

## Frontend behavior

- `EmailCapture` posts to `/api/subscribe` after localStorage is updated.
- UI success/download flow stays intact even if the network request fails.

## Quick deployment checklist

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. In Vercel, add `RESEND_API_KEY`.
4. Add one destination variable (recommended: `RESEND_AUDIENCE_EMAIL`).
5. Deploy.
6. Submit a test email and verify the destination inbox receives subject `New Hippie Scientist signup`.
