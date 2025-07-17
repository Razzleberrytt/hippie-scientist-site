# The Hippie Scientist

This project is a Vite + React + TypeScript site exploring herbal and psychedelic education. It uses Tailwind CSS for styling and framer-motion for animations.

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

## Contributing

Pull requests and issue reports are welcome. Please open an issue first if you would like to discuss a major change.
