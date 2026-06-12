// Injected by webpack DefinePlugin at build time. Undefined under Turbopack dev server.
declare const __BUILD_TIME__: string | undefined
declare const __APP_VERSION__: string | undefined
declare const __COMMIT_HASH__: string | undefined
declare const __BUILD_DATE__: string | undefined

interface Window {
  gtag?: (command: string, ...args: unknown[]) => void
  dataLayer?: unknown[]
}

// Allow side-effect CSS imports (globals, fonts, vendor stylesheets).
// Next.js handles the actual bundling; TypeScript only needs to know the
// import is valid, not what it exports.
declare module '*.css'
