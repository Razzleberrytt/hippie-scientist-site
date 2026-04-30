# Legacy Cleanup Log

## 2026-04-30

- Removed `src/components/EmailCapture.tsx` from MVP active source to stop blocking checks on missing legacy form dependencies.
- Removed `src/components/ContextualLeadMagnet.tsx` in the same pass because it was the only active importer of `EmailCapture`.
- Did **not** recreate `@/hooks/useSubmissionForm` in this cleanup pass.
- Deferred form capture functionality for MVP; no backend integration, fake success flow, or hardcoded endpoint was added.
