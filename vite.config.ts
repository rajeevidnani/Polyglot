import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.jpg', 'icon.jpg'],
        manifest: {
          id: '/',
          name: 'Polyglot - Language Learning',
          short_name: 'Polyglot',
          description: 'Practise words and sentences in the languages your family speaks.',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            }
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
