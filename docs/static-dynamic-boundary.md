# Static-Dynamic Architecture Boundary

This document outlines the architectural boundary of **The Hippie Scientist** website. It is designed to ensure our deployment to Cloudflare Pages remains production-reliable, contractor-maintainable, and regression-resistant.

## Core Rules

1. **Static-Only Frontend (`app/` directory)**
   - The entire Next.js application is built using Next.js static export (`output: "export"`).
   - All page components, layouts, templates, and utilities must compile to pure, static HTML/JS/CSS assets at build time.
   - Any dynamic or request-time server APIs (e.g., `cookies()`, `headers()`, `draftMode()`, `unstable_noStore()`) are **strictly forbidden** inside the `app/` directory and will fail CI checks.
   - Standard static `GET` route handlers (e.g., for generating feeds or sitemaps) are permitted *only* if they do not require request-time dynamic evaluation.

2. **Dynamic Behavior (`functions/` directory)**
   - Any dynamic API logic, form handlers, database queries, and backend integrations must reside inside the Cloudflare Pages Functions directory (`functions/`).
   - These run directly on the Cloudflare Edge using Cloudflare Workers.
   - Cloudflare Pages bindings (such as KV namespaces, D1 databases, or environment variables) are available in `functions/` but not in `app/`.

---

## Allowed vs. Forbidden in `app/`

### ❌ Forbidden (Fails CI)
- Non-static route handlers like `app/api/route.ts` that export `POST`, `PUT`, `DELETE`, or `PATCH`.
- Server actions (`"use server"`).
- Dynamic Next.js headers or cookie reads:
  ```ts
  import { cookies, headers } from 'next/headers' // Forbidden!
  ```
- Dynamic rendering configs:
  ```ts
  export const dynamic = 'force-dynamic' // Forbidden!
  ```
- Request-time cache bypasses:
  ```ts
  import { unstable_noStore } from 'next/cache' // Forbidden!
  ```

###  Allowed
- Static Page Router pages and directories.
- Client components (`"use client"`) that fetch data at runtime from `/api/...` endpoints.
- Static `GET` route handlers that write static payloads at build time.

---

## Accessing Dynamic APIs from Client Components

To communicate with Cloudflare Pages Functions, client components must perform standard `fetch` requests pointing to the path mapped by the `functions/` folder structure.

### Example: Calling the Email Subscription Endpoint

#### 1. Define the Endpoint in `functions/api/subscribe.ts`
```ts
export const onRequestPost: PagesFunction = async (context) => {
  const body = await context.request.json();
  // ... process request ...
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
```

#### 2. Call the Endpoint from `app/` Client Component
```tsx
'use client'

import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Enter your email"
        required 
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  )
}
```

## CI Enforcement
We enforce this boundary using:
- `npm run verify:prebuild` which runs `scripts/ci/validate-static-export-compatibility.mjs`.
- If you introduce a forbidden import or configuration in `app/`, the build will automatically fail.
