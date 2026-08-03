import { handleLegacyCompareRequest } from '../_shared/legacy-compare'

type PagesFunctionContext = {
  request: Request
}

export const onRequest = async ({ request }: PagesFunctionContext): Promise<Response> => {
  return handleLegacyCompareRequest(request, 'comparisons')
}
