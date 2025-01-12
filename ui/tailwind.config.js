/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Nohemi-Light', 'sans-serif'],
      'nohemi': ['Nohemi', 'sans-serif'],
      'nohemi-bold': ['Nohemi-Bold', 'sans-serif'],
      'nohemi-light': ['Nohemi-Light', 'sans-serif'],
      'nohemi-regular': ['Nohemi-Regular', 'sans-serif'],
      'nohemi-medium': ['Nohemi-Medium', 'sans-serif'],
    },
    extend: {
      colors: {
        'surface': '#E6E2DD',
        'brand-orange': '#FFB252',
        'brand-green': '#395E44',
      },
      fontSize: {
      'xs': ['0.75rem', { letterSpacing: '0.06em' }],
      'sm': ['0.875rem', { letterSpacing: '0.06em' }],
      'base': ['1rem', { letterSpacing: '0.06em' }],
      'lg': ['1.125rem', { letterSpacing: '0.04em' }],
      'xl': ['1.25rem', { letterSpacing: '0.04em' }],
      '2xl': ['1.5rem', { letterSpacing: '0.03em' }],
      // ... add more sizes as needed
    },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addBase }) {
      addBase({
        'body': { letterSpacing: '0.03em' },
        'p, li, span': { letterSpacing: '0.03em' },
      })
    },
  ],
}

