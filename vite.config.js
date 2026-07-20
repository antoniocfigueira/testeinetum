import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/testeinetum/' : '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['react-globe.gl', 'three'],
  },
  resolve: {
    dedupe: ['three'],
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
}))

