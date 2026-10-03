/**
 * Browser-only build of the renderer, backed by the in-memory demo data layer.
 * Used for portfolio screenshots and UI work without Electron or a data store:
 *   yarn dev:web   ->  http://localhost:5303
 */
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  plugins: [react()],
  css: { postcss: resolve(__dirname) },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  server: { port: 5303, strictPort: true },
  build: { outDir: resolve(__dirname, 'out/web'), emptyOutDir: true }
})
