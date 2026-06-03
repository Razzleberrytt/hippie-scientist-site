# Import Boundaries

## Allowed Imports

- App/view code may import features, components, data helpers, and routes.
- Feature modules may import shared UI, data helpers, and routes.

## Disallowed Imports

- Shared UI must not import feature modules.
- `src/data` must not import app/view or feature modules.
- App code must not import scripts.

## Generated Data Access

- Generated JSON must be accessed through `src/data/runtime.ts` helpers.

## Future Enforcement

- Future enforcement can use ESLint import-boundary rules.

## Related Docs

- [SPEC-1: Hippie Scientist Rebuild](./SPEC-1-Hippie-Scientist-Rebuild.md)
- [Generated Data Policy](./generated-data-policy.md)
- [Contractor Onboarding](./contractor-onboarding.md)
