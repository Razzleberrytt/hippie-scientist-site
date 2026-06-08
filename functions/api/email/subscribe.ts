interface Env {
  MAILCHIMP_API_KEY: string
  MAILCHIMP_AUDIENCE_ID: string
  MAILCHIMP_SERVER: string
}

// Pure-JS MD5 for CF Workers runtime (crypto.subtle doesn't support MD5).
// Implements RFC 1321. Needed for Mailchimp subscriber_hash computation.
function md5(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const len = bytes.length
  const numBlocks = Math.ceil((len + 9) / 64)
  const buf = new Uint32Array(numBlocks * 16)

  for (let i = 0; i < len; i++) {
    buf[i >> 2] |= bytes[i] << ((i & 3) << 3)
  }
  buf[len >> 2] |= 0x80 << ((len & 3) << 3)
  buf[numBlocks * 16 - 2] = len * 8

  function add(x: number, y: number): number {
    return (x + y) >>> 0
  }
  function rotl(n: number, s: number): number {
    return ((n << s) | (n >>> (32 - s))) >>> 0
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return add(rotl(add(add(a, q), add(x, t >>> 0)), s), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  for (let i = 0; i < buf.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d]
    const m = buf

    // Round 1
    a = ff(a,b,c,d, m[i+ 0], 7, 0xd76aa478); d = ff(d,a,b,c, m[i+ 1],12, 0xe8c7b756)
    c = ff(c,d,a,b, m[i+ 2],17, 0x242070db); b = ff(b,c,d,a, m[i+ 3],22, 0xc1bdceee)
    a = ff(a,b,c,d, m[i+ 4], 7, 0xf57c0faf); d = ff(d,a,b,c, m[i+ 5],12, 0x4787c62a)
    c = ff(c,d,a,b, m[i+ 6],17, 0xa8304613); b = ff(b,c,d,a, m[i+ 7],22, 0xfd469501)
    a = ff(a,b,c,d, m[i+ 8], 7, 0x698098d8); d = ff(d,a,b,c, m[i+ 9],12, 0x8b44f7af)
    c = ff(c,d,a,b, m[i+10],17, 0xffff5bb1); b = ff(b,c,d,a, m[i+11],22, 0x895cd7be)
    a = ff(a,b,c,d, m[i+12], 7, 0x6b901122); d = ff(d,a,b,c, m[i+13],12, 0xfd987193)
    c = ff(c,d,a,b, m[i+14],17, 0xa679438e); b = ff(b,c,d,a, m[i+15],22, 0x49b40821)

    // Round 2
    a = gg(a,b,c,d, m[i+ 1], 5, 0xf61e2562); d = gg(d,a,b,c, m[i+ 6], 9, 0xc040b340)
    c = gg(c,d,a,b, m[i+11],14, 0x265e5a51); b = gg(b,c,d,a, m[i+ 0],20, 0xe9b6c7aa)
    a = gg(a,b,c,d, m[i+ 5], 5, 0xd62f105d); d = gg(d,a,b,c, m[i+10], 9, 0x02441453)
    c = gg(c,d,a,b, m[i+15],14, 0xd8a1e681); b = gg(b,c,d,a, m[i+ 4],20, 0xe7d3fbc8)
    a = gg(a,b,c,d, m[i+ 9], 5, 0x21e1cde6); d = gg(d,a,b,c, m[i+14], 9, 0xc33707d6)
    c = gg(c,d,a,b, m[i+ 3],14, 0xf4d50d87); b = gg(b,c,d,a, m[i+ 8],20, 0x455a14ed)
    a = gg(a,b,c,d, m[i+13], 5, 0xa9e3e905); d = gg(d,a,b,c, m[i+ 2], 9, 0xfcefa3f8)
    c = gg(c,d,a,b, m[i+ 7],14, 0x676f02d9); b = gg(b,c,d,a, m[i+12],20, 0x8d2a4c8a)

    // Round 3
    a = hh(a,b,c,d, m[i+ 5], 4, 0xfffa3942); d = hh(d,a,b,c, m[i+ 8],11, 0x8771f681)
    c = hh(c,d,a,b, m[i+11],16, 0x6d9d6122); b = hh(b,c,d,a, m[i+14],23, 0xfde5380c)
    a = hh(a,b,c,d, m[i+ 1], 4, 0xa4beea44); d = hh(d,a,b,c, m[i+ 4],11, 0x4bdecfa9)
    c = hh(c,d,a,b, m[i+ 7],16, 0xf6bb4b60); b = hh(b,c,d,a, m[i+10],23, 0xbebfbc70)
    a = hh(a,b,c,d, m[i+13], 4, 0x289b7ec6); d = hh(d,a,b,c, m[i+ 0],11, 0xeaa127fa)
    c = hh(c,d,a,b, m[i+ 3],16, 0xd4ef3085); b = hh(b,c,d,a, m[i+ 6],23, 0x04881d05)
    a = hh(a,b,c,d, m[i+ 9], 4, 0xd9d4d039); d = hh(d,a,b,c, m[i+12],11, 0xe6db99e5)
    c = hh(c,d,a,b, m[i+15],16, 0x1fa27cf8); b = hh(b,c,d,a, m[i+ 2],23, 0xc4ac5665)

    // Round 4
    a = ii(a,b,c,d, m[i+ 0], 6, 0xf4292244); d = ii(d,a,b,c, m[i+ 7],10, 0x432aff97)
    c = ii(c,d,a,b, m[i+14],15, 0xab9423a7); b = ii(b,c,d,a, m[i+ 5],21, 0xfc93a039)
    a = ii(a,b,c,d, m[i+12], 6, 0x655b59c3); d = ii(d,a,b,c, m[i+ 3],10, 0x8f0ccc92)
    c = ii(c,d,a,b, m[i+10],15, 0xffeff47d); b = ii(b,c,d,a, m[i+ 1],21, 0x85845dd1)
    a = ii(a,b,c,d, m[i+ 8], 6, 0x6fa87e4f); d = ii(d,a,b,c, m[i+15],10, 0xfe2ce6e0)
    c = ii(c,d,a,b, m[i+ 6],15, 0xa3014314); b = ii(b,c,d,a, m[i+13],21, 0x4e0811a1)
    a = ii(a,b,c,d, m[i+ 4], 6, 0xf7537e82); d = ii(d,a,b,c, m[i+11],10, 0xbd3af235)
    c = ii(c,d,a,b, m[i+ 2],15, 0x2ad7d2bb); b = ii(b,c,d,a, m[i+ 9],21, 0xeb86d391)

    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od)
  }

  // Little-endian hex output
  return [a, b, c, d].map(n => {
    let s = ''
    for (let j = 0; j < 4; j++) {
      const byte = (n >>> (j * 8)) & 0xff
      s += ((byte >> 4) & 0xf).toString(16) + (byte & 0xf).toString(16)
    }
    return s
  }).join('')
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context

  let body: { email?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email address is required' }, { status: 400, headers: CORS_HEADERS })
  }

  const subscriberHash = md5(email)
  const apiKey = env.MAILCHIMP_API_KEY
  const audienceId = env.MAILCHIMP_AUDIENCE_ID
  const server = env.MAILCHIMP_SERVER

  if (!apiKey || !audienceId || !server) {
    return Response.json({ error: 'Email signup is not configured' }, { status: 503, headers: CORS_HEADERS })
  }

  const mailchimpUrl = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`

  const payload: Record<string, unknown> = {
    email_address: email,
    status_if_new: 'pending',
    tags: ['website-signup', 'email-capture'],
  }
  if (body.name) {
    const parts = String(body.name).trim().split(' ')
    payload.merge_fields = {
      FNAME: parts[0] ?? '',
      LNAME: parts.slice(1).join(' '),
    }
  }

  let mcResponse: Response
  try {
    mcResponse = await fetch(mailchimpUrl, {
      method: 'PUT',
      headers: {
        Authorization: `apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return Response.json({ error: 'Could not reach email service' }, { status: 502, headers: CORS_HEADERS })
  }

  if (!mcResponse.ok) {
    const detail = await mcResponse.json().catch(() => ({})) as Record<string, unknown>
    const title = String(detail.title ?? '')
    // Treat already-confirmed members as success
    if (title === 'Member Exists' || mcResponse.status === 409) {
      return Response.json({ success: true, alreadySubscribed: true }, { headers: CORS_HEADERS })
    }
    return Response.json(
      { error: String(detail.detail ?? 'Subscription failed. Please try again.') },
      { status: 500, headers: CORS_HEADERS }
    )
  }

  return Response.json({ success: true }, { headers: CORS_HEADERS })
}
