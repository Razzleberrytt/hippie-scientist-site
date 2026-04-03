import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type PackageJson = {
  version?: string
}

function getPackageVersion() {
  const packageJsonPath = path.resolve(__dirname, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson
  return packageJson.version ?? '0.0.0'
}

function getShortCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'nogit'
  }
}

const buildDateIso = new Date().toISOString()

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
  },
  define: {
    __APP_VERSION__: JSON.stringify(getPackageVersion()),
    __COMMIT_HASH__: JSON.stringify(getShortCommitHash()),
    __BUILD_DATE__: JSON.stringify(buildDateIso),
  },
})
