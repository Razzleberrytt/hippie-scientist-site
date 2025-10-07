# The Hippie Scientist

this shit is always broke. This project is a Vite + React + TypeScript site exploring herbal and psychedelic education. It uses Tailwind CSS for styling and framer-motion for animations.

Recent updates introduced an expanded Learn section, a dedicated About page and a placeholder Store for future merchandise. The navigation bar was rebuilt for better responsiveness and easier access to these pages.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   ![Deploy Status](https://github.com/razzleberrytt/hippie-scientist-site/actions/workflows/pages/pages-build-deployment/badge.svg)

Additional scripts are available:

- `npm run build` – build the site for production
- `npm run preview` – preview the production build
- `npm run deploy` – publish the `dist/` folder to GitHub Pages
- `npm test` – placeholder script

## Project Structure

Source files live in `src/`. Pages are under `src/pages` and reusable components are in `src/components`. Production assets are generated into `dist/` during the build process.

## Features

- **Database** – interactive herbal index with tag filtering
- **Learn** – animated lessons with curated resources
- **Blog** – markdown-style posts served from the `posts` data file
- **Community & Safety** – guidelines for responsible exploration
- **Store** – upcoming merch and digital resources
- **Theming** – light/dark modes persisted with local storage
- **Bookmarks** – save favorite blog posts for later

## Educational Resources

This repository includes a variety of learning materials:

- Over twenty short articles in `src/data/posts.ts` on topics like neuroscience, cultural traditions and field research.
- A detailed herb database in `src/data/herbs/herbsData.ts` with pharmacology notes and images.
- Modular lessons and tutorials on the Learn page (`src/pages/Learn.tsx`).

## Potential Upgrades

- Add search and tag filters for blog posts.
- Allow users to bookmark herbs or lessons. _(Posts can already be bookmarked)_
- Integrate interactive quizzes from the Learn section.
- Enable offline access via a service worker.
- Expand the store with downloadable resources.

## Contributing

Pull requests and issue reports are welcome. Please open an issue first if you would like to discuss a major change.

### Data maintenance

- Refresh + validate dataset locally: `npm run data:refresh`
- Refresh + validate + build: `npm run data:refresh+build`

### Merging a patched dataset

- Download JSON from /data-report (Quick-Fill): `herbs_patched.json`
- Merge + validate:

  ```bash
  npm run data:merge -- herbs_patched.json
  npm run data:refresh
  ```

- One-liner (merge → convert/autofill/validate/audit):

  ```bash
  npm run data:merge+refresh -- herbs_patched.json
  ```

- Full rebuild after merge:

  ```bash
  npm run data:merge+build -- herbs_patched.json
  ```
