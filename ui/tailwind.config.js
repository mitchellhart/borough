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
      },
    },
  },
  plugins: [
  ],
}

