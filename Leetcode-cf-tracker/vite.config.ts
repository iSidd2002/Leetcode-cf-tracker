import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  server: {
    proxy: {
      // External API proxies (for development) - must come before general /api rule
      '/api/potd': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/potd/, '/graphql'),
      },
      '/api/cf': {
        target: 'https://codeforces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cf/, '/api'),
      },
      '/api/leetcode': {
        target: 'https://leetcode.com/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/leetcode/, ''),
      },
      // Backend API proxy - must come after specific external API rules
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
