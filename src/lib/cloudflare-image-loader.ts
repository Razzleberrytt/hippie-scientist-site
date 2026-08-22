import optimizedImages from '@/lib/generated/optimized-images.json'

/**
 * Serve the build-time WebP variant of a local image when one exists.
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
 * `scripts/optimize-images.mjs` pre-renders WebP at each width in `WIDTHS` and
 * records what it produced in `lib/generated/optimized-images.json`. A source
 * only gets rewritten if it is in that manifest, so an image that failed to
 * encode keeps serving its original rather than 404ing.
 */

const VARIANTS: Record<string, number[]> = optimizedImages

/** Mirrors `WIDTHS` in scripts/optimize-images.mjs. */
function pickWidth(available: readonly number[], requested: number): number {
  // Smallest variant that still covers the requested width; the largest
  // available if the request exceeds everything we generated.
  const covering = available.filter((candidate) => candidate >= requested)
  if (covering.length > 0) return Math.min(...covering)
  return Math.max(...available)
}

export default function cloudflareLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (src.startsWith('http') || src.startsWith('//')) return src

  const available = VARIANTS[src]
  if (!available || available.length === 0) return src

  const chosen = pickWidth(available, width)
  const withoutExtension = src.replace(/\.[^./]+$/, '')
  return `/images/optimized${withoutExtension.replace(/^\/images/, '')}-${chosen}w.webp`
}
