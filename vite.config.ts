import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@public': path.resolve(__dirname, './public'),
      '@assets': path.resolve(__dirname, './assets')
    }
  }
})
