export const onRequest: PagesFunction = async () => {
  return new Response(null, {
    status: 308,
    headers: {
      Location: '/api/subscribe',
    },
  })
}
