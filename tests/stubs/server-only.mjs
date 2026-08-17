/**
 * Test stub for Next.js's `server-only` guard.
 *
 * `server-only` has no runtime behaviour: importing it makes a client bundle
 * fail to build, which is how modules like `lib/server/runtime-data.ts` and
 * `src/lib/research-matrices.ts` declare that they must never ship to the
 * browser. Next resolves it during a build; Vite does not, and the package is
 * not a direct dependency, so any test touching those modules failed to load
 * with "Failed to resolve import 'server-only'".
 *
 * Stubbing it keeps the production guard intact — the real import still exists
 * in the source and still fails a client build — while letting the server-side
 * logic be unit tested.
 */
export {}
