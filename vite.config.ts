import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function readSlugs(fileName: string, keys: string[]) {
  const filePath = path.resolve(__dirname, 'public', 'data', fileName)
  if (!fs.existsSync(filePath)) return []
  const rows = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Array<Record<string, unknown>>

  return rows
    .map(row => {
      const explicitSlug = String(row.slug || '').trim()
      if (explicitSlug) return explicitSlug
      for (const key of keys) {
        const raw = String(row[key] || '').trim()
        if (raw) return slugify(raw)
      }
      return ''
    })
    .filter(Boolean)
}

const herbSlugs = readSlugs('herbs.json', ['common', 'name', 'scientific'])
const compoundSlugs = readSlugs('compounds.json', ['name'])

const prerenderRoutes = [
  '/',
  '/herbs',
  '/compounds',
  '/blog',
  ...herbSlugs.map(slug => `/herbs/${slug}`),
  ...compoundSlugs.map(slug => `/compounds/${slug}`),
]

export default defineConfig(async () => {
  const plugins = [react()]

  try {
    const { default: prerender } = await import('vite-plugin-prerender')
    plugins.push(
      prerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: prerenderRoutes,
      })
    )
  } catch {
    console.warn('vite-plugin-prerender not installed; skipping prerender configuration')
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    base: '/',
  }
})
