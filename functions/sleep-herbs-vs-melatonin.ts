type PagesFunctionContext = {
  request: Request
}

const TARGET_PATH = '/guides/compare/sleep-herbs-vs-melatonin/'

export const onRequest = async ({ request }: PagesFunctionContext): Promise<Response> => {
  const url = new URL(request.url)
  url.pathname = TARGET_PATH
  return Response.redirect(url.toString(), 301)
}
