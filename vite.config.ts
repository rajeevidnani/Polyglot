import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
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
          description: 'Master words & sentences in 4 languages.',
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
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
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
