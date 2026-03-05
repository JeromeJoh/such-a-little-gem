import { defineConfig } from 'vite';

// ensure assets are referenced with the repository name when deployed to GitHub Pages
export default defineConfig({
  base: '/such-a-little-gem/'
});
