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

  // Cloudflare's `/cdn-cgi/image/` resizing proxy is a paid, per-zone opt-in
  // feature — it isn't guaranteed to be enabled, and 404s in local/preview
  // environments regardless. Serve local static assets directly instead of
  // routing every image through a proxy path that may not exist.
  void width
  void quality
  return src
}
