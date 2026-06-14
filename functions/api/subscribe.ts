interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

type Env = {
  MAILCHIMP_API_KEY?: string
  MAILCHIMP_API_SERVER?: string
  MAILCHIMP_LIST_ID?: string
  MAILCHIMP_SERVER_PREFIX?: string
  MAILCHIMP_AUDIENCE_ID?: string
  MAILCHIMP_ADHD_TAG?: string
  RATE_LIMIT_KV?: KVNamespace
  TURNSTILE_SECRET_KEY?: string
}

type PagesFunctionContext = {
  request: Request
  env: Env
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MD5_SHIFT_AMOUNTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]
const MD5_CONSTANTS = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0)

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function rotateLeft(value: number, amount: number): number {
  return (value << amount) | (value >>> (32 - amount))
}

function addUnsigned(a: number, b: number): number {
  return (a + b) >>> 0
}

function md5Cycle(state: number[], block: number[]): void {
  let [a, b, c, d] = state

  for (let i = 0; i < 64; i += 1) {
    let f: number
    let g: number

    if (i < 16) {
      f = (b & c) | (~b & d)
      g = i
    } else if (i < 32) {
      f = (d & b) | (~d & c)
      g = (5 * i + 1) % 16
    } else if (i < 48) {
      f = b ^ c ^ d
      g = (3 * i + 5) % 16
    } else {
      f = c ^ (b | ~d)
      g = (7 * i) % 16
    }

    const next = d
    d = c
    c = b
    b = addUnsigned(
      b,
      rotateLeft(
        addUnsigned(addUnsigned(a, f), addUnsigned(MD5_CONSTANTS[i], block[g])),
        MD5_SHIFT_AMOUNTS[i],
      ),
    )
    a = next
  }

  state[0] = addUnsigned(state[0], a)
  state[1] = addUnsigned(state[1], b)
  state[2] = addUnsigned(state[2], c)
  state[3] = addUnsigned(state[3], d)
}

function md5Hex(value: string): string {
  const bytes = Array.from(new TextEncoder().encode(value))
  const bitLength = bytes.length * 8
  bytes.push(0x80)

  while (bytes.length % 64 !== 56) {
    bytes.push(0)
  }

  for (let i = 0; i < 8; i += 1) {
    bytes.push(Math.floor(bitLength / 2 ** (8 * i)) & 0xff)
  }

  const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]

  for (let i = 0; i < bytes.length; i += 64) {
    const block: number[] = []
    for (let j = 0; j < 64; j += 4) {
      block.push(bytes[i + j] | (bytes[i + j + 1] << 8) | (bytes[i + j + 2] << 16) | (bytes[i + j + 3] << 24))
    }
    md5Cycle(state, block)
  }

  return state
    .flatMap((word) => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff])
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function basicAuth(apiKey: string): string {
  return `Basic ${btoa(`user:${apiKey}`)}`
}

function maskEmail(email: string): string {
  const parts = email.split('@')
  if (parts.length !== 2) return '***'
  const [local, domain] = parts
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }
  return `${local.slice(0, 2)}***@${domain}`
}

async function verifyTurnstile(token: string, secretKey: string, ip?: string): Promise<boolean> {
  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    const outcome = await result.json() as { success: boolean }
    return outcome.success
  } catch (err) {
    console.error('Turnstile verification error:', err)
    return false
  }
}

async function checkRateLimit(ip: string, kv?: KVNamespace): Promise<boolean> {
  if (!kv) return true // Graceful fallback if KV is not bound

  const key = `rate-limit:${ip}`
  let data: { count: number; reset: number } | null = null

  try {
    const val = await kv.get(key)
    if (val) {
      data = JSON.parse(val)
    }
  } catch (err) {
    console.error('Failed to read rate limit from KV:', err)
    return true // Fallback to allow request if KV is down
  }

  const now = Date.now()
  if (!data || now > data.reset) {
    data = { count: 1, reset: now + 600000 } // 10 minutes reset window
  } else {
    data.count += 1
  }

  if (data.count > 5) {
    return false
  }

  try {
    const expirationTtl = Math.max(60, Math.ceil((data.reset - now) / 1000))
    await kv.put(key, JSON.stringify(data), { expirationTtl })
  } catch (err) {
    console.error('Failed to write rate limit to KV:', err)
  }

  return true
}

