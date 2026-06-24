import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (chriswangstudio.com), so the
// base path is '/'. (For a project site at itschriswang.github.io it would
// need to be '/EventsWatercolouring/'.)
export default defineConfig({
  base: '/',
  plugins: [react()],
})
