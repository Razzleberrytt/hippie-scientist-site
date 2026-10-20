// Cloudflare Pages Function: server-trusted country detection for GA4 default-on.
// No IP address or country is returned to the browser, stored, or sent to GA4.
// The country comes from the Cloudflare Request.cf metadata, never from a
// caller-controlled country header. Unknown/unsupported regions fail closed.
type CloudflareRequest = Request & { cf?: { country?: string } }

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  const country = (request as CloudflareRequest).cf?.country?.toUpperCase()
  return new Response(JSON.stringify({ defaultGa4Allowed: country === 'US' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, no-cache, max-age=0, must-revalidate',
      Vary: 'CF-IPCountry',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
