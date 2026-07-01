import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (chriswangstudio.com), so the
// base path is '/'. (For a project site at itschriswang.github.io it would
// need to be '/EventsWatercolouring/'.)
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Split the long-lived vendor libraries into their own chunks so a change
    // to app code doesn't bust the (larger, rarely-changing) framer-motion and
    // react caches. `ogl` is only referenced by the lazily-imported Aurora, so
    // Rollup keeps it in a separate async chunk that desktop visitors fetch
    // after first paint and everyone else never downloads.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
})
