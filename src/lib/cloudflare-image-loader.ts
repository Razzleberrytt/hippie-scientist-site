/**
 * Serve the build-time WebP variant of a local image.
 *
 * This loader used to be a pass-through: it took `width` and `quality`, voided
 * both, and returned `src` unchanged. `next/image` therefore emitted no
 * `srcset` and no modern format, so every image shipped as its full-size
 * original — the Ashwagandha hero was a 263KB JPEG, 38% of that page's total
 * transfer, and it carries `priority`, so it preloaded and took critical-path
 * bandwidth away from the render-blocking CSS.
 *
 * Cloudflare's `/cdn-cgi/image/` proxy is still deliberately not used: it is a
 * paid per-zone opt-in that 404s in local and preview environments. Instead
 * `scripts/optimize-images.mjs` pre-renders WebP at each width below.
 *
 * This is a *client* module — `next.config.mjs` points `images.loaderFile` at
 * it, so whatever it imports ships in the browser bundle. An earlier version
 * imported the optimizer's 215-entry manifest to decide whether a variant
 * existed; webpack inlined that JSON into every chunk that touched an image,
 * putting ~17KB of duplicated data on the wire for a lookup the build can
 * guarantee statically. So the rule is expressed as a convention instead:
 * `optimize-images.mjs` walks every supported image under `public/images/` and
 * fails the build if any one of them fails to encode, which makes "a supported
 * source always has all three variants" an invariant rather than a guess.
 */

/** Mirrors `WIDTHS` in scripts/optimize-images.mjs. */
const WIDTHS = [400, 800, 1200] as const

/** Mirrors `SUPPORTED_EXTS` in scripts/optimize-images.mjs. */
const OPTIMIZED_EXTENSIONS = /\.(?:jpe?g|png|gif|avif|tiff|webp)$/i

function pickWidth(requested: number): number {
  for (const candidate of WIDTHS) {
    if (candidate >= requested) return candidate
  }
  return WIDTHS[WIDTHS.length - 1]
}

export default function cloudflareLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}) {
  // Remote images (Amazon product art) and anything already pointing at the
  // generated output are left alone; rewriting the latter would look for
  // `foo-400w-800w.webp`.
  if (!src.startsWith('/images/')) return src
  if (src.startsWith('/images/optimized/')) return src
  if (!OPTIMIZED_EXTENSIONS.test(src)) return src

  const withoutExtension = src.replace(/\.[^./]+$/, '')
  return `/images/optimized${withoutExtension.slice('/images'.length)}-${pickWidth(width)}w.webp`
}
