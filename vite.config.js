import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site is served under /EventsWatercolouring/.
// Keeping the casing identical to the repo name so asset URLs resolve.
export default defineConfig({
  base: '/EventsWatercolouring/',
  plugins: [react()],
})
