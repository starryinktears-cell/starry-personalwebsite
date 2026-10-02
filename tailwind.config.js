/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f1ea',
        paper2: '#ece8df',
        ink: '#1c1d1a',
        inkMuted: '#5e5f58',
        olive: '#626a4c',
        oliveDark: '#3a3f2d',
        ember: '#c8743a',
        night: '#0e0f0d',
        mist: '#ece8df',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { display: '0.08em' },
      boxShadow: { panel: '0 8px 30px rgba(34, 36, 31, 0.06)' },
    },
  },
  plugins: [],
}
