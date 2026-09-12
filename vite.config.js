import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-report.html',
      open: true,       // auto-opens the report in your browser after build
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        timeout: 60000
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600, // pdf/vendor chunks are intentionally split below; this just quiets noise for the rest
    rollupOptions: {
      output: {
        manualChunks: {
          // pdfjs-dist is the largest single dependency (and the source of the eval warning) —
          // isolate it so it's only downloaded on pages that actually render/parse PDFs
          'pdf-vendor': ['pdfjs-dist'],
          // group other heavy/stable vendor libs so they cache separately from your app code
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
});