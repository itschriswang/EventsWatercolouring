import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Served from the root of the custom domain (chriswangstudio.com), so the
// base path is '/'. (For a project site at itschriswang.github.io it would
// need to be '/EventsWatercolouring/'.)
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Multi-page build: the homepage plus the standalone /faq/ subpage.
    // Vite preserves faq/index.html's directory in the output, so it lands
    // at dist/faq/index.html — a real static file GitHub Pages can serve
    // directly at /faq/, no server-side rewrites required.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        faq: resolve(__dirname, 'faq/index.html'),
        corporate: resolve(__dirname, 'corporate/index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
})
