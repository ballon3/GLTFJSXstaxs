/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#f7f7f7',
          dark: '#0b0b0b',
        },
      },
    },
  },
  plugins: [],
};
