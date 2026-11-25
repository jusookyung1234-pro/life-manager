export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fffdf8', 100: '#faf6ee', 200: '#f3ecdd', 300: '#e8dcc5' },
        lav: { 50: '#f6f3fc', 100: '#ebe5f8', 200: '#d9cff1', 300: '#c0b0e6', 400: '#a28fd6', 500: '#8671c2' },
        sky2: { 50: '#f1f7fc', 100: '#e0eefa', 200: '#c3ddf4', 300: '#9cc5ea', 400: '#74aadb', 500: '#538ec6' },
        ink: { DEFAULT: '#3d3a4b', soft: '#6d6a7c', mute: '#9e9bad' },
      },
      fontFamily: { sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 6px 24px -10px rgba(134,113,194,.25)' },
    },
  },
  plugins: [],
}
