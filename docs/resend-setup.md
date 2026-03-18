# Resend subscribe endpoint setup

This project now includes a minimal serverless endpoint at `/api/subscribe`.

## What it does

- Accepts `POST` requests with JSON body: `{ "email": "you@example.com" }`
- Validates the email format
- Sends a notification email through Resend to the site owner
- Returns an error response if validation fails or the server is not configured

## Required environment variables

Set these in your hosting provider (for example, Vercel Project Settings → Environment Variables):

- `RESEND_API_KEY` - your Resend API key
- `RESEND_FROM_EMAIL` - verified sender (for example: `The Hippie Scientist <newsletter@yourdomain.com>`)
- `RESEND_TO_EMAIL` - destination inbox for captured emails

## Local development

Create a local env file for Vercel functions (for example `.env.local`) and add:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL="The Hippie Scientist <newsletter@yourdomain.com>"
RESEND_TO_EMAIL=owner@yourdomain.com
```

## Frontend behavior

`EmailCapture` still:

- Stores emails in `localStorage`
- Allows CSV export from `localStorage`
- Downloads `blend-guide.txt`

Additionally, it now sends a non-blocking `POST /api/subscribe` request and logs failures without breaking the UI.
