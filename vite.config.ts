import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/hippie-scientist-site/', // GitHub Pages base path
  plugins: [react()],
});
