const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const svgr = require('vite-plugin-svgr')
const { plugin: mdPlugin } = require('vite-plugin-markdown')

module.exports = defineConfig({
  plugins: [
    react(),
    svgr(),
    mdPlugin({
      mode: ['html', 'toc', 'react'],
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