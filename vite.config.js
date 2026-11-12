import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/camping-viewer/',
  resolve: {
    // ⚠ Une seule copie de React, quoi qu'il arrive.
    //
    // Cette ligne vient du temps où `@aangee/cottet-plan-lib` apportait ses propres
    // peers React : le composant partagé en chargeait un, l'application un autre, et
    // les hooks levaient « Invalid hook call » — page blanche, diagnostic coûteux.
    //
    // Le viewer ne dépend plus d'aucun paquet partagé depuis le 2026-11-12 : le rendu
    // SVG vit dans src/plan/ et le vocabulaire arrive par src/contrat/. La ligne est
    // CONSERVÉE quand même — le jour où une dépendance réintroduit React, le symptôme
    // reviendrait à l'identique et coûterait le même temps.
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'plan_fond.png'],
      manifest: {
        name: 'Camping Cottet',
        short_name: 'Cottet',
        description: 'Consultation terrain — Camping Cottet',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/camping-viewer/',
        scope: '/camping-viewer/',
        icons: [
          { src: 'pwa-64x64.png',   sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // data.json est servi via runtimeCaching (NetworkFirst) pour que le bump
        // de schema_version cote producteur soit visible sans attendre un new SW.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/data\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'camping-data',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }
    })
  ]
})
