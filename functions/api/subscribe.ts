type Env = {
  MAILCHIMP_API_KEY?: string
  MAILCHIMP_SERVER_PREFIX?: string
  MAILCHIMP_AUDIENCE_ID?: string
  MAILCHIMP_ADHD_TAG?: string
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

export const onRequest = async ({ request, env }: PagesFunctionContext): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405)
  }

  const apiKey = env.MAILCHIMP_API_KEY?.trim()
  const serverPrefix = env.MAILCHIMP_SERVER_PREFIX?.trim()
  const audienceId = env.MAILCHIMP_AUDIENCE_ID?.trim()
  const adhdTag = env.MAILCHIMP_ADHD_TAG?.trim()

  if (!apiKey || !serverPrefix || !audienceId || !adhdTag) {
    return jsonResponse({ ok: false, error: 'Email subscription is not configured.' }, 500)
  }

  let body: { email?: unknown; firstName?: unknown; magnet?: unknown }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400)
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const magnet = typeof body.magnet === 'string' ? body.magnet.trim() : ''

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ ok: false, error: 'Enter a valid email address.' }, 400)
  }

  const subscriberHash = md5Hex(email)
  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`
  const headers = {
    Authorization: basicAuth(apiKey),
    'Content-Type': 'application/json',
  }

  const mergeFields: Record<string, string> = {}
  if (firstName) mergeFields.FNAME = firstName

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
    return jsonResponse({ ok: false, error: detail?.detail || detail?.title || 'Mailchimp subscription failed.' }, memberResponse.status)
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
    return jsonResponse({ ok: false, error: detail?.detail || detail?.title || 'Mailchimp tagging failed.' }, tagResponse.status)
  }

  return jsonResponse({ ok: true, magnet })
}
