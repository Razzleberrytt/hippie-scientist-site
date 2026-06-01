# Tailwind v4 Migration

Date: June 1, 2026

The official upgrade command was attempted:

```text
npx @tailwindcss/upgrade@next
```

It failed before modifying files because npm could not resolve `nanoid@^3.3.12`.
The migration was completed manually:

- Upgraded `tailwindcss` to v4.
- Added `@tailwindcss/postcss`.
- Replaced `@tailwind base/components/utilities` with `@import "tailwindcss"`.
- Moved project theme tokens into `app/globals.css` using `@theme`.
- Updated `postcss.config.js` to use `@tailwindcss/postcss`.
- Deleted `tailwind.config.ts`.

Breaking utility classes fixed: 0. The build completed without Tailwind utility
errors after the manual migration.
