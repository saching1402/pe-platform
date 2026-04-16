/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          mid: '#132040',
          light: '#1e3058',
          card: '#162035',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c96a',
          dark: '#9a7a2e',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
