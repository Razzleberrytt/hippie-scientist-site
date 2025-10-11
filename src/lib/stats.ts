export function formatKpis({
  herbs,
  compounds,
  posts,
}: {
  herbs: number
  compounds: number
  posts: number
}) {
  return `${herbs}+ herbs · ${compounds}+ compounds · ${posts}+ articles`
}
