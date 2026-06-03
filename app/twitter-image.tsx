export const dynamic = 'force-static'

export const alt = 'The Hippie Scientist — herbs, compounds, and research notes'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/svg+xml'

export default function TwitterImage() {
  const svg = `
<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07111f"/>
      <stop offset="45%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#bg)"/>
  <text x="80" y="220" fill="#f8fafc" font-size="72" font-family="Arial, sans-serif" font-weight="700">The Hippie Scientist</text>
  <text x="80" y="290" fill="#cbd5e1" font-size="34" font-family="Arial, sans-serif">Herbs, compounds, and research notes in plain English.</text>
</svg>`.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