export const onRequest = async ({ request, env }: PagesFunctionContext): Promise<Response> => {
  // 1. Method Validation
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405)
  }

  // 2. Content-Type Validation
  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.includes('application/json')) {
    return jsonResponse({ ok: false, error: 'Unsupported Content-Type. Expected application/json.' }, 415)
  }

  // 3. Body Size Limit
  const contentLengthHeader = request.headers.get('Content-Length')
  if (contentLengthHeader && parseInt(contentLengthHeader, 10) > 10240) {
    return jsonResponse({ ok: false, error: 'Request body too large.' }, 413)
  }

  const text = await request.text()
  if (text.length > 10240) {
    return jsonResponse({ ok: false, error: 'Request body too large.' }, 413)
  }

  // 4. JSON parsing and structured fields check
  let body: { email?: unknown; firstName?: unknown; magnet?: unknown; confirmEmail?: unknown; turnstileToken?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400)
  }

  // 5. Honeypot check
  if (body.confirmEmail) {
    console.warn('Honeypot triggered by bot submission.')
    return jsonResponse({ ok: true, message: 'Subscribed successfully.' }, 200)
  }

  // 6. Origin / Referer Validation
  const origin = request.headers.get('Origin')
  const referer = request.headers.get('Referer')
  const isLocalDev = request.url.includes('localhost') || request.url.includes('127.0.0.1')

  if (!isLocalDev) {
    if (origin) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.hostname !== 'thehippiescientist.net' && originUrl.hostname !== 'www.thehippiescientist.net') {
          return jsonResponse({ ok: false, error: 'Invalid origin.' }, 403)
        }
      } catch {
        return jsonResponse({ ok: false, error: 'Malformed Origin.' }, 403)
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.hostname !== 'thehippiescientist.net' && refererUrl.hostname !== 'www.thehippiescientist.net') {
          return jsonResponse({ ok: false, error: 'Invalid referer.' }, 403)
        }
      } catch {
        return jsonResponse({ ok: false, error: 'Malformed Referer.' }, 403)
      }
    } else {
      return jsonResponse({ ok: false, error: 'Origin or referer header is required.' }, 403)
    }
  }

  // 7. Rate Limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
  const rateLimitOk = await checkRateLimit(clientIp, env.RATE_LIMIT_KV)
  if (!rateLimitOk) {
    return jsonResponse({ ok: false, error: 'Too many requests. Please try again later.' }, 429)
  }

  // 8. Turnstile Token verification (optional, when secret key is defined)
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim()
  if (turnstileSecret) {
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
    const verified = await verifyTurnstile(turnstileToken, turnstileSecret, clientIp)
    if (!verified) {
      return jsonResponse({ ok: false, error: 'Security verification failed.' }, 400)
    }
  }

  const apiKey = env.MAILCHIMP_API_KEY?.trim()
  const serverPrefix = (env.MAILCHIMP_API_SERVER || env.MAILCHIMP_SERVER_PREFIX)?.trim()
  const audienceId = (env.MAILCHIMP_LIST_ID || env.MAILCHIMP_AUDIENCE_ID)?.trim()
  const adhdTag = env.MAILCHIMP_ADHD_TAG?.trim()

  if (!apiKey || !serverPrefix || !audienceId || !adhdTag) {
    console.error('Mailchimp subscription is missing required environment variables:', {
      MAILCHIMP_API_KEY: Boolean(apiKey),
      MAILCHIMP_API_SERVER: Boolean(serverPrefix),
      MAILCHIMP_LIST_ID: Boolean(audienceId),
      MAILCHIMP_ADHD_TAG: Boolean(adhdTag),
    })
    return jsonResponse({ ok: false, error: 'Email subscription is not configured.' }, 500)
  }

  // 9. Input normalization
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const magnet = typeof body.magnet === 'string' ? body.magnet.trim() : ''

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ ok: false, error: 'Enter a valid email address.' }, 400)
  }

  // 10. Mailchimp Integration
  const subscriberHash = md5Hex(email)
  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`
  const headers = {
    Authorization: basicAuth(apiKey),
    'Content-Type': 'application/json',
  }

  const mergeFields: Record<string, string> = {}
  if (firstName) mergeFields.FNAME = firstName

  console.log(`Subscribing masked email: ${maskEmail(email)}`)

  try {
    const memberResponse = await fetch(baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        ...(Object.keys(mergeFields).length > 0 ? { merge_fields: mergeFields } : {}),
      }),
    })

    if (!memberResponse.ok) {
      const detail = await memberResponse.json().catch(() => null) as { detail?: string; title?: string } | null
      console.error('Mailchimp API Error:', detail?.detail || detail?.title || 'Unknown Error')
      // Sanitize upstream errors
      return jsonResponse({ ok: false, error: 'Could not subscribe this email right now. Please try again.' }, 500)
    }

    const tagResponse = await fetch(`${baseUrl}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tags: [{ name: adhdTag, status: 'active' }],
      }),
    })

    if (!tagResponse.ok) {
      const detail = await tagResponse.json().catch(() => null) as { detail?: string; title?: string } | null
      console.error('Mailchimp Tagging Error:', detail?.detail || detail?.title || 'Unknown Error')
      // Sanitize upstream errors
      return jsonResponse({ ok: false, error: 'Could not complete subscription registration. Please try again.' }, 500)
    }

    return jsonResponse({ ok: true, magnet })
  } catch (error) {
    console.error('Subscription error:', error)
    return jsonResponse({ ok: false, error: 'Could not reach email service. Please try again.' }, 502)
  }
}
