type PagesFunctionContext = {
  request: Request
}

function buildCompareTarget(request: Request, legacyPrefix: string): string {
  const url = new URL(request.url)
  const rest = url.pathname
    .replace(new RegExp(`^/${legacyPrefix}/?`), '')
    .replace(/^\/+|\/+$/g, '')

  url.pathname = rest ? `/guides/compare/${rest}/` : '/guides/compare/'
  return url.toString()
}

export const onRequest = async ({ request }: PagesFunctionContext): Promise<Response> => {
  return Response.redirect(buildCompareTarget(request, 'compare'), 301)
}
