# Hippie Scientist

Simple static website using vanilla JavaScript, HTML and Tailwind CSS.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Build CSS**

   Generates `css/style.css` from `css/tailwind.css`:

   ```bash
   npm run build
   ```

3. **Run the development server**

   ```bash
   npm start
   ```

   Visit `http://localhost:8080` in your browser. Navigate to a non-existent path to see the custom 404 page.

Whenever you change Tailwind or HTML, re-run `npm run build` to regenerate the compiled CSS.
