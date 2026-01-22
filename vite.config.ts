import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GLTF JSX Staxs',
        short_name: 'GLTFJSX',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#fbbe31',
        // icons will be auto-generated
      },
      pwaAssets: {
        image: 'logo.png',
        preset: 'minimal-2023',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
