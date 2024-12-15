/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'nohemi': ['Nohemi', 'sans-serif'],
      },
      colors: {
        'surface': '#E6E2DD',
        'brand-orange': '#FFB252',
        'brand-green': '#395E44',
        
      },
    },
  },
  plugins: [
  ],
}

