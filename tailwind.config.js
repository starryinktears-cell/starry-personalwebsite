/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f4ef',
        ink: '#242522',
        olive: '#626a4c',
        oliveDark: '#414733',
        mist: '#e8e5dc',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Arial', 'sans-serif'],
      },
      letterSpacing: { display: '0.08em' },
      boxShadow: { panel: '0 8px 30px rgba(34, 36, 31, 0.06)' },
    },
  },
  plugins: [],
}
