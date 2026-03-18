# Resend subscribe endpoint setup

This project includes a Vercel serverless endpoint at `/api/subscribe`.

## What it does

- Accepts `POST` requests with JSON body: `{ "email": "you@example.com" }`
- Validates email input
- Sends a confirmation email through Resend
- Returns a JSON success/error response

## Required environment variables (Vercel)

Set these in **Vercel → Project Settings → Environment Variables**:

- `RESEND_API_KEY` - your Resend API key

## API file

- `api/subscribe.ts` handles the secure backend request.
- The frontend never receives the Resend key.

## Frontend URL configuration

Set the Vite frontend env var so GitHub Pages can call your Vercel backend:

```bash
VITE_SUBSCRIBE_API_URL=https://your-vercel-project.vercel.app/api/subscribe
```

Then update your GitHub Pages deployment so this variable is available at build time.

## Quick deployment checklist

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. In Vercel, add `RESEND_API_KEY`.
4. Deploy and copy your production URL (for example `https://your-vercel-project.vercel.app`).
5. Set `VITE_SUBSCRIBE_API_URL` in your frontend build environment to `https://your-vercel-project.vercel.app/api/subscribe`.
6. Redeploy the frontend.
7. Submit a test email and verify a `200` response from the Vercel endpoint.
