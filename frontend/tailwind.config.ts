/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        themeTeal: '#0B4B62',
        themeSkyBlue: '#0097D1',
        themeTealLight: '#558191',
        themeTealLighter: '#779BA8',
        themeTealWhite: '#F4F9FC',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        merriweather: ['var(--font-merriweather)', 'serif'],
      },
    },
  },
  plugins: [],
}