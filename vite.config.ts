import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Scratch media may be locked by the native file picker on Windows.
    watch: { ignored: ['**/.goal/**'] },
  },
  preview: { port: 4173 },
})
