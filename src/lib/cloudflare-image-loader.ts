export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (src.startsWith('http')) return src

  const params = [`width=${width}`, `quality=${quality ?? 80}`, 'format=auto']
  return `/cdn-cgi/image/${params.join(',')}/${src}`
}
