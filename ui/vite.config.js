const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
import markdown from 'vite-plugin-markdown';

module.exports = defineConfig({
  plugins: [
    react(),
    markdown({
      mode: ['html', 'toc'],
      markdownIt: {
          html: true,
          linkify: true,
          typographer: true,
      },
  })
  ],
  assetsInclude: ['**/*.md'],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}) 