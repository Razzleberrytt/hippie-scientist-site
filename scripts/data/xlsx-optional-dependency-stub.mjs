// Test-only stub for the optional 'xlsx' package, which is not an installed
// dependency. It is only ever dynamically imported by the standalone CLI
// runner branch of build-interaction-data.mjs (guarded by
// `import.meta.url === file://process.argv[1]`), which never executes under
// Vitest — but Vite's static import analysis still needs the specifier to
// resolve, so vitest.config.ts aliases 'xlsx' to this stub for tests only.
export default {}
