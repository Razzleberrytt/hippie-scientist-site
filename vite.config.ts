import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'thehippiescientist.net', // Change this for custom domain
  plugins: [react()],
});
